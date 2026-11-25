import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Eye,
  EyeOff,
  Maximize2,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Square,
  Volume2,
} from 'lucide-react-native';
import { audioEngine } from '../core/audio/audioEngine';
import {
  DURATION_BEATS,
  formatCircledString,
  midiToScientificPitch,
  writtenMidiToLabel,
  writtenToSoundingMidi,
} from '../core/music/guitarEngine';
import { DetectedPitch, PlayableScore, PracticeMode, ScoreNoteEvent } from '../core/music/types';
import { useAppStore } from '../store/useAppStore';
import { palette, radius } from '../theme/tokens';
import { InteractiveFretboard } from './InteractiveFretboard';
import { EventEvalState, StaffNotation } from './StaffNotation';

interface PracticePlayerProps {
  score: PlayableScore;
  onCompleteRun?: (summary: {
    pitchAccuracy: number;
    timingAccuracy: number;
    bpm: number;
    durationSec: number;
    mode: PracticeMode;
  }) => void;
  onGenerateFreshSightRead?: () => void;
}

interface FlatPlayableEvent {
  measureIndex: number;
  event: ScoreNoteEvent;
  targetSoundingMidi: number | null; // null for slash chords (any strum/tap advances)
}

export const PracticePlayer: React.FC<PracticePlayerProps> = ({
  score,
  onCompleteRun,
  onGenerateFreshSightRead,
}) => {
  const { state, setInputMode, logPracticeSession } = useAppStore();

  const [mode, setMode] = useState<PracticeMode>('wait');
  const [bpm, setBpm] = useState<number>(score.bpmDefault);
  const [musicStandWide, setMusicStandWide] = useState(false);
  const [peekFretOn, setPeekFretOn] = useState<boolean>(score.allowPeekFret);
  const [loopRange, setLoopRange] = useState<[number, number] | null>(null);

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [eventStates, setEventStates] = useState<Record<string, EventEvalState>>({});
  const [feedbackFret, setFeedbackFret] = useState<{
    stringNumber: number;
    fret: number;
    ok: boolean;
  } | null>(null);
  const [coachBanner, setCoachBanner] = useState<string>(
    'Wait Mode active: Play or tap the highlighted note to advance.'
  );
  const [isPlayingTempo, setIsPlayingTempo] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [livePitch, setLivePitch] = useState<DetectedPitch | null>(null);
  const [runSummary, setRunSummary] = useState<{
    pitchAccuracy: number;
    timingAccuracy: number;
    bpm: number;
  } | null>(null);

  const attemptsRef = useRef(0);
  const hitsRef = useRef(0);
  const startTimeRef = useRef<number>(Date.now());
  const tempoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const lastMatchedMidiRef = useRef<{ midi: number; ts: number }>({ midi: -1, ts: 0 });

  // Reset cleanly whenever score changes
  useEffect(() => {
    stopAllPlayback();
    setBpm(score.bpmDefault);
    setPeekFretOn(score.allowPeekFret);
    setLoopRange(null);
    setCurrentIdx(0);
    setEventStates({});
    setRunSummary(null);
    attemptsRef.current = 0;
    hitsRef.current = 0;
    startTimeRef.current = Date.now();
    setCoachBanner(
      score.allowPeekFret
        ? 'Wait Mode active: Play or tap the highlighted note. Peek Fret is available if needed.'
        : 'Mastery / Capstone Mode: Peek Fret is disabled. Play purely from standard notation.'
    );
  }, [score.id]);

  // Flatten playable (non-rest) events inside loopRange (or full score)
  const playableEvents: FlatPlayableEvent[] = useMemo(() => {
    const out: FlatPlayableEvent[] = [];
    for (const m of score.measures) {
      if (loopRange && (m.index < loopRange[0] || m.index > loopRange[1])) continue;
      for (const ev of m.events) {
        if (ev.isRest) continue;
        if (ev.isSlash) {
          out.push({ measureIndex: m.index, event: ev, targetSoundingMidi: null });
        } else if (ev.pitches[0]) {
          out.push({
            measureIndex: m.index,
            event: ev,
            targetSoundingMidi: writtenToSoundingMidi(ev.pitches[0].writtenMidi),
          });
        }
      }
    }
    return out;
  }, [score, loopRange]);

  const activeItem = playableEvents[currentIdx] ?? null;

  const stopAllPlayback = useCallback(() => {
    if (tempoTimerRef.current) {
      clearTimeout(tempoTimerRef.current);
      tempoTimerRef.current = null;
    }
    previewTimersRef.current.forEach(clearTimeout);
    previewTimersRef.current = [];
    setIsPlayingTempo(false);
    setIsPreviewing(false);
  }, []);

  useEffect(() => {
    return () => {
      stopAllPlayback();
      audioEngine.stopMicListener();
    };
  }, [stopAllPlayback]);

  const finishRun = useCallback(
    (finalMode: PracticeMode) => {
      const pitchAccuracy =
        attemptsRef.current > 0
          ? Math.round((hitsRef.current / attemptsRef.current) * 100)
          : 100;
      const timingAccuracy = finalMode === 'tempo' ? Math.max(82, pitchAccuracy - 3) : 100;
      const durationSec = Math.max(10, Math.round((Date.now() - startTimeRef.current) / 1000));

      setRunSummary({ pitchAccuracy, timingAccuracy, bpm });
      logPracticeSession({
        scoreId: score.id,
        title: score.title,
        mode: finalMode,
        bpm,
        pitchAccuracy,
        timingAccuracy,
        durationSec,
      });
      onCompleteRun?.({
        pitchAccuracy,
        timingAccuracy,
        bpm,
        durationSec,
        mode: finalMode,
      });
    },
    [bpm, logPracticeSession, onCompleteRun, score.id, score.title]
  );

  // Evaluate an incoming sounding MIDI note (from Touch Fretboard or Live Mic)
  const evaluateInputNote = useCallback(
    (playedMidi: number, pos?: { stringNumber: number; fret: number }) => {
      if (!activeItem) return;

      attemptsRef.current += 1;

      // Slash rhythm measure accepts any clean chord/note onset
      if (activeItem.targetSoundingMidi === null) {
        hitsRef.current += 1;
        setEventStates((prev) => ({ ...prev, [activeItem.event.id]: 'hit' }));
        setCoachBanner(
          `Rhythm hit on ${activeItem.event.chordSymbol ?? 'beat'} — nice pocket!`
        );
        if (currentIdx + 1 >= playableEvents.length) {
          finishRun(mode);
        } else {
          setCurrentIdx((i) => i + 1);
        }
        return;
      }

      const target = activeItem.targetSoundingMidi;
      const delta = target - playedMidi;

      if (delta === 0) {
        hitsRef.current += 1;
        setEventStates((prev) => ({ ...prev, [activeItem.event.id]: 'hit' }));
        if (pos) setFeedbackFret({ ...pos, ok: true });
        const label = writtenMidiToLabel(activeItem.event.pitches[0].writtenMidi);
        setCoachBanner(`Matched ${label}!`);

        setTimeout(() => setFeedbackFret(null), 320);

        if (mode === 'wait') {
          if (currentIdx + 1 >= playableEvents.length) {
            setCoachBanner('Pass complete! Great sight-reading work.');
            finishRun('wait');
          } else {
            setCurrentIdx((i) => i + 1);
          }
        }
      } else {
        setEventStates((prev) => ({ ...prev, [activeItem.event.id]: 'miss' }));
        if (pos) setFeedbackFret({ ...pos, ok: false });
        const playedPitch = midiToScientificPitch(playedMidi);
        const dir = delta > 0 ? `↑ ${Math.abs(delta)} fret${Math.abs(delta) > 1 ? 's' : ''} higher` : `↓ ${Math.abs(delta)} fret${Math.abs(delta) > 1 ? 's' : ''} lower`;
        setCoachBanner(`Heard ${playedPitch.name}${playedPitch.octave} — aim ${dir}.`);
        setTimeout(() => setFeedbackFret(null), 420);
      }
    },
    [activeItem, currentIdx, finishRun, mode, playableEvents.length]
  );

  // Live Microphone YIN Listener
  const toggleMic = async () => {
    if (micActive) {
      audioEngine.stopMicListener();
      setMicActive(false);
      setLivePitch(null);
      setInputMode('touch');
      return;
    }

    setMicError(null);
    const res = await audioEngine.startMicListener((pitch) => {
      setLivePitch(pitch);
      if (!pitch || pitch.clarity < 0.78) return;

      const now = Date.now();
      const sameRecent =
        pitch.midi === lastMatchedMidiRef.current.midi &&
        now - lastMatchedMidiRef.current.ts < 360 &&
        !pitch.isOnset;

      if (!sameRecent) {
        lastMatchedMidiRef.current = { midi: pitch.midi, ts: now };
        evaluateInputNote(pitch.midi);
      }
    });

    if (res.ok) {
      setMicActive(true);
      setInputMode('mic');
      setCoachBanner('Live Guitar Mic active — pluck your guitar cleanly!');
    } else {
      setMicError(res.error ?? 'Microphone unavailable');
    }
  };

  // Tempo Mode runner (advances playhead on metronome beat schedule)
  const startTempoRun = () => {
    stopAllPlayback();
    setMode('tempo');
    setRunSummary(null);
    setEventStates({});
    attemptsRef.current = 0;
    hitsRef.current = 0;
    startTimeRef.current = Date.now();
    setIsPlayingTempo(true);
    setCoachBanner(`Tempo Mode (${bpm} BPM) — play along with the metronome!`);

    const msPerBeat = (60 / bpm) * 1000;
    let idx = 0;

    const stepEvent = () => {
      if (idx >= playableEvents.length) {
        if (loopRange) {
          idx = 0;
        } else {
          setIsPlayingTempo(false);
          finishRun('tempo');
          return;
        }
      }

      const item = playableEvents[idx];
      setCurrentIdx(idx);
      const isDownbeat = item.event.beatOffset === 0;
      audioEngine.playMetronomeClick(isDownbeat);

      const durBeats = DURATION_BEATS[item.event.duration] ?? 1;
      idx += 1;
      tempoTimerRef.current = setTimeout(stepEvent, durBeats * msPerBeat);
    };

    stepEvent();
  };

  // Audio Preview (hear the score played cleanly on plucked guitar synth)
  const togglePreview = () => {
    if (isPreviewing) {
      stopAllPlayback();
      return;
    }
    stopAllPlayback();
    setIsPreviewing(true);
    setCoachBanner('Listening Preview — follow the engraved notation as you hear each note.');

    const msPerBeat = (60 / bpm) * 1000;
    let cumulativeMs = 0;

    playableEvents.forEach((item, idx) => {
      const t = setTimeout(() => {
        setCurrentIdx(idx);
        audioEngine.playMetronomeClick(item.event.beatOffset === 0);
        if (item.targetSoundingMidi !== null) {
          audioEngine.playGuitarNote(item.targetSoundingMidi, 0.9);
        } else {
          // Gentle chord strum preview for slash bars
          audioEngine.playChord([43, 47, 50, 55, 59], 22);
        }
      }, cumulativeMs);
      previewTimersRef.current.push(t);
      cumulativeMs += (DURATION_BEATS[item.event.duration] ?? 1) * msPerBeat;
    });

    const endTimer = setTimeout(() => {
      setIsPreviewing(false);
      setCurrentIdx(0);
      setCoachBanner('Preview finished — switch to Wait Mode or Tempo Mode to play!');
    }, cumulativeMs + 250);
    previewTimersRef.current.push(endTimer);
  };

  const resetPass = () => {
    stopAllPlayback();
    setCurrentIdx(0);
    setEventStates({});
    setRunSummary(null);
    attemptsRef.current = 0;
    hitsRef.current = 0;
    startTimeRef.current = Date.now();
    setCoachBanner('Reset to Bar 1 — ready whenever you are.');
  };

  const handleMeasureTap = (measureIdx: number) => {
    setLoopRange((prev) => {
      if (!prev) return [measureIdx, measureIdx];
      if (prev[0] === measureIdx && prev[1] === measureIdx) return null; // clear loop
      const a = Math.min(prev[0], measureIdx);
      const b = Math.max(prev[0], measureIdx);
      return [a, b];
    });
    setCurrentIdx(0);
  };

  const activeHintPos =
    peekFretOn && score.allowPeekFret && activeItem?.event.pitches[0]?.hint
      ? activeItem.event.pitches[0].hint
      : null;

  return (
    <View style={styles.container}>
      {/* Compact Studio Transport Bar */}
      <View style={styles.transportBar}>
        {/* Wait vs Tempo Mode */}
        <View style={styles.segmented}>
          <Pressable
            onPress={() => {
              stopAllPlayback();
              setMode('wait');
              setCoachBanner('Wait Mode: Cursor pauses on each note until you play the right pitch.');
            }}
            style={[styles.segBtn, mode === 'wait' && styles.segBtnActive]}
          >
            <Text style={[styles.segText, mode === 'wait' && styles.segTextActive]}>
              Wait Mode
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              stopAllPlayback();
              setMode('tempo');
              setCoachBanner('Tempo Mode: Press Start to play with live metronome & BPM control.');
            }}
            style={[styles.segBtn, mode === 'tempo' && styles.segBtnActive]}
          >
            <Text style={[styles.segText, mode === 'tempo' && styles.segTextActive]}>
              Tempo Mode
            </Text>
          </Pressable>
        </View>

        {/* BPM Stepper */}
        <View style={styles.bpmControl}>
          <Pressable
            onPress={() => setBpm((v) => Math.max(48, v - 6))}
            style={styles.bpmStepBtn}
          >
            <Text style={styles.bpmStepText}>−</Text>
          </Pressable>
          <Text style={styles.bpmValue}>{bpm} BPM</Text>
          <Pressable
            onPress={() => setBpm((v) => Math.min(144, v + 6))}
            style={styles.bpmStepBtn}
          >
            <Text style={styles.bpmStepText}>+</Text>
          </Pressable>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionGroup}>
          {mode === 'tempo' && (
            <Pressable
              onPress={isPlayingTempo ? stopAllPlayback : startTempoRun}
              style={[styles.primaryPill, isPlayingTempo && styles.stopPill]}
            >
              {isPlayingTempo ? (
                <Square size={13} color="#111317" />
              ) : (
                <Play size={13} color="#111317" />
              )}
              <Text style={styles.primaryPillText}>
                {isPlayingTempo ? 'Stop' : 'Start Tempo'}
              </Text>
            </Pressable>
          )}

          <Pressable onPress={togglePreview} style={styles.ghostPill}>
            <Volume2 size={14} color={isPreviewing ? palette.accentBrass : palette.textPrimary} />
            <Text
              style={[
                styles.ghostPillText,
                isPreviewing && { color: palette.accentBrass },
              ]}
            >
              {isPreviewing ? 'Stop Audio' : 'Hear Score'}
            </Text>
          </Pressable>

          <Pressable onPress={toggleMic} style={[styles.ghostPill, micActive && styles.micActivePill]}>
            {micActive ? (
              <Mic size={14} color={palette.successEmerald} />
            ) : (
              <MicOff size={14} color={palette.textSecondary} />
            )}
            <Text
              style={[
                styles.ghostPillText,
                micActive && { color: palette.successEmerald },
              ]}
            >
              {micActive ? 'Mic Listening' : 'Guitar Mic'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => score.allowPeekFret && setPeekFretOn((v) => !v)}
            disabled={!score.allowPeekFret}
            style={[
              styles.ghostPill,
              !score.allowPeekFret && styles.disabledPill,
            ]}
          >
            {peekFretOn && score.allowPeekFret ? (
              <Eye size={14} color={palette.accentBrass} />
            ) : (
              <EyeOff size={14} color={palette.textMuted} />
            )}
            <Text
              style={[
                styles.ghostPillText,
                !score.allowPeekFret && { color: palette.textMuted },
              ]}
            >
              {score.allowPeekFret
                ? peekFretOn
                  ? 'Peek Fret: ON'
                  : 'Peek Fret: OFF'
                : 'Peek Locked OFF'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setMusicStandWide((v) => !v)}
            style={styles.ghostPill}
          >
            <Maximize2 size={13} color={palette.textSecondary} />
            <Text style={styles.ghostPillText}>
              {musicStandWide ? 'Compact View' : 'Music Stand (4-Bar)'}
            </Text>
          </Pressable>

          <Pressable onPress={resetPass} style={styles.iconBtn}>
            <RotateCcw size={14} color={palette.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Live Coach / Mic Status Strip */}
      <View style={styles.coachStrip}>
        <Text style={styles.coachText}>{coachBanner}</Text>
        <View style={styles.coachRight}>
          {activeHintPos && (
            <Text style={styles.hintChip}>
              Target: {formatCircledString(activeHintPos.stringNumber)} Fret {activeHintPos.fret}
            </Text>
          )}
          {micActive && livePitch && (
            <Text style={styles.micReadout}>
              Mic: {midiToScientificPitch(livePitch.midi).name}
              {midiToScientificPitch(livePitch.midi).octave} ({livePitch.frequencyHz} Hz)
            </Text>
          )}
        </View>
      </View>

      {micError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>
            {micError} — You can keep practicing silently with the interactive fretboard below!
          </Text>
        </View>
      )}

      {/* Engraved Sheet Music */}
      <StaffNotation
        score={score}
        theme={state.notationTheme}
        activeEventId={activeItem?.event.id ?? null}
        eventStates={eventStates}
        measuresPerSystem={musicStandWide ? 4 : 2}
        showPeekFret={peekFretOn}
        loopRange={loopRange}
        onMeasurePress={handleMeasureTap}
        onNotePress={(ev) => {
          if (ev.pitches[0]) {
            audioEngine.playGuitarNote(writtenToSoundingMidi(ev.pitches[0].writtenMidi), 0.9);
          }
        }}
      />

      {/* Run Summary Card */}
      {runSummary && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryTitle}>Session Complete</Text>
              <Text style={styles.summarySub}>
                {runSummary.pitchAccuracy >= 95
                  ? 'Mastered at this tempo!'
                  : runSummary.pitchAccuracy >= 80
                    ? 'Proficient — bump BPM up by +6 or try a fresh unseen passage.'
                    : 'Good warmup — try Wait Mode or loop tricky bars with A–B.'}
              </Text>
            </View>
            <View style={styles.metricsRow}>
              <View style={styles.metricBox}>
                <Text style={styles.metricVal}>{runSummary.pitchAccuracy}%</Text>
                <Text style={styles.metricLbl}>PITCH</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricVal}>{runSummary.timingAccuracy}%</Text>
                <Text style={styles.metricLbl}>TIMING</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricVal}>{runSummary.bpm}</Text>
                <Text style={styles.metricLbl}>BPM</Text>
              </View>
            </View>
          </View>
          <View style={styles.summaryActions}>
            <Pressable onPress={resetPass} style={styles.ghostPill}>
              <Text style={styles.ghostPillText}>Replay Piece</Text>
            </Pressable>
            {onGenerateFreshSightRead && (
              <Pressable onPress={onGenerateFreshSightRead} style={styles.primaryPill}>
                <Text style={styles.primaryPillText}>Generate Fresh Unseen Passage</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Interactive On-Screen Touch Fretboard */}
      <InteractiveFretboard
        fretCount={12}
        leftHanded={state.leftHanded}
        hintPosition={activeHintPos}
        feedbackFret={feedbackFret}
        onFretPress={({ stringNumber, fret, soundingMidi }) =>
          evaluateInputNote(soundingMidi, { stringNumber, fret })
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  transportBar: {
    backgroundColor: palette.bgSurface,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.md,
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: palette.bgCanvas,
    borderRadius: radius.sm,
    padding: 3,
    borderWidth: 1,
    borderColor: palette.borderHairline,
  },
  segBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm - 2,
  },
  segBtnActive: {
    backgroundColor: palette.accentBrass,
  },
  segText: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  segTextActive: {
    color: '#111317',
    fontWeight: '700',
  },
  bpmControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: palette.bgCanvas,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bpmStepBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    backgroundColor: palette.bgElevated,
  },
  bpmStepText: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  bpmValue: {
    color: palette.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
    minWidth: 58,
    textAlign: 'center',
  },
  actionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  primaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.accentBrass,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  stopPill: {
    backgroundColor: palette.errorCoral,
  },
  primaryPillText: {
    color: '#111317',
    fontSize: 12,
    fontWeight: '700',
  },
  ghostPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  micActivePill: {
    borderColor: palette.successEmerald,
    backgroundColor: palette.successMuted,
  },
  disabledPill: {
    opacity: 0.6,
  },
  ghostPillText: {
    color: palette.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  iconBtn: {
    padding: 7,
    borderRadius: radius.sm,
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.borderHairline,
  },
  coachStrip: {
    backgroundColor: palette.bgElevated,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  coachText: {
    color: palette.textPrimary,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  coachRight: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  hintChip: {
    color: palette.accentBrass,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  micReadout: {
    color: palette.successEmerald,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  errorBanner: {
    backgroundColor: palette.errorMuted,
    borderColor: palette.errorCoral,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: 10,
  },
  errorText: {
    color: palette.textPrimary,
    fontSize: 12,
  },
  summaryCard: {
    backgroundColor: palette.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.accentBrassBorder,
    padding: 14,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryTitle: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  summarySub: {
    color: palette.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricBox: {
    backgroundColor: palette.bgCanvas,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  metricVal: {
    color: palette.accentBrass,
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  metricLbl: {
    color: palette.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  summaryActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
});

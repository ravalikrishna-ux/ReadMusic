import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Eye,
  EyeOff,
  Maximize2,
  Mic,
  MicOff,
  Play,
  Repeat,
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
  targetSoundingMidi: number | null;
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
  const [showLoopPicker, setShowLoopPicker] = useState(false);
  const [loopRange, setLoopRange] = useState<[number, number] | null>(null);

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [eventStates, setEventStates] = useState<Record<string, EventEvalState>>({});
  const [feedbackFret, setFeedbackFret] = useState<{
    stringNumber: number;
    fret: number;
    ok: boolean;
  } | null>(null);
  const [statusPrompt, setStatusPrompt] = useState<string>('Play the gold note');
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

  useEffect(() => {
    stopAllPlayback();
    setBpm(score.bpmDefault);
    setPeekFretOn(score.allowPeekFret);
    setLoopRange(null);
    setShowLoopPicker(false);
    setCurrentIdx(0);
    setEventStates({});
    setRunSummary(null);
    attemptsRef.current = 0;
    hitsRef.current = 0;
    startTimeRef.current = Date.now();
    setStatusPrompt(score.allowPeekFret ? 'Tap or play the gold note' : 'Pure sheet reading — no hints');
  }, [score.id]);

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
      onCompleteRun?.({ pitchAccuracy, timingAccuracy, bpm, durationSec, mode: finalMode });
    },
    [bpm, logPracticeSession, onCompleteRun, score.id, score.title]
  );

  const evaluateInputNote = useCallback(
    (playedMidi: number, pos?: { stringNumber: number; fret: number }) => {
      if (!activeItem) return;
      attemptsRef.current += 1;

      if (activeItem.targetSoundingMidi === null) {
        hitsRef.current += 1;
        setEventStates((prev) => ({ ...prev, [activeItem.event.id]: 'hit' }));
        setStatusPrompt(`Nice strum (${activeItem.event.chordSymbol ?? 'beat'}) ✓`);
        if (currentIdx + 1 >= playableEvents.length) finishRun(mode);
        else setCurrentIdx((i) => i + 1);
        return;
      }

      const delta = activeItem.targetSoundingMidi - playedMidi;

      if (delta === 0) {
        hitsRef.current += 1;
        setEventStates((prev) => ({ ...prev, [activeItem.event.id]: 'hit' }));
        if (pos) setFeedbackFret({ ...pos, ok: true });
        const label = writtenMidiToLabel(activeItem.event.pitches[0].writtenMidi);
        setStatusPrompt(`Matched ${label} ✓`);
        setTimeout(() => setFeedbackFret(null), 300);

        if (mode === 'wait') {
          if (currentIdx + 1 >= playableEvents.length) {
            setStatusPrompt('All done! Great work.');
            finishRun('wait');
          } else {
            setCurrentIdx((i) => i + 1);
          }
        }
      } else {
        setEventStates((prev) => ({ ...prev, [activeItem.event.id]: 'miss' }));
        if (pos) setFeedbackFret({ ...pos, ok: false });
        const dir = delta > 0 ? `Try ${Math.abs(delta)} higher ↑` : `Try ${Math.abs(delta)} lower ↓`;
        setStatusPrompt(dir);
        setTimeout(() => setFeedbackFret(null), 400);
      }
    },
    [activeItem, currentIdx, finishRun, mode, playableEvents.length]
  );

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
      setStatusPrompt('Listening to your guitar...');
    } else {
      setMicError(res.error ?? 'Mic unavailable');
    }
  };

  const startTempoRun = () => {
    stopAllPlayback();
    setMode('tempo');
    setRunSummary(null);
    setEventStates({});
    attemptsRef.current = 0;
    hitsRef.current = 0;
    startTimeRef.current = Date.now();
    setIsPlayingTempo(true);
    setStatusPrompt(`Playing at ${bpm} BPM`);

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
      audioEngine.playMetronomeClick(item.event.beatOffset === 0);
      const durBeats = DURATION_BEATS[item.event.duration] ?? 1;
      idx += 1;
      tempoTimerRef.current = setTimeout(stepEvent, durBeats * msPerBeat);
    };
    stepEvent();
  };

  const togglePreview = () => {
    if (isPreviewing) {
      stopAllPlayback();
      return;
    }
    stopAllPlayback();
    setIsPreviewing(true);
    setStatusPrompt('Listening to preview...');

    const msPerBeat = (60 / bpm) * 1000;
    let cumulativeMs = 0;

    playableEvents.forEach((item, idx) => {
      const t = setTimeout(() => {
        setCurrentIdx(idx);
        audioEngine.playMetronomeClick(item.event.beatOffset === 0);
        if (item.targetSoundingMidi !== null) {
          audioEngine.playGuitarNote(item.targetSoundingMidi, 0.9);
        } else {
          audioEngine.playChord([43, 47, 50, 55, 59], 22);
        }
      }, cumulativeMs);
      previewTimersRef.current.push(t);
      cumulativeMs += (DURATION_BEATS[item.event.duration] ?? 1) * msPerBeat;
    });

    const endTimer = setTimeout(() => {
      setIsPreviewing(false);
      setCurrentIdx(0);
      setStatusPrompt('Your turn — play the gold note');
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
    setStatusPrompt('Tap or play the gold note');
  };

  const handleMeasureTap = (measureIdx: number) => {
    setLoopRange((prev) => {
      if (!prev) return [measureIdx, measureIdx];
      if (prev[0] === measureIdx && prev[1] === measureIdx) return null;
      return [Math.min(prev[0], measureIdx), Math.max(prev[0], measureIdx)];
    });
    setCurrentIdx(0);
  };

  const activeHintPos =
    peekFretOn && score.allowPeekFret && activeItem?.event.pitches[0]?.hint
      ? activeItem.event.pitches[0].hint
      : null;

  return (
    <View style={styles.container}>
      {/* Single Clean Control Bar */}
      <View style={styles.controlBar}>
        {/* Mode Switch */}
        <View style={styles.segmented}>
          <Pressable
            onPress={() => {
              stopAllPlayback();
              setMode('wait');
              setStatusPrompt('Tap or play the gold note');
            }}
            style={[styles.segBtn, mode === 'wait' && styles.segBtnActive]}
          >
            <Text style={[styles.segText, mode === 'wait' && styles.segTextActive]}>Wait</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              stopAllPlayback();
              setMode('tempo');
              setStatusPrompt('Press Start for metronome');
            }}
            style={[styles.segBtn, mode === 'tempo' && styles.segBtnActive]}
          >
            <Text style={[styles.segText, mode === 'tempo' && styles.segTextActive]}>Tempo</Text>
          </Pressable>
        </View>

        {/* Primary Play / Listen */}
        {mode === 'tempo' ? (
          <Pressable
            onPress={isPlayingTempo ? stopAllPlayback : startTempoRun}
            style={[styles.primaryBtn, isPlayingTempo && styles.stopBtn]}
          >
            {isPlayingTempo ? <Square size={13} color="#111317" /> : <Play size={13} color="#111317" />}
            <Text style={styles.primaryBtnText}>{isPlayingTempo ? 'Stop' : 'Start'}</Text>
          </Pressable>
        ) : null}

        <Pressable onPress={togglePreview} style={styles.pillBtn}>
          <Volume2 size={14} color={isPreviewing ? palette.accentBrass : palette.textPrimary} />
          <Text style={[styles.pillText, isPreviewing && { color: palette.accentBrass }]}>
            {isPreviewing ? 'Stop' : 'Listen'}
          </Text>
        </Pressable>

        {/* Compact BPM */}
        <View style={styles.bpmBox}>
          <Pressable onPress={() => setBpm((v) => Math.max(48, v - 6))} style={styles.bpmBtn}>
            <Text style={styles.bpmBtnTxt}>−</Text>
          </Pressable>
          <Text style={styles.bpmVal}>{bpm}</Text>
          <Pressable onPress={() => setBpm((v) => Math.min(144, v + 6))} style={styles.bpmBtn}>
            <Text style={styles.bpmBtnTxt}>+</Text>
          </Pressable>
        </View>

        {/* Secondary Utility Icons */}
        <View style={styles.iconGroup}>
          <Pressable
            onPress={toggleMic}
            accessibilityLabel="Toggle guitar microphone"
            style={[styles.iconPill, micActive && styles.micOn]}
          >
            {micActive ? (
              <Mic size={15} color={palette.successEmerald} />
            ) : (
              <MicOff size={15} color={palette.textSecondary} />
            )}
            <Text style={[styles.iconPillText, micActive && { color: palette.successEmerald }]}>
              Mic
            </Text>
          </Pressable>

          <Pressable
            onPress={() => score.allowPeekFret && setPeekFretOn((v) => !v)}
            disabled={!score.allowPeekFret}
            style={[styles.iconPill, !score.allowPeekFret && { opacity: 0.45 }]}
          >
            {peekFretOn && score.allowPeekFret ? (
              <Eye size={15} color={palette.accentBrass} />
            ) : (
              <EyeOff size={15} color={palette.textMuted} />
            )}
            <Text style={styles.iconPillText}>
              {score.allowPeekFret ? (peekFretOn ? 'Hint' : 'No Hint') : 'No Hint'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setShowLoopPicker((v) => !v)}
            style={[styles.iconBtn, (showLoopPicker || loopRange) && styles.iconBtnActive]}
            accessibilityLabel="Loop bars"
          >
            <Repeat size={15} color={showLoopPicker || loopRange ? palette.accentBrass : palette.textSecondary} />
          </Pressable>

          <Pressable
            onPress={() => setMusicStandWide((v) => !v)}
            style={[styles.iconBtn, musicStandWide && styles.iconBtnActive]}
            accessibilityLabel="Wide view"
          >
            <Maximize2 size={15} color={musicStandWide ? palette.accentBrass : palette.textSecondary} />
          </Pressable>

          <Pressable onPress={resetPass} style={styles.iconBtn} accessibilityLabel="Restart">
            <RotateCcw size={15} color={palette.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Sheet Music */}
      <StaffNotation
        score={score}
        theme={state.notationTheme}
        activeEventId={activeItem?.event.id ?? null}
        eventStates={eventStates}
        measuresPerSystem={musicStandWide ? 4 : 2}
        showPeekFret={peekFretOn}
        showLoopPicker={showLoopPicker}
        loopRange={loopRange}
        onMeasurePress={handleMeasureTap}
        onNotePress={(ev) => {
          if (ev.pitches[0]) {
            audioEngine.playGuitarNote(writtenToSoundingMidi(ev.pitches[0].writtenMidi), 0.9);
          }
        }}
      />

      {/* Crisp 1-Line Live Cue */}
      <View style={styles.cueBar}>
        <Text style={styles.cueText}>{statusPrompt}</Text>
        <View style={styles.cueRight}>
          {activeHintPos && (
            <Text style={styles.cueHint}>
              {formatCircledString(activeHintPos.stringNumber)} Fret {activeHintPos.fret}
            </Text>
          )}
          {micActive && livePitch && (
            <Text style={styles.cueMic}>
              {midiToScientificPitch(livePitch.midi).name}
              {midiToScientificPitch(livePitch.midi).octave}
            </Text>
          )}
        </View>
      </View>

      {micError && <Text style={styles.errText}>{micError} — tap the fretboard below instead.</Text>}

      {/* Clean Session Complete Card */}
      {runSummary && (
        <View style={styles.doneCard}>
          <View style={styles.doneTop}>
            <Text style={styles.doneTitle}>
              {runSummary.pitchAccuracy >= 90 ? 'Nailed it!' : 'Nice run!'}
            </Text>
            <Text style={styles.doneStats}>
              {runSummary.pitchAccuracy}% accuracy · {runSummary.bpm} BPM
            </Text>
          </View>
          <View style={styles.doneActions}>
            <Pressable onPress={resetPass} style={styles.pillBtn}>
              <Text style={styles.pillText}>Play Again</Text>
            </Pressable>
            {onGenerateFreshSightRead && (
              <Pressable onPress={onGenerateFreshSightRead} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Try a New One →</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Interactive Touch Fretboard */}
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
  container: { gap: 12 },
  controlBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: palette.bgSurface,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.md,
    padding: 8,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: palette.bgCanvas,
    borderRadius: radius.sm,
    padding: 3,
  },
  segBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  segBtnActive: { backgroundColor: palette.accentBrass },
  segText: { color: palette.textSecondary, fontSize: 12, fontWeight: '700' },
  segTextActive: { color: '#111317' },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.accentBrass,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  stopBtn: { backgroundColor: palette.errorCoral },
  primaryBtnText: { color: '#111317', fontSize: 13, fontWeight: '800' },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.bgElevated,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillText: { color: palette.textPrimary, fontSize: 12, fontWeight: '700' },
  bpmBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.bgCanvas,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  bpmBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: palette.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bpmBtnTxt: { color: palette.textPrimary, fontSize: 14, fontWeight: '700' },
  bpmVal: {
    color: palette.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
    minWidth: 28,
    textAlign: 'center',
  },
  iconGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: palette.bgElevated,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  micOn: { backgroundColor: palette.successMuted },
  iconPillText: { color: palette.textPrimary, fontSize: 12, fontWeight: '600' },
  iconBtn: {
    padding: 8,
    borderRadius: radius.sm,
    backgroundColor: palette.bgElevated,
  },
  iconBtnActive: {
    backgroundColor: palette.accentBrassMuted,
  },
  cueBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: palette.bgSurface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderHairline,
  },
  cueText: { color: palette.textPrimary, fontSize: 14, fontWeight: '600' },
  cueRight: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  cueHint: { color: palette.accentBrass, fontSize: 13, fontWeight: '800', fontFamily: 'monospace' },
  cueMic: { color: palette.successEmerald, fontSize: 13, fontWeight: '800', fontFamily: 'monospace' },
  errText: { color: palette.errorCoral, fontSize: 12, paddingHorizontal: 4 },
  doneCard: {
    backgroundColor: palette.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.accentBrassBorder,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  doneTop: { gap: 2 },
  doneTitle: { color: palette.textPrimary, fontSize: 18, fontWeight: '700', fontFamily: 'Georgia' },
  doneStats: { color: palette.accentBrass, fontSize: 13, fontWeight: '700', fontFamily: 'monospace' },
  doneActions: { flexDirection: 'row', gap: 8 },
});

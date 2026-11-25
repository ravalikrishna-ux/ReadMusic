import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Chip, IconButton, SegmentedButtons, Surface, Text } from 'react-native-paper';
import {
  Eye,
  EyeOff,
  Maximize2,
  Mic,
  MicOff,
  Minus,
  Play,
  Plus,
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
  const [statusPrompt, setStatusPrompt] = useState<string>('Tap or play the amber note');
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
    setStatusPrompt(score.allowPeekFret ? 'Tap or play the amber note' : 'Pure sheet reading — no hints');
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
        if (loopRange) idx = 0;
        else {
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
      setStatusPrompt('Your turn — play the amber note');
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
    setStatusPrompt('Tap or play the amber note');
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
      {/* Clean Material 3 Control Bar */}
      <Surface elevation={1} style={styles.controlBar}>
        <SegmentedButtons
          value={mode}
          onValueChange={(v) => {
            stopAllPlayback();
            setMode(v as PracticeMode);
            setStatusPrompt(v === 'wait' ? 'Tap or play the amber note' : 'Press Start for metronome');
          }}
          density="small"
          style={styles.segButtons}
          buttons={[
            { value: 'wait', label: 'Wait' },
            { value: 'tempo', label: 'Tempo' },
          ]}
        />

        <View style={styles.midControls}>
          {mode === 'tempo' && (
            <Button
              mode="contained"
              compact
              buttonColor={isPlayingTempo ? palette.errorCoral : palette.primary}
              onPress={isPlayingTempo ? stopAllPlayback : startTempoRun}
              icon={({ size, color }) =>
                isPlayingTempo ? <Square size={size - 4} color={color} /> : <Play size={size - 4} color={color} />
              }
            >
              {isPlayingTempo ? 'Stop' : 'Start'}
            </Button>
          )}

          <Button
            mode="contained-tonal"
            compact
            onPress={togglePreview}
            icon={({ size, color }) => <Volume2 size={size - 3} color={color} />}
          >
            {isPreviewing ? 'Stop' : 'Listen'}
          </Button>

          <View style={styles.bpmGroup}>
            <IconButton
              size={16}
              mode="contained-tonal"
              icon={({ size, color }) => <Minus size={size} color={color} />}
              onPress={() => setBpm((v) => Math.max(48, v - 6))}
              style={styles.smallIconBtn}
            />
            <Text variant="labelLarge" style={styles.bpmText}>
              {bpm}
            </Text>
            <IconButton
              size={16}
              mode="contained-tonal"
              icon={({ size, color }) => <Plus size={size} color={color} />}
              onPress={() => setBpm((v) => Math.min(144, v + 6))}
              style={styles.smallIconBtn}
            />
          </View>
        </View>

        <View style={styles.rightControls}>
          <Chip
            compact
            selected={micActive}
            onPress={toggleMic}
            icon={({ size, color }) =>
              micActive ? <Mic size={size - 2} color={color} /> : <MicOff size={size - 2} color={color} />
            }
          >
            Mic
          </Chip>

          <Chip
            compact
            selected={peekFretOn && score.allowPeekFret}
            disabled={!score.allowPeekFret}
            onPress={() => score.allowPeekFret && setPeekFretOn((v) => !v)}
            icon={({ size, color }) =>
              peekFretOn && score.allowPeekFret ? (
                <Eye size={size - 2} color={color} />
              ) : (
                <EyeOff size={size - 2} color={color} />
              )
            }
          >
            {score.allowPeekFret ? (peekFretOn ? 'Hint' : 'Off') : 'No Hint'}
          </Chip>

          <IconButton
            size={17}
            selected={showLoopPicker || loopRange !== null}
            mode={showLoopPicker || loopRange ? 'contained-tonal' : undefined}
            icon={({ size, color }) => <Repeat size={size} color={color} />}
            onPress={() => setShowLoopPicker((v) => !v)}
            accessibilityLabel="Loop bars"
            style={styles.smallIconBtn}
          />
          <IconButton
            size={17}
            selected={musicStandWide}
            mode={musicStandWide ? 'contained-tonal' : undefined}
            icon={({ size, color }) => <Maximize2 size={size} color={color} />}
            onPress={() => setMusicStandWide((v) => !v)}
            accessibilityLabel="Wide view"
            style={styles.smallIconBtn}
          />
          <IconButton
            size={17}
            icon={({ size, color }) => <RotateCcw size={size} color={color} />}
            onPress={resetPass}
            accessibilityLabel="Restart"
            style={styles.smallIconBtn}
          />
        </View>
      </Surface>

      {/* Sheet Music Paper */}
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

      {/* Crisp Live Cue Banner */}
      <Surface elevation={0} style={styles.cueBar}>
        <Text variant="bodyMedium" style={styles.cueText}>
          {statusPrompt}
        </Text>
        <View style={styles.cueRight}>
          {activeHintPos && (
            <Chip compact style={styles.hintChip} textStyle={styles.hintChipText}>
              {formatCircledString(activeHintPos.stringNumber)} Fret {activeHintPos.fret}
            </Chip>
          )}
          {micActive && livePitch && (
            <Chip compact style={styles.micChip} textStyle={styles.micChipText}>
              {midiToScientificPitch(livePitch.midi).name}
              {midiToScientificPitch(livePitch.midi).octave}
            </Chip>
          )}
        </View>
      </Surface>

      {micError && (
        <Text variant="bodySmall" style={{ color: palette.errorCoral, paddingHorizontal: 4 }}>
          {micError} — tap the fretboard below instead.
        </Text>
      )}

      {runSummary && (
        <Surface elevation={1} style={styles.doneCard}>
          <View>
            <Text variant="titleMedium" style={{ fontWeight: '700' }}>
              {runSummary.pitchAccuracy >= 90 ? 'Nailed it!' : 'Nice run!'}
            </Text>
            <Text variant="bodySmall" style={{ color: palette.primary, fontWeight: '700' }}>
              {runSummary.pitchAccuracy}% accuracy · {runSummary.bpm} BPM
            </Text>
          </View>
          <View style={styles.doneActions}>
            <Button mode="outlined" compact onPress={resetPass}>
              Play Again
            </Button>
            {onGenerateFreshSightRead && (
              <Button mode="contained" compact onPress={onGenerateFreshSightRead}>
                Try New One
              </Button>
            )}
          </View>
        </Surface>
      )}

      {/* Interactive Fretboard */}
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
  container: { gap: 14 },
  controlBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: palette.bgSurface,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  segButtons: { width: 168 },
  midControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bpmGroup: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  bpmText: { minWidth: 32, textAlign: 'center', fontWeight: '700' },
  smallIconBtn: { margin: 0 },
  rightControls: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  cueBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: palette.bgElevated,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cueText: { color: palette.textPrimary, fontWeight: '600' },
  cueRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  hintChip: { backgroundColor: palette.accentBrassMuted },
  hintChipText: { color: '#92400E', fontWeight: '800', fontSize: 12 },
  micChip: { backgroundColor: palette.successMuted },
  micChipText: { color: palette.successEmerald, fontWeight: '800', fontSize: 12 },
  doneCard: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.primaryContainer,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  doneActions: { flexDirection: 'row', gap: 8 },
});

import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, SegmentedButtons, Surface, Text } from 'react-native-paper';
import { ArrowLeft, CheckCircle2, Lightbulb } from 'lucide-react-native';
import { InteractiveFretboard } from '../components/InteractiveFretboard';
import { PracticePlayer } from '../components/PracticePlayer';
import { SongBreakdownCard } from '../components/SongBreakdownCard';
import { getScaleFretboardMarkers, pitchClassToName, SCALES } from '../core/music/guitarEngine';
import { PlayableScore, ScaleId } from '../core/music/types';
import { generateSightReadingScore } from '../core/notation/sightReadingGenerator';
import { findLessonById } from '../data/curriculum';
import { PLAYABLE_SCORES } from '../data/scores';
import { SONG_BREAKDOWNS } from '../data/songs';
import { useAppStore } from '../store/useAppStore';
import { palette, radius } from '../theme/tokens';

interface LessonDetailScreenProps {
  lessonId: string;
  onBack: () => void;
  onOpenLesson: (nextLessonId: string) => void;
}

type LessonTab = 'play' | 'guide' | 'songs' | 'quiz';

export const LessonDetailScreen: React.FC<LessonDetailScreenProps> = ({
  lessonId,
  onBack,
  onOpenLesson,
}) => {
  const { state, recordLessonProgress } = useAppStore();
  const entry = findLessonById(lessonId);

  const hasScore = Boolean(entry?.lesson.scoreId && PLAYABLE_SCORES[entry.lesson.scoreId]);
  const hasSongs = Boolean(entry?.lesson.songIds && entry.lesson.songIds.length > 0);
  const hasQuiz = Boolean(entry?.lesson.quiz && entry.lesson.quiz.length > 0);

  const [activeTab, setActiveTab] = useState<LessonTab>(hasScore ? 'play' : 'guide');
  const [labelMode, setLabelMode] = useState<'notes' | 'degrees'>('notes');
  const [overrideScale, setOverrideScale] = useState<{ rootPc: number; scaleId: ScaleId } | null>(
    null
  );
  const [quizSelected, setQuizSelected] = useState<Record<string, number>>({});
  const [freshDrill, setFreshDrill] = useState<PlayableScore | null>(null);

  useEffect(() => {
    setActiveTab(hasScore ? 'play' : 'guide');
    setFreshDrill(null);
    setOverrideScale(null);
    setQuizSelected({});
  }, [lessonId, hasScore]);

  if (!entry) {
    return (
      <View style={styles.screen}>
        <Button mode="text" onPress={onBack}>
          Back
        </Button>
      </View>
    );
  }

  const { module: mod, lesson } = entry;
  const lessonIdx = mod.lessons.findIndex((l) => l.id === lesson.id);
  const nextLesson = mod.lessons[lessonIdx + 1] ?? null;

  const activeScaleId = overrideScale?.scaleId ?? lesson.relatedScaleId;
  const activeRootPc = overrideScale?.rootPc ?? lesson.relatedRootPc ?? 0;

  const scaleMarkers = useMemo(() => {
    if (!activeScaleId) return [];
    return getScaleFretboardMarkers(activeRootPc, activeScaleId, 12);
  }, [activeRootPc, activeScaleId]);

  const linkedSongs = useMemo(() => {
    if (!lesson.songIds || lesson.songIds.length === 0) return [];
    return SONG_BREAKDOWNS.filter((s) => lesson.songIds?.includes(s.id));
  }, [lesson.songIds]);

  const activeScore: PlayableScore | null =
    freshDrill ?? (lesson.scoreId ? PLAYABLE_SCORES[lesson.scoreId] ?? null : null);

  const progress = state.progressByLesson[lesson.id];
  const isCompleted = progress?.status === 'mastered' || progress?.status === 'proficient';

  const handleGenerateFreshSightRead = () => {
    const pos =
      mod.id === 'R1'
        ? 'open-treble'
        : mod.id === 'R6' || mod.id === 'R8'
          ? 'pos-5'
          : 'open-full';
    const key = mod.id === 'R4' || mod.id === 'R5' ? 'G' : mod.id === 'R8' ? 'Em' : 'C';
    const rhythm = mod.id === 'R1' || mod.id === 'R2' ? 'basic' : 'eighths';

    setFreshDrill(
      generateSightReadingScore({
        position: pos,
        keySignature: key,
        rhythmLevel: rhythm,
        measureCount: 4,
        allowPeekFret: false,
      })
    );
  };

  const tabButtons: Array<{ value: LessonTab; label: string }> = [];
  if (hasScore) tabButtons.push({ value: 'play', label: 'Play' });
  tabButtons.push({ value: 'guide', label: 'Quick Guide' });
  if (hasSongs) tabButtons.push({ value: 'songs', label: `Hit Songs (${linkedSongs.length})` });
  if (hasQuiz) tabButtons.push({ value: 'quiz', label: 'Quick Check' });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topRow}>
        <Button
          mode="text"
          compact
          onPress={onBack}
          icon={({ size, color }) => <ArrowLeft size={size - 2} color={color} />}
        >
          Back
        </Button>
        <Chip compact style={styles.codeChip} textStyle={styles.codeChipText}>
          {lesson.number}
        </Chip>
      </View>

      <Text variant="headlineSmall" style={styles.title}>
        {lesson.title}
      </Text>

      {tabButtons.length > 1 && (
        <SegmentedButtons
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as LessonTab)}
          buttons={tabButtons}
        />
      )}

      {activeTab === 'play' && activeScore && (
        <View style={styles.section}>
          {freshDrill && (
            <Button mode="text" compact onPress={() => setFreshDrill(null)} style={{ alignSelf: 'flex-start' }}>
              ← Back to Lesson Piece
            </Button>
          )}
          <PracticePlayer
            score={activeScore}
            onGenerateFreshSightRead={handleGenerateFreshSightRead}
            onCompleteRun={(summary) => {
              recordLessonProgress(lesson.id, {
                status: summary.pitchAccuracy >= 95 ? 'mastered' : 'proficient',
                bestPitchAccuracy: summary.pitchAccuracy,
                bestTimingAccuracy: summary.timingAccuracy,
                bestBpm: summary.bpm,
              });
            }}
          />
        </View>
      )}

      {activeTab === 'guide' && (
        <View style={styles.section}>
          <Surface elevation={1} style={styles.card}>
            {lesson.keyTakeaways.map((point, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <View style={styles.numDot}>
                  <Text style={styles.numDotText}>{idx + 1}</Text>
                </View>
                <Text variant="bodyMedium" style={styles.bulletText}>
                  {point}
                </Text>
              </View>
            ))}

            <Surface elevation={0} style={styles.tipBox}>
              <Lightbulb size={17} color={palette.accentBrass} style={{ marginTop: 2 }} />
              <Text variant="bodyMedium" style={styles.tipText}>
                {lesson.guitarTip}
              </Text>
            </Surface>
          </Surface>

          {activeScaleId && (
            <View style={styles.section}>
              <View style={styles.scaleBar}>
                <Text variant="titleMedium" style={{ fontWeight: '700' }}>
                  {pitchClassToName(activeRootPc)} {SCALES[activeScaleId].name}
                </Text>
                <Button
                  mode="outlined"
                  compact
                  onPress={() => setLabelMode((m) => (m === 'notes' ? 'degrees' : 'notes'))}
                >
                  {labelMode === 'notes' ? 'Notes' : 'Numbers'}
                </Button>
              </View>

              <InteractiveFretboard
                fretCount={12}
                leftHanded={state.leftHanded}
                scaleMarkers={scaleMarkers}
                labelMode={labelMode}
              />
            </View>
          )}
        </View>
      )}

      {activeTab === 'songs' && (
        <View style={styles.section}>
          {linkedSongs.map((song) => (
            <SongBreakdownCard
              key={song.id}
              song={song}
              onExploreScale={(rootPc, scaleId) => {
                setOverrideScale({ rootPc, scaleId });
                setActiveTab('guide');
              }}
            />
          ))}
        </View>
      )}

      {activeTab === 'quiz' && lesson.quiz && (
        <Surface elevation={1} style={styles.card}>
          {lesson.quiz.map((q) => {
            const chosen = quizSelected[q.id];
            const answered = chosen !== undefined;
            const correct = chosen === q.correctIndex;
            return (
              <View key={q.id} style={styles.quizBlock}>
                <Text variant="titleSmall" style={{ fontWeight: '700', lineHeight: 22 }}>
                  {q.prompt}
                </Text>
                <View style={styles.quizOpts}>
                  {q.options.map((opt, idx) => {
                    const showRight = answered && idx === q.correctIndex;
                    const showWrong = answered && chosen === idx && !correct;
                    return (
                      <Button
                        key={opt}
                        mode={showRight || showWrong ? 'contained-tonal' : 'outlined'}
                        buttonColor={
                          showRight
                            ? palette.successMuted
                            : showWrong
                              ? palette.errorMuted
                              : undefined
                        }
                        textColor={
                          showRight
                            ? palette.successEmerald
                            : showWrong
                              ? palette.errorCoral
                              : palette.textPrimary
                        }
                        contentStyle={{ justifyContent: 'flex-start' }}
                        onPress={() => {
                          setQuizSelected((prev) => ({ ...prev, [q.id]: idx }));
                          if (idx === q.correctIndex) {
                            recordLessonProgress(lesson.id, { status: 'proficient' });
                          }
                        }}
                      >
                        {opt}
                      </Button>
                    );
                  })}
                </View>
                {answered && (
                  <Text
                    variant="bodySmall"
                    style={{
                      color: correct ? palette.successEmerald : palette.accentBrass,
                      fontWeight: '600',
                    }}
                  >
                    {q.explanation}
                  </Text>
                )}
              </View>
            );
          })}
        </Surface>
      )}

      <View style={styles.footer}>
        <Button
          mode={isCompleted ? 'contained-tonal' : 'contained'}
          buttonColor={isCompleted ? palette.successMuted : palette.primary}
          textColor={isCompleted ? palette.successEmerald : '#FFFFFF'}
          onPress={() =>
            recordLessonProgress(lesson.id, {
              status: 'mastered',
              bestPitchAccuracy: Math.max(95, progress?.bestPitchAccuracy ?? 95),
            })
          }
          icon={({ size, color }) => <CheckCircle2 size={size - 2} color={color} />}
        >
          {isCompleted ? 'Completed' : 'Mark Done'}
        </Button>

        {nextLesson && (
          <Button mode="contained-tonal" onPress={() => onOpenLesson(nextLesson.id)}>
            Next Lesson →
          </Button>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bgCanvas },
  content: {
    padding: 20,
    paddingBottom: 48,
    gap: 16,
    maxWidth: 880,
    alignSelf: 'center',
    width: '100%',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codeChip: { backgroundColor: palette.primaryContainer },
  codeChipText: { color: palette.onPrimaryContainer, fontWeight: '800', fontSize: 12 },
  title: { color: palette.textPrimary, fontWeight: '700' },
  section: { gap: 14 },
  card: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 20,
    gap: 14,
  },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  numDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numDotText: { color: palette.onPrimaryContainer, fontSize: 12, fontWeight: '800' },
  bulletText: { color: palette.textPrimary, lineHeight: 21, flex: 1 },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: palette.accentBrassMuted,
    borderRadius: radius.md,
    padding: 14,
  },
  tipText: { color: '#78350F', lineHeight: 20, flex: 1 },
  scaleBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quizBlock: { gap: 10 },
  quizOpts: { gap: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingTop: 6 },
});

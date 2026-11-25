import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  ProgressBar,
  SegmentedButtons,
  Surface,
  Text,
} from 'react-native-paper';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Lock,
  Radio,
  X,
} from 'lucide-react-native';
import { CurriculumModule, TrackId } from '../core/music/types';
import { findLessonById, getModulesForTrack } from '../data/curriculum';
import { useAppStore } from '../store/useAppStore';
import { palette, radius } from '../theme/tokens';

interface LearnScreenProps {
  onOpenLesson: (lessonId: string) => void;
  onOpenTuner: () => void;
  onOpenPaywall: () => void;
}

export const LearnScreen: React.FC<LearnScreenProps> = ({
  onOpenLesson,
  onOpenTuner,
  onOpenPaywall,
}) => {
  const { state, setTrack, getModuleMasteryPercent, markModuleTestedOut } = useAppStore();

  const modules = getModulesForTrack(state.selectedTrack);
  const [expandedId, setExpandedId] = useState<string>(modules[0]?.id ?? 'T1');
  const [testOutModule, setTestOutModule] = useState<CurriculumModule | null>(null);
  const [testIdx, setTestIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [testResult, setTestResult] = useState<'passed' | 'failed' | null>(null);

  const activeEntry = findLessonById(state.lastLessonId) ?? findLessonById('T1.1')!;
  const activeLocked = !activeEntry.module.isFree && !state.isFullUnlocked;

  const startTestOut = (mod: CurriculumModule) => {
    setTestOutModule(mod);
    setTestIdx(0);
    setCorrectCount(0);
    setTestResult(null);
  };

  const handleTestAnswer = (optionIdx: number) => {
    if (!testOutModule) return;
    const q = testOutModule.testOutQuiz[testIdx];
    const nextCorrect = correctCount + (optionIdx === q.correctIndex ? 1 : 0);
    setCorrectCount(nextCorrect);

    if (testIdx + 1 >= testOutModule.testOutQuiz.length) {
      const pct = (nextCorrect / testOutModule.testOutQuiz.length) * 100;
      if (pct >= 80) {
        markModuleTestedOut(testOutModule.id);
        setTestResult('passed');
      } else {
        setTestResult('failed');
      }
    } else {
      setTestIdx(testIdx + 1);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Clean Material 3 Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.brand}>
          ReadMusic
        </Text>
        <View style={styles.headerActions}>
          <Button
            mode="contained-tonal"
            compact
            onPress={onOpenTuner}
            icon={({ size, color }) => <Radio size={size - 3} color={color} />}
          >
            Tuner
          </Button>
          {!state.isFullUnlocked && (
            <Button mode="contained" compact onPress={onOpenPaywall}>
              $4.99 Unlock
            </Button>
          )}
        </View>
      </View>

      {/* Material 3 Segmented Track Switch */}
      <SegmentedButtons
        value={state.selectedTrack}
        onValueChange={(v) => setTrack(v as TrackId)}
        buttons={[
          { value: 'integrated', label: 'Both' },
          { value: 'theory', label: 'Theory' },
          { value: 'reading', label: 'Reading' },
        ]}
      />

      {/* Elevated Hero Up-Next Card */}
      <Card mode="elevated" style={styles.heroCard}>
        <Card.Content style={styles.heroContent}>
          <Chip compact style={styles.upNextChip} textStyle={styles.upNextChipText}>
            UP NEXT · {activeEntry.lesson.number}
          </Chip>
          <Text variant="headlineSmall" style={styles.heroTitle}>
            {activeEntry.lesson.title}
          </Text>
          <View style={styles.heroActions}>
            <Button
              mode="contained"
              onPress={() =>
                activeLocked ? onOpenPaywall() : onOpenLesson(activeEntry.lesson.id)
              }
              contentStyle={{ flexDirection: 'row-reverse', paddingHorizontal: 6 }}
              icon={({ size, color }) => <ArrowRight size={size - 2} color={color} />}
            >
              Start Lesson
            </Button>
            <Button mode="contained-tonal" onPress={() => onOpenLesson('R1.2')}>
              Try Sheet Music
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Clean Path */}
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Your Path
      </Text>

      <View style={styles.pathList}>
        {modules.map((mod, idx) => {
          const locked = !mod.isFree && !state.isFullUnlocked;
          const expanded = expandedId === mod.id;
          const pct = getModuleMasteryPercent(mod.id);
          const suggestedSkip = state.suggestedTestOuts.includes(mod.id) && pct < 100;

          return (
            <Surface key={mod.id} elevation={1} style={styles.modCard}>
              <Pressable
                onPress={() => setExpandedId(expanded ? '' : mod.id)}
                style={styles.modHeader}
              >
                <View
                  style={[
                    styles.stepCircle,
                    pct === 100 && styles.stepCircleDone,
                    locked && styles.stepCircleLocked,
                  ]}
                >
                  {pct === 100 ? (
                    <CheckCircle2 size={18} color={palette.successEmerald} />
                  ) : locked ? (
                    <Lock size={14} color={palette.textMuted} />
                  ) : (
                    <Text style={styles.stepNum}>{idx + 1}</Text>
                  )}
                </View>

                <View style={{ flex: 1, gap: 4 }}>
                  <Text variant="titleSmall" style={{ fontWeight: '700', color: palette.textPrimary }}>
                    {mod.title}
                  </Text>
                  <View style={styles.modMetaRow}>
                    <Text variant="bodySmall" style={{ color: palette.textSecondary }}>
                      {mod.track === 'theory' ? 'Theory' : 'Reading'} · {mod.lessons.length}{' '}
                      {mod.lessons.length === 1 ? 'lesson' : 'lessons'}
                    </Text>
                    {mod.isFree && !state.isFullUnlocked && (
                      <Text variant="labelSmall" style={{ color: palette.successEmerald, fontWeight: '800' }}>
                        Free
                      </Text>
                    )}
                    {!locked && suggestedSkip && (
                      <Text variant="labelSmall" style={{ color: palette.infoSteel, fontWeight: '800' }}>
                        Can skip
                      </Text>
                    )}
                  </View>
                  {!locked && (
                    <ProgressBar
                      progress={pct / 100}
                      color={pct === 100 ? palette.successEmerald : palette.primary}
                      style={styles.progressBar}
                    />
                  )}
                </View>

                {expanded ? (
                  <ChevronDown size={18} color={palette.textMuted} />
                ) : (
                  <ChevronRight size={18} color={palette.textMuted} />
                )}
              </Pressable>

              {expanded && (
                <View style={styles.lessonStack}>
                  <Divider />
                  {mod.lessons.map((lesson, lIdx) => {
                    const done =
                      state.progressByLesson[lesson.id]?.status === 'mastered' ||
                      state.progressByLesson[lesson.id]?.status === 'proficient';
                    return (
                      <React.Fragment key={lesson.id}>
                        <Pressable
                          onPress={() => (locked ? onOpenPaywall() : onOpenLesson(lesson.id))}
                          style={styles.lessonRow}
                        >
                          {done ? (
                            <CheckCircle2 size={18} color={palette.successEmerald} />
                          ) : locked ? (
                            <Lock size={15} color={palette.textMuted} />
                          ) : (
                            <View style={styles.lessonDot} />
                          )}
                          <Text variant="bodyMedium" style={styles.lessonTitle} numberOfLines={1}>
                            {lesson.title}
                          </Text>
                          <ChevronRight size={16} color={palette.textMuted} />
                        </Pressable>
                        {lIdx < mod.lessons.length - 1 && <Divider style={{ marginLeft: 44 }} />}
                      </React.Fragment>
                    );
                  })}

                  <View style={styles.modFooter}>
                    {locked ? (
                      <Button mode="contained" onPress={onOpenPaywall}>
                        Unlock Full Course — $4.99
                      </Button>
                    ) : mod.testOutQuiz.length > 0 && pct < 100 ? (
                      <Button mode="text" compact onPress={() => startTestOut(mod)}>
                        Already know this? Skip with quick quiz
                      </Button>
                    ) : null}
                  </View>
                </View>
              )}
            </Surface>
          );
        })}
      </View>

      {/* Quick Skip Quiz Modal */}
      {testOutModule !== null && (
        <Modal
          visible={true}
          transparent
          animationType="none"
          onRequestClose={() => setTestOutModule(null)}
        >
          <View style={styles.modalBackdrop}>
            <Surface elevation={4} style={styles.modalCard}>
              <View style={styles.modalTop}>
                <Text variant="titleMedium" style={{ fontWeight: '700' }}>
                  Quick Skip Quiz
                </Text>
                <IconButton
                  size={18}
                  icon={({ size, color }) => <X size={size} color={color} />}
                  onPress={() => setTestOutModule(null)}
                  accessibilityLabel="Close test-out modal"
                  style={{ margin: 0 }}
                />
              </View>

              {testResult ? (
                <View style={{ gap: 14 }}>
                  <Text
                    variant="titleMedium"
                    style={{
                      fontWeight: '700',
                      color:
                        testResult === 'passed' ? palette.successEmerald : palette.accentBrass,
                    }}
                  >
                    {testResult === 'passed' ? 'Module Completed!' : 'Worth a quick look'}
                  </Text>
                  <Button mode="contained" onPress={() => setTestOutModule(null)}>
                    Done
                  </Button>
                </View>
              ) : (
                <View style={{ gap: 10 }}>
                  <Text variant="bodyLarge" style={{ fontWeight: '600', lineHeight: 22 }}>
                    {testOutModule.testOutQuiz[testIdx].prompt}
                  </Text>
                  {testOutModule.testOutQuiz[testIdx].options.map((opt, idx) => (
                    <Button
                      key={opt}
                      mode="outlined"
                      contentStyle={{ justifyContent: 'flex-start' }}
                      onPress={() => handleTestAnswer(idx)}
                    >
                      {opt}
                    </Button>
                  ))}
                </View>
              )}
            </Surface>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bgCanvas },
  content: {
    padding: 20,
    paddingBottom: 48,
    gap: 18,
    maxWidth: 740,
    alignSelf: 'center',
    width: '100%',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { color: palette.textPrimary, fontWeight: '800' },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  heroCard: {
    backgroundColor: palette.bgSurface,
    borderRadius: 22,
  },
  heroContent: { gap: 12, paddingVertical: 18 },
  upNextChip: { alignSelf: 'flex-start', backgroundColor: palette.primaryContainer },
  upNextChipText: { color: palette.onPrimaryContainer, fontSize: 11, fontWeight: '800' },
  heroTitle: { color: palette.textPrimary, fontWeight: '700' },
  heroActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  sectionTitle: { color: palette.textPrimary, fontWeight: '700', marginTop: 4 },
  pathList: { gap: 12 },
  modCard: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    overflow: 'hidden',
  },
  modHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleDone: { backgroundColor: palette.successMuted },
  stepCircleLocked: { backgroundColor: palette.bgElevated },
  stepNum: { color: palette.primary, fontSize: 15, fontWeight: '800' },
  modMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBar: { height: 5, borderRadius: 3, marginTop: 4, backgroundColor: palette.bgElevated },
  lessonStack: { backgroundColor: '#FCFBFA' },
  lessonRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  lessonDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: palette.primary,
  },
  lessonTitle: { color: palette.textPrimary, fontWeight: '600', flex: 1 },
  modFooter: { padding: 12, paddingTop: 6 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 32, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: palette.bgSurface,
    borderRadius: 24,
    padding: 22,
    gap: 14,
  },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});

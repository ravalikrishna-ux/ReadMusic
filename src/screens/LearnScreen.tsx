import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Lock,
  Radio,
  X,
} from 'lucide-react-native';
import { CurriculumModule } from '../core/music/types';
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
  const {
    state,
    setTrack,
    getModuleMasteryPercent,
    markModuleTestedOut,
  } = useAppStore();

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
      {/* Minimal Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>ReadMusic</Text>
        <View style={styles.headerActions}>
          <Pressable onPress={onOpenTuner} style={styles.tunerBtn}>
            <Radio size={15} color={palette.accentBrass} />
            <Text style={styles.tunerText}>Tuner</Text>
          </Pressable>
          {!state.isFullUnlocked && (
            <Pressable onPress={onOpenPaywall} style={styles.unlockBtn}>
              <Text style={styles.unlockText}>$4.99 Unlock</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Clean Track Pills */}
      <View style={styles.trackBar}>
        {(
          [
            { id: 'integrated', label: 'Both' },
            { id: 'theory', label: 'Theory' },
            { id: 'reading', label: 'Reading' },
          ] as const
        ).map((t) => {
          const active = state.selectedTrack === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => setTrack(t.id)}
              style={[styles.trackBtn, active && styles.trackBtnActive]}
            >
              <Text style={[styles.trackText, active && styles.trackTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Big Friendly "Up Next" Card */}
      <View style={styles.upNextCard}>
        <Text style={styles.upNextLabel}>UP NEXT · {activeEntry.lesson.number}</Text>
        <Text style={styles.upNextTitle}>{activeEntry.lesson.title}</Text>
        <View style={styles.upNextActions}>
          <Pressable
            onPress={() =>
              activeLocked ? onOpenPaywall() : onOpenLesson(activeEntry.lesson.id)
            }
            style={styles.startBtn}
          >
            <Text style={styles.startBtnText}>Start Lesson</Text>
            <ArrowRight size={16} color="#111317" />
          </Pressable>
          <Pressable
            onPress={() => onOpenLesson('R1.2')}
            style={styles.quickReadBtn}
          >
            <Text style={styles.quickReadText}>Try Sheet Music</Text>
          </Pressable>
        </View>
      </View>

      {/* Clean Stepping-Stone Course Path */}
      <Text style={styles.sectionTitle}>Your Path</Text>

      <View style={styles.pathList}>
        {modules.map((mod, idx) => {
          const locked = !mod.isFree && !state.isFullUnlocked;
          const expanded = expandedId === mod.id;
          const pct = getModuleMasteryPercent(mod.id);
          const suggestedSkip = state.suggestedTestOuts.includes(mod.id) && pct < 100;

          return (
            <View key={mod.id} style={styles.modCard}>
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

                <View style={{ flex: 1 }}>
                  <Text style={styles.modTitle}>{mod.title}</Text>
                  <View style={styles.modMetaRow}>
                    <Text style={styles.modMeta}>
                      {mod.track === 'theory' ? 'Theory' : 'Reading'} · {mod.lessons.length}{' '}
                      {mod.lessons.length === 1 ? 'lesson' : 'lessons'}
                    </Text>
                    {mod.isFree && !state.isFullUnlocked && (
                      <Text style={styles.freeTag}>Free</Text>
                    )}
                    {!locked && suggestedSkip && (
                      <Text style={styles.skipTag}>Can skip</Text>
                    )}
                  </View>
                </View>

                {expanded ? (
                  <ChevronDown size={18} color={palette.textMuted} />
                ) : (
                  <ChevronRight size={18} color={palette.textMuted} />
                )}
              </Pressable>

              {expanded && (
                <View style={styles.lessonStack}>
                  {mod.lessons.map((lesson) => {
                    const done =
                      state.progressByLesson[lesson.id]?.status === 'mastered' ||
                      state.progressByLesson[lesson.id]?.status === 'proficient';
                    return (
                      <Pressable
                        key={lesson.id}
                        onPress={() => (locked ? onOpenPaywall() : onOpenLesson(lesson.id))}
                        style={styles.lessonRow}
                      >
                        {done ? (
                          <CheckCircle2 size={17} color={palette.successEmerald} />
                        ) : locked ? (
                          <Lock size={15} color={palette.textMuted} />
                        ) : (
                          <View style={styles.lessonDot} />
                        )}
                        <Text style={styles.lessonTitle} numberOfLines={1}>
                          {lesson.title}
                        </Text>
                        <ChevronRight size={16} color={palette.textMuted} />
                      </Pressable>
                    );
                  })}

                  {locked ? (
                    <Pressable onPress={onOpenPaywall} style={styles.unlockRowBtn}>
                      <Text style={styles.unlockRowText}>Unlock Full Course — $4.99</Text>
                    </Pressable>
                  ) : mod.testOutQuiz.length > 0 && pct < 100 ? (
                    <Pressable onPress={() => startTestOut(mod)} style={styles.testOutLink}>
                      <Text style={styles.testOutText}>Already know this? Skip with quick quiz</Text>
                    </Pressable>
                  ) : null}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Clean Test-Out Modal */}
      {testOutModule !== null && (
        <Modal
          visible={true}
          transparent
          animationType="none"
          onRequestClose={() => setTestOutModule(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalTop}>
                <Text style={styles.modalTitle}>Quick Skip Quiz</Text>
                <Pressable
                  onPress={() => setTestOutModule(null)}
                  accessibilityRole="button"
                  accessibilityLabel="Close test-out modal"
                  style={{ padding: 6 }}
                >
                  <X size={18} color={palette.textSecondary} />
                </Pressable>
              </View>

              {testResult ? (
                <View style={{ gap: 14 }}>
                  <Text
                    style={[
                      styles.resultTitle,
                      {
                        color:
                          testResult === 'passed'
                            ? palette.successEmerald
                            : palette.accentBrass,
                      },
                    ]}
                  >
                    {testResult === 'passed' ? 'Module Completed!' : 'Worth a quick look'}
                  </Text>
                  <Pressable
                    onPress={() => setTestOutModule(null)}
                    style={styles.unlockRowBtn}
                  >
                    <Text style={styles.unlockRowText}>Done</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  <Text style={styles.quizPrompt}>
                    {testOutModule.testOutQuiz[testIdx].prompt}
                  </Text>
                  {testOutModule.testOutQuiz[testIdx].options.map((opt, idx) => (
                    <Pressable
                      key={opt}
                      onPress={() => handleTestAnswer(idx)}
                      style={styles.quizOpt}
                    >
                      <Text style={styles.quizOptText}>{opt}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
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
  brand: { color: palette.textPrimary, fontSize: 24, fontWeight: '700', fontFamily: 'Georgia' },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  tunerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.bgSurface,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.pill,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  tunerText: { color: palette.textPrimary, fontSize: 13, fontWeight: '700' },
  unlockBtn: {
    backgroundColor: palette.accentBrassMuted,
    borderRadius: radius.pill,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  unlockText: { color: palette.accentBrass, fontSize: 13, fontWeight: '800' },
  trackBar: {
    flexDirection: 'row',
    backgroundColor: palette.bgSurface,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  trackBtn: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  trackBtnActive: { backgroundColor: palette.bgElevated },
  trackText: { color: palette.textMuted, fontSize: 14, fontWeight: '600' },
  trackTextActive: { color: palette.textPrimary, fontWeight: '700' },
  upNextCard: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    padding: 22,
    gap: 12,
  },
  upNextLabel: {
    color: palette.accentBrass,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  upNextTitle: {
    color: palette.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  upNextActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: palette.accentBrass,
    borderRadius: radius.md,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  startBtnText: { color: '#111317', fontSize: 15, fontWeight: '800' },
  quickReadBtn: {
    backgroundColor: palette.bgElevated,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  quickReadText: { color: palette.textPrimary, fontSize: 14, fontWeight: '600' },
  sectionTitle: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginTop: 4,
  },
  pathList: { gap: 10 },
  modCard: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    overflow: 'hidden',
  },
  modHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  stepCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: palette.accentBrassMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleDone: { backgroundColor: palette.successMuted },
  stepCircleLocked: { backgroundColor: palette.bgElevated },
  stepNum: { color: palette.accentBrass, fontSize: 15, fontWeight: '800' },
  modTitle: { color: palette.textPrimary, fontSize: 15, fontWeight: '700' },
  modMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
  modMeta: { color: palette.textSecondary, fontSize: 12 },
  freeTag: { color: palette.successEmerald, fontSize: 12, fontWeight: '700' },
  skipTag: { color: palette.infoSteel, fontSize: 12, fontWeight: '700' },
  lessonStack: {
    borderTopWidth: 1,
    borderTopColor: palette.borderHairline,
    padding: 12,
    gap: 8,
    backgroundColor: palette.bgSubtle,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: palette.bgSurface,
    borderRadius: radius.md,
    padding: 14,
  },
  lessonDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: palette.accentBrass,
  },
  lessonTitle: { color: palette.textPrimary, fontSize: 14, fontWeight: '600', flex: 1 },
  unlockRowBtn: {
    backgroundColor: palette.accentBrass,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  unlockRowText: { color: '#111317', fontSize: 14, fontWeight: '800' },
  testOutLink: { alignItems: 'center', paddingVertical: 8 },
  testOutText: { color: palette.accentBrass, fontSize: 13, fontWeight: '600' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(8, 10, 14, 0.84)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: palette.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    padding: 22,
    gap: 14,
  },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { color: palette.textPrimary, fontSize: 18, fontWeight: '700', fontFamily: 'Georgia' },
  quizPrompt: { color: palette.textPrimary, fontSize: 15, fontWeight: '600', lineHeight: 22 },
  quizOpt: {
    backgroundColor: palette.bgElevated,
    borderRadius: radius.md,
    padding: 14,
  },
  quizOptText: { color: palette.textPrimary, fontSize: 14, fontWeight: '600' },
  resultTitle: { fontSize: 19, fontWeight: '700', fontFamily: 'Georgia' },
});

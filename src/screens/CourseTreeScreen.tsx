import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Lock,
  X,
} from 'lucide-react-native';
import { CurriculumModule } from '../core/music/types';
import { getModulesForTrack } from '../data/curriculum';
import { useAppStore } from '../store/useAppStore';
import { palette, radius } from '../theme/tokens';

interface CourseTreeScreenProps {
  onOpenLesson: (lessonId: string) => void;
  onOpenPaywall: () => void;
}

export const CourseTreeScreen: React.FC<CourseTreeScreenProps> = ({
  onOpenLesson,
  onOpenPaywall,
}) => {
  const {
    state,
    setTrack,
    getModuleMasteryPercent,
    markModuleTestedOut,
  } = useAppStore();

  const [expandedId, setExpandedId] = useState<string>('T1');
  const [testOutModule, setTestOutModule] = useState<CurriculumModule | null>(null);
  const [testIdx, setTestIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [testResult, setTestResult] = useState<'passed' | 'failed' | null>(null);

  const modules = getModulesForTrack(state.selectedTrack);

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
      <View style={styles.header}>
        <Text style={styles.overline}>CURRICULUM ROADMAP</Text>
        <Text style={styles.title}>Guitar Course Tree</Text>
        <Text style={styles.sub}>
          Switch freely between Integrated, Music Theory, or Reading Music. Every unlocked module is
          browsable and includes a quick Test-Out quiz.
        </Text>
      </View>

      {/* Track Filter Tabs */}
      <View style={styles.trackTabs}>
        {(
          [
            { id: 'integrated', label: 'Integrated (16)' },
            { id: 'theory', label: 'Theory (T1–T8)' },
            { id: 'reading', label: 'Reading (R1–R8)' },
          ] as const
        ).map((tab) => {
          const active = state.selectedTrack === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setTrack(tab.id)}
              style={[styles.trackTab, active && styles.trackTabActive]}
            >
              <Text style={[styles.trackTabText, active && styles.trackTabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Module Tree */}
      <View style={styles.treeList}>
        {modules.map((mod) => {
          const isLocked = !mod.isFree && !state.isFullUnlocked;
          const isExpanded = expandedId === mod.id;
          const masteryPct = getModuleMasteryPercent(mod.id);
          const isSuggestedTestOut = state.suggestedTestOuts.includes(mod.id);

          return (
            <View
              key={mod.id}
              style={[styles.moduleCard, isLocked && styles.moduleCardLocked]}
            >
              <Pressable
                onPress={() => setExpandedId(isExpanded ? '' : mod.id)}
                style={styles.moduleHeader}
              >
                <View style={styles.codeCol}>
                  <Text style={styles.codeLabel}>{mod.code}</Text>
                  <Text style={styles.trackTag}>
                    {mod.track === 'theory' ? 'THRY' : 'READ'}
                  </Text>
                </View>

                <View style={{ flex: 1, gap: 3 }}>
                  <View style={styles.titleLine}>
                    <Text style={styles.moduleTitle}>{mod.title}</Text>
                  </View>
                  <Text style={styles.moduleSubtitle}>{mod.subtitle}</Text>

                  <View style={styles.metaPills}>
                    {mod.isFree && (
                      <View style={styles.freePill}>
                        <Text style={styles.freePillText}>FREE TRIAL</Text>
                      </View>
                    )}
                    {isLocked && (
                      <View style={styles.lockPill}>
                        <Lock size={10} color={palette.accentBrass} />
                        <Text style={styles.lockPillText}>FULL ACCESS ($4.99)</Text>
                      </View>
                    )}
                    {!isLocked && isSuggestedTestOut && masteryPct < 100 && (
                      <View style={styles.suggestPill}>
                        <Text style={styles.suggestPillText}>SUGGESTED TEST-OUT</Text>
                      </View>
                    )}
                    {!isLocked && masteryPct === 100 && (
                      <View style={styles.masteredPill}>
                        <CheckCircle2 size={11} color={palette.successEmerald} />
                        <Text style={styles.masteredPillText}>MASTERED</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.rightCol}>
                  {!isLocked && <Text style={styles.pctText}>{masteryPct}%</Text>}
                  {isExpanded ? (
                    <ChevronDown size={18} color={palette.textSecondary} />
                  ) : (
                    <ChevronRight size={18} color={palette.textSecondary} />
                  )}
                </View>
              </Pressable>

              {isExpanded && (
                <View style={styles.expandedBody}>
                  {state.selectedTrack === 'integrated' && (
                    <View style={styles.synergyBox}>
                      <Text style={styles.synergyLabel}>
                        STAGE {mod.integratedStage} SYNERGY
                      </Text>
                      <Text style={styles.synergyText}>{mod.synergyNote}</Text>
                    </View>
                  )}

                  <Text style={styles.goalText}>Outcome: {mod.goal}</Text>

                  {/* Lessons inside Module */}
                  <View style={styles.lessonList}>
                    {mod.lessons.map((lesson) => {
                      const prog = state.progressByLesson[lesson.id];
                      const done = prog?.status === 'mastered' || prog?.status === 'proficient';
                      return (
                        <Pressable
                          key={lesson.id}
                          onPress={() =>
                            isLocked ? onOpenPaywall() : onOpenLesson(lesson.id)
                          }
                          style={styles.lessonRow}
                        >
                          <View style={styles.lessonLeft}>
                            {done ? (
                              <CheckCircle2 size={16} color={palette.successEmerald} />
                            ) : isLocked ? (
                              <Lock size={15} color={palette.textMuted} />
                            ) : (
                              <View style={styles.lessonDot} />
                            )}
                            <View style={{ flex: 1 }}>
                              <Text style={styles.lessonTitle}>
                                {lesson.number} • {lesson.title}
                              </Text>
                              <Text style={styles.lessonMeta}>
                                {lesson.durationMin} min
                                {lesson.scoreId ? ' • Interactive Sheet Music' : ''}
                                {lesson.songIds && lesson.songIds.length > 0
                                  ? ` • ${lesson.songIds.length} Song Breakdown${lesson.songIds.length > 1 ? 's' : ''}`
                                  : ''}
                              </Text>
                            </View>
                          </View>
                          <ChevronRight size={16} color={palette.textMuted} />
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* Footer Actions: Test-Out or Unlock */}
                  <View style={styles.moduleFooter}>
                    {isLocked ? (
                      <Pressable onPress={onOpenPaywall} style={styles.unlockBtn}>
                        <Text style={styles.unlockBtnText}>
                          Unlock Modules 2–8 Forever ($4.99)
                        </Text>
                      </Pressable>
                    ) : mod.testOutQuiz.length > 0 && masteryPct < 100 ? (
                      <Pressable
                        onPress={() => startTestOut(mod)}
                        style={styles.testOutBtn}
                      >
                        <Award size={14} color={palette.accentBrass} />
                        <Text style={styles.testOutText}>
                          Already know {mod.code}? Take Quick Test-Out
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Test-Out Quiz Modal */}
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
              <Text style={styles.modalTitle}>
                Test-Out: {testOutModule?.code} {testOutModule?.title}
              </Text>
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
              <View style={{ gap: 12 }}>
                <Text
                  style={[
                    styles.resultHeadline,
                    {
                      color:
                        testResult === 'passed'
                          ? palette.successEmerald
                          : palette.accentBrass,
                    },
                  ]}
                >
                  {testResult === 'passed'
                    ? `Module ${testOutModule?.code} Mastered (Tested Out)!`
                    : 'Almost there — worth a quick review'}
                </Text>
                <Text style={styles.resultSub}>
                  {testResult === 'passed'
                    ? 'All lessons in this module are marked Mastered and remain open for reference anytime.'
                    : 'Score at least 80% to test out. Jump into the lessons to lock in any missing details.'}
                </Text>
                <Pressable
                  onPress={() => setTestOutModule(null)}
                  style={styles.unlockBtn}
                >
                  <Text style={styles.unlockBtnText}>Back to Course Tree</Text>
                </Pressable>
              </View>
            ) : testOutModule ? (
              <View style={{ gap: 12 }}>
                <Text style={styles.quizProgress}>
                  Question {testIdx + 1} of {testOutModule.testOutQuiz.length}
                </Text>
                <Text style={styles.quizPrompt}>
                  {testOutModule.testOutQuiz[testIdx].prompt}
                </Text>
                {testOutModule.testOutQuiz[testIdx].options.map((opt, idx) => (
                  <Pressable
                    key={opt}
                    onPress={() => handleTestAnswer(idx)}
                    style={styles.quizOptBtn}
                  >
                    <Text style={styles.quizOptText}>{opt}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bgCanvas },
  content: { padding: 16, paddingBottom: 44, gap: 16, maxWidth: 920, alignSelf: 'center', width: '100%' },
  header: { gap: 4 },
  overline: { color: palette.accentBrass, fontSize: 10, fontWeight: '800', letterSpacing: 1, fontFamily: 'monospace' },
  title: { color: palette.textPrimary, fontSize: 24, fontWeight: '700', fontFamily: 'Georgia' },
  sub: { color: palette.textSecondary, fontSize: 13, lineHeight: 19 },
  trackTabs: {
    flexDirection: 'row',
    backgroundColor: palette.bgSurface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 4,
    gap: 4,
  },
  trackTab: { flex: 1, paddingVertical: 8, borderRadius: radius.sm, alignItems: 'center' },
  trackTabActive: { backgroundColor: palette.accentBrass },
  trackTabText: { color: palette.textSecondary, fontSize: 12, fontWeight: '700' },
  trackTabTextActive: { color: '#111317', fontWeight: '800' },
  treeList: { gap: 12 },
  moduleCard: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    overflow: 'hidden',
  },
  moduleCardLocked: {
    borderColor: '#252933',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  codeCol: {
    width: 46,
    height: 46,
    borderRadius: radius.sm,
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeLabel: { color: palette.accentBrass, fontSize: 13, fontWeight: '800', fontFamily: 'monospace' },
  trackTag: { color: palette.textMuted, fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },
  titleLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  moduleTitle: { color: palette.textPrimary, fontSize: 15, fontWeight: '700', fontFamily: 'Georgia' },
  moduleSubtitle: { color: palette.textSecondary, fontSize: 12 },
  metaPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  freePill: { backgroundColor: palette.successMuted, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
  freePillText: { color: palette.successEmerald, fontSize: 9, fontWeight: '800' },
  lockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.accentBrassMuted,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lockPillText: { color: palette.accentBrass, fontSize: 9, fontWeight: '800' },
  suggestPill: { backgroundColor: palette.infoMuted, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
  suggestPillText: { color: palette.infoSteel, fontSize: 9, fontWeight: '800' },
  masteredPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.successMuted,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  masteredPillText: { color: palette.successEmerald, fontSize: 9, fontWeight: '800' },
  rightCol: { alignItems: 'flex-end', gap: 4 },
  pctText: { color: palette.textSecondary, fontSize: 11, fontWeight: '700', fontFamily: 'monospace' },
  expandedBody: {
    borderTopWidth: 1,
    borderTopColor: palette.borderHairline,
    backgroundColor: palette.bgSubtle,
    padding: 14,
    gap: 12,
  },
  synergyBox: {
    backgroundColor: palette.bgElevated,
    borderRadius: radius.sm,
    padding: 10,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    gap: 3,
  },
  synergyLabel: { color: palette.accentBrass, fontSize: 9, fontWeight: '800', letterSpacing: 0.7 },
  synergyText: { color: palette.textSecondary, fontSize: 12, lineHeight: 17 },
  goalText: { color: palette.textSecondary, fontSize: 12, lineHeight: 18 },
  lessonList: { gap: 8 },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.bgSurface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 12,
    gap: 10,
  },
  lessonLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  lessonDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: palette.accentBrass,
  },
  lessonTitle: { color: palette.textPrimary, fontSize: 13, fontWeight: '700' },
  lessonMeta: { color: palette.textMuted, fontSize: 11, marginTop: 2 },
  moduleFooter: { paddingTop: 2 },
  unlockBtn: {
    backgroundColor: palette.accentBrass,
    borderRadius: radius.sm,
    paddingVertical: 11,
    alignItems: 'center',
  },
  unlockBtnText: { color: '#111317', fontSize: 13, fontWeight: '800' },
  testOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.accentBrassBorder,
    borderRadius: radius.sm,
    paddingVertical: 10,
  },
  testOutText: { color: palette.accentBrass, fontSize: 12, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(8, 10, 14, 0.84)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: palette.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    padding: 20,
    gap: 14,
  },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  modalTitle: { color: palette.textPrimary, fontSize: 16, fontWeight: '700', fontFamily: 'Georgia', flex: 1 },
  quizProgress: { color: palette.accentBrass, fontSize: 11, fontWeight: '800', fontFamily: 'monospace' },
  quizPrompt: { color: palette.textPrimary, fontSize: 15, fontWeight: '600', lineHeight: 22 },
  quizOptBtn: {
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.sm,
    padding: 12,
  },
  quizOptText: { color: palette.textPrimary, fontSize: 13, fontWeight: '600' },
  resultHeadline: { fontSize: 18, fontWeight: '700', fontFamily: 'Georgia' },
  resultSub: { color: palette.textSecondary, fontSize: 13, lineHeight: 19 },
});

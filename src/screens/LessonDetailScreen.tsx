import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
        <Pressable onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={16} color={palette.textPrimary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
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

  const tabs: Array<{ id: LessonTab; label: string }> = [];
  if (hasScore) tabs.push({ id: 'play', label: 'Play' });
  tabs.push({ id: 'guide', label: 'Quick Guide' });
  if (hasSongs) tabs.push({ id: 'songs', label: `Hit Songs (${linkedSongs.length})` });
  if (hasQuiz) tabs.push({ id: 'quiz', label: 'Quick Check' });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Clean Minimal Top Bar */}
      <View style={styles.topRow}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={17} color={palette.textPrimary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.lessonCode}>{lesson.number}</Text>
      </View>

      <Text style={styles.title}>{lesson.title}</Text>

      {/* Stepped Tabs — One Focused View at a Time */}
      {tabs.length > 1 && (
        <View style={styles.tabRow}>
          {tabs.map((t) => {
            const active = activeTab === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setActiveTab(t.id)}
                style={[styles.tabBtn, active && styles.tabBtnActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* TAB 1: PLAY (Sheet Music + Fretboard Immediately Above the Fold) */}
      {activeTab === 'play' && activeScore && (
        <View style={styles.section}>
          {freshDrill && (
            <Pressable onPress={() => setFreshDrill(null)} style={styles.backToLessonLink}>
              <Text style={styles.backToLessonText}>← Back to Lesson Piece</Text>
            </Pressable>
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

      {/* TAB 2: QUICK GUIDE (Short Scannable Points + Fretboard) */}
      {activeTab === 'guide' && (
        <View style={styles.section}>
          <View style={styles.card}>
            {lesson.keyTakeaways.map((point, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <View style={styles.numDot}>
                  <Text style={styles.numDotText}>{idx + 1}</Text>
                </View>
                <Text style={styles.bulletText}>{point}</Text>
              </View>
            ))}

            <View style={styles.tipBox}>
              <Lightbulb size={16} color={palette.accentBrass} style={{ marginTop: 2 }} />
              <Text style={styles.tipText}>{lesson.guitarTip}</Text>
            </View>
          </View>

          {activeScaleId && (
            <View style={styles.section}>
              <View style={styles.scaleBar}>
                <Text style={styles.scaleTitle}>
                  {pitchClassToName(activeRootPc)} {SCALES[activeScaleId].name}
                </Text>
                <Pressable
                  onPress={() => setLabelMode((m) => (m === 'notes' ? 'degrees' : 'notes'))}
                  style={styles.pillBtn}
                >
                  <Text style={styles.pillText}>
                    {labelMode === 'notes' ? 'Notes' : 'Numbers'}
                  </Text>
                </Pressable>
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

      {/* TAB 3: HIT SONGS */}
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

      {/* TAB 4: QUICK CHECK */}
      {activeTab === 'quiz' && lesson.quiz && (
        <View style={styles.card}>
          {lesson.quiz.map((q) => {
            const chosen = quizSelected[q.id];
            const answered = chosen !== undefined;
            const correct = chosen === q.correctIndex;
            return (
              <View key={q.id} style={styles.quizBlock}>
                <Text style={styles.quizPrompt}>{q.prompt}</Text>
                <View style={styles.quizOpts}>
                  {q.options.map((opt, idx) => {
                    const showRight = answered && idx === q.correctIndex;
                    const showWrong = answered && chosen === idx && !correct;
                    return (
                      <Pressable
                        key={opt}
                        onPress={() => {
                          setQuizSelected((prev) => ({ ...prev, [q.id]: idx }));
                          if (idx === q.correctIndex) {
                            recordLessonProgress(lesson.id, { status: 'proficient' });
                          }
                        }}
                        style={[
                          styles.quizOpt,
                          showRight && styles.quizOptRight,
                          showWrong && styles.quizOptWrong,
                        ]}
                      >
                        <Text style={styles.quizOptText}>{opt}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                {answered && (
                  <Text
                    style={[
                      styles.quizExplain,
                      { color: correct ? palette.successEmerald : palette.accentBrass },
                    ]}
                  >
                    {q.explanation}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Simple Bottom Action Bar */}
      <View style={styles.footer}>
        <Pressable
          onPress={() =>
            recordLessonProgress(lesson.id, {
              status: 'mastered',
              bestPitchAccuracy: Math.max(95, progress?.bestPitchAccuracy ?? 95),
            })
          }
          style={[styles.doneBtn, isCompleted && styles.doneBtnActive]}
        >
          <CheckCircle2 size={16} color={isCompleted ? palette.successEmerald : '#111317'} />
          <Text style={[styles.doneText, isCompleted && { color: palette.successEmerald }]}>
            {isCompleted ? 'Completed' : 'Mark Done'}
          </Text>
        </Pressable>

        {nextLesson && (
          <Pressable onPress={() => onOpenLesson(nextLesson.id)} style={styles.nextBtn}>
            <Text style={styles.nextText}>Next Lesson →</Text>
          </Pressable>
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
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  backText: { color: palette.textPrimary, fontSize: 14, fontWeight: '700' },
  lessonCode: { color: palette.accentBrass, fontSize: 12, fontWeight: '800', fontFamily: 'monospace' },
  title: { color: palette.textPrimary, fontSize: 24, fontWeight: '700', fontFamily: 'Georgia' },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: palette.bgSurface,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  tabBtnActive: { backgroundColor: palette.accentBrass },
  tabText: { color: palette.textSecondary, fontSize: 13, fontWeight: '700' },
  tabTextActive: { color: '#111317', fontWeight: '800' },
  section: { gap: 14 },
  backToLessonLink: { alignSelf: 'flex-start' },
  backToLessonText: { color: palette.accentBrass, fontSize: 13, fontWeight: '700' },
  card: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 18,
    gap: 14,
  },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  numDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.accentBrassMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numDotText: { color: palette.accentBrass, fontSize: 12, fontWeight: '800' },
  bulletText: { color: palette.textPrimary, fontSize: 14, lineHeight: 21, flex: 1 },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: palette.accentBrassMuted,
    borderRadius: radius.md,
    padding: 13,
  },
  tipText: { color: palette.textPrimary, fontSize: 13, lineHeight: 20, flex: 1 },
  scaleBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scaleTitle: { color: palette.textPrimary, fontSize: 16, fontWeight: '700', fontFamily: 'Georgia' },
  pillBtn: {
    backgroundColor: palette.bgSurface,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillText: { color: palette.textPrimary, fontSize: 12, fontWeight: '700' },
  quizBlock: { gap: 10 },
  quizPrompt: { color: palette.textPrimary, fontSize: 15, fontWeight: '700', lineHeight: 22 },
  quizOpts: { gap: 8 },
  quizOpt: { backgroundColor: palette.bgElevated, borderRadius: radius.md, padding: 14 },
  quizOptRight: { backgroundColor: palette.successMuted, borderWidth: 1, borderColor: palette.successEmerald },
  quizOptWrong: { backgroundColor: palette.errorMuted, borderWidth: 1, borderColor: palette.errorCoral },
  quizOptText: { color: palette.textPrimary, fontSize: 14, fontWeight: '600' },
  quizExplain: { fontSize: 13, lineHeight: 19 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingTop: 6 },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: palette.accentBrass,
    borderRadius: radius.md,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  doneBtnActive: {
    backgroundColor: palette.successMuted,
    borderWidth: 1,
    borderColor: palette.successEmerald,
  },
  doneText: { color: '#111317', fontSize: 14, fontWeight: '800' },
  nextBtn: {
    backgroundColor: palette.bgElevated,
    borderRadius: radius.md,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  nextText: { color: palette.textPrimary, fontSize: 14, fontWeight: '700' },
});

import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, CheckCircle2, Lightbulb, Sparkles } from 'lucide-react-native';
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

export const LessonDetailScreen: React.FC<LessonDetailScreenProps> = ({
  lessonId,
  onBack,
  onOpenLesson,
}) => {
  const { state, recordLessonProgress } = useAppStore();
  const entry = findLessonById(lessonId);

  const [labelMode, setLabelMode] = useState<'notes' | 'degrees'>('notes');
  const [overrideScale, setOverrideScale] = useState<{ rootPc: number; scaleId: ScaleId } | null>(
    null
  );
  const [quizSelected, setQuizSelected] = useState<Record<string, number>>({});
  const [freshDrill, setFreshDrill] = useState<PlayableScore | null>(null);

  if (!entry) {
    return (
      <View style={styles.screen}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={16} color={palette.textPrimary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={{ color: palette.textPrimary, padding: 20 }}>Lesson not found.</Text>
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

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Bar */}
      <View style={styles.topRow}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={16} color={palette.textPrimary} />
          <Text style={styles.backText}>Back to Course</Text>
        </Pressable>
        <View style={styles.metaBadge}>
          <Text style={styles.metaBadgeText}>
            {mod.code} • {lesson.number} • {lesson.durationMin} MIN
          </Text>
        </View>
      </View>

      {/* Lesson Brief */}
      <View style={styles.headerBlock}>
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.summary}>{lesson.summary}</Text>
      </View>

      {/* Key Takeaways */}
      <View style={styles.card}>
        <Text style={styles.cardOverline}>ESSENTIAL CONCEPTS</Text>
        {lesson.keyTakeaways.map((point, idx) => (
          <View key={idx} style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>{point}</Text>
          </View>
        ))}

        <View style={styles.tipBox}>
          <Lightbulb size={15} color={palette.accentBrass} style={{ marginTop: 2 }} />
          <Text style={styles.tipText}>{lesson.guitarTip}</Text>
        </View>
      </View>

      {/* Interactive Scale Fretboard (for Theory lessons) */}
      {activeScaleId && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>
                Fretboard Map: {pitchClassToName(activeRootPc)} {SCALES[activeScaleId].name}
              </Text>
              <Text style={styles.sectionSub}>
                Formula: {SCALES[activeScaleId].formula} — Tap any fret to hear it on guitar
              </Text>
            </View>
            <View style={styles.toggleGroup}>
              <Pressable
                onPress={() => setLabelMode('notes')}
                style={[styles.toggleBtn, labelMode === 'notes' && styles.toggleBtnActive]}
              >
                <Text
                  style={[styles.toggleText, labelMode === 'notes' && styles.toggleTextActive]}
                >
                  Notes
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setLabelMode('degrees')}
                style={[styles.toggleBtn, labelMode === 'degrees' && styles.toggleBtnActive]}
              >
                <Text
                  style={[styles.toggleText, labelMode === 'degrees' && styles.toggleTextActive]}
                >
                  Degrees
                </Text>
              </Pressable>
            </View>
          </View>

          <InteractiveFretboard
            fretCount={12}
            leftHanded={state.leftHanded}
            scaleMarkers={scaleMarkers}
            labelMode={labelMode}
          />
        </View>
      )}

      {/* Interactive Sheet Music Practice Player (for Reading lessons) */}
      {activeScore && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              {freshDrill ? 'Fresh Unseen Sight-Read Check' : 'Interactive Sheet Music Practice'}
            </Text>
            {freshDrill && (
              <Pressable onPress={() => setFreshDrill(null)} style={styles.linkBtn}>
                <Text style={styles.linkBtnText}>Return to Lesson Etude</Text>
              </Pressable>
            )}
          </View>

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

      {/* 80s / 90s / 00s Song Breakdowns */}
      {linkedSongs.length > 0 && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sparkles size={15} color={palette.accentBrass} />
              <Text style={styles.sectionTitle}>In the Wild: 80s / 90s / 00s Examples</Text>
            </View>
          </View>
          {linkedSongs.map((song) => (
            <SongBreakdownCard
              key={song.id}
              song={song}
              onExploreScale={(rootPc, scaleId) => setOverrideScale({ rootPc, scaleId })}
            />
          ))}
        </View>
      )}

      {/* Lesson Recall Quiz */}
      {lesson.quiz && lesson.quiz.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardOverline}>CONCEPT CHECK</Text>
          {lesson.quiz.map((q) => {
            const chosen = quizSelected[q.id];
            const answered = chosen !== undefined;
            const correct = chosen === q.correctIndex;
            return (
              <View key={q.id} style={styles.quizBlock}>
                <Text style={styles.quizPrompt}>{q.prompt}</Text>
                <View style={styles.quizOptions}>
                  {q.options.map((opt, idx) => {
                    const isThis = chosen === idx;
                    const showRight = answered && idx === q.correctIndex;
                    const showWrong = answered && isThis && !correct;
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
                          styles.quizOption,
                          showRight && styles.quizOptionCorrect,
                          showWrong && styles.quizOptionWrong,
                        ]}
                      >
                        <Text style={styles.quizOptionText}>{opt}</Text>
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
                    {correct ? 'Correct — ' : 'Review: '}
                    {q.explanation}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Completion & Next Lesson Footer */}
      <View style={styles.footerBar}>
        <Pressable
          onPress={() =>
            recordLessonProgress(lesson.id, {
              status: 'mastered',
              bestPitchAccuracy: Math.max(95, progress?.bestPitchAccuracy ?? 95),
            })
          }
          style={[styles.completeBtn, isCompleted && styles.completeBtnDone]}
        >
          <CheckCircle2 size={16} color={isCompleted ? palette.successEmerald : '#111317'} />
          <Text
            style={[
              styles.completeBtnText,
              isCompleted && { color: palette.successEmerald },
            ]}
          >
            {isCompleted ? 'Lesson Mastered' : 'Mark Lesson Mastered'}
          </Text>
        </Pressable>

        {nextLesson && (
          <Pressable
            onPress={() => {
              setFreshDrill(null);
              setOverrideScale(null);
              setQuizSelected({});
              onOpenLesson(nextLesson.id);
            }}
            style={styles.nextBtn}
          >
            <Text style={styles.nextBtnText}>
              Next: {nextLesson.number} →
            </Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bgCanvas },
  content: { padding: 16, paddingBottom: 48, gap: 16, maxWidth: 960, alignSelf: 'center', width: '100%' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  backText: { color: palette.textPrimary, fontSize: 13, fontWeight: '700' },
  metaBadge: {
    backgroundColor: palette.bgSurface,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  metaBadgeText: { color: palette.accentBrass, fontSize: 11, fontWeight: '800', fontFamily: 'monospace' },
  headerBlock: { gap: 8 },
  title: { color: palette.textPrimary, fontSize: 24, fontWeight: '700', fontFamily: 'Georgia' },
  summary: { color: palette.textSecondary, fontSize: 14, lineHeight: 22 },
  card: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 16,
    gap: 12,
  },
  cardOverline: { color: palette.accentBrass, fontSize: 10, fontWeight: '800', letterSpacing: 0.9 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.accentBrass, marginTop: 7 },
  bulletText: { color: palette.textPrimary, fontSize: 13, lineHeight: 20, flex: 1 },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: palette.accentBrassMuted,
    borderWidth: 1,
    borderColor: palette.accentBrassBorder,
    borderRadius: radius.sm,
    padding: 12,
  },
  tipText: { color: palette.textPrimary, fontSize: 13, lineHeight: 19, flex: 1 },
  sectionBlock: { gap: 10 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitle: { color: palette.textPrimary, fontSize: 16, fontWeight: '700', fontFamily: 'Georgia' },
  sectionSub: { color: palette.textSecondary, fontSize: 12, marginTop: 2 },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: palette.bgSurface,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.sm,
    padding: 2,
  },
  toggleBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4 },
  toggleBtnActive: { backgroundColor: palette.accentBrass },
  toggleText: { color: palette.textSecondary, fontSize: 11, fontWeight: '700' },
  toggleTextActive: { color: '#111317' },
  linkBtn: { paddingVertical: 4 },
  linkBtnText: { color: palette.accentBrass, fontSize: 12, fontWeight: '700' },
  quizBlock: { gap: 8, paddingTop: 4 },
  quizPrompt: { color: palette.textPrimary, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  quizOptions: { gap: 8 },
  quizOption: {
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.sm,
    padding: 11,
  },
  quizOptionCorrect: { borderColor: palette.successEmerald, backgroundColor: palette.successMuted },
  quizOptionWrong: { borderColor: palette.errorCoral, backgroundColor: palette.errorMuted },
  quizOptionText: { color: palette.textPrimary, fontSize: 13, fontWeight: '600' },
  quizExplain: { fontSize: 12, lineHeight: 18 },
  footerBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    paddingTop: 6,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: palette.accentBrass,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  completeBtnDone: {
    backgroundColor: palette.successMuted,
    borderWidth: 1,
    borderColor: palette.successEmerald,
  },
  completeBtnText: { color: '#111317', fontSize: 13, fontWeight: '800' },
  nextBtn: {
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  nextBtnText: { color: palette.textPrimary, fontSize: 13, fontWeight: '700' },
});

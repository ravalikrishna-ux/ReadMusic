import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ArrowRight,
  BookOpen,
  Compass,
  Disc3,
  Radio,
  Sparkles,
} from 'lucide-react-native';
import { findLessonById, getModulesForTrack } from '../data/curriculum';
import { useAppStore } from '../store/useAppStore';
import { palette, radius } from '../theme/tokens';

interface StudioHomeScreenProps {
  onOpenLesson: (lessonId: string) => void;
  onNavigateTab: (tab: 'course' | 'lab' | 'reference' | 'settings') => void;
  onOpenTuner: () => void;
  onOpenPaywall: () => void;
}

export const StudioHomeScreen: React.FC<StudioHomeScreenProps> = ({
  onOpenLesson,
  onNavigateTab,
  onOpenTuner,
  onOpenPaywall,
}) => {
  const { state, setTrack, getOverallStats, getModuleMasteryPercent } = useAppStore();
  const stats = getOverallStats();
  const activeEntry = findLessonById(state.lastLessonId) ?? findLessonById('T1.1')!;
  const trackModules = getModulesForTrack(state.selectedTrack);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header + Track Pill */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.overline}>STUDIO DESK • STANDARD TUNING</Text>
          <Text style={styles.title}>ReadMusic</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={onOpenTuner} style={styles.tunerPill}>
            <Radio size={14} color={palette.accentBrass} />
            <Text style={styles.tunerPillText}>Tuner</Text>
          </Pressable>
          {!state.isFullUnlocked && (
            <Pressable onPress={onOpenPaywall} style={styles.unlockChip}>
              <Text style={styles.unlockChipText}>Unlock Full ($4.99)</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Active Track Switcher */}
      <View style={styles.trackSwitcher}>
        {(
          [
            { id: 'integrated', label: 'Integrated (Both)' },
            { id: 'theory', label: 'Music Theory' },
            { id: 'reading', label: 'Reading Music' },
          ] as const
        ).map((t) => {
          const active = state.selectedTrack === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => setTrack(t.id)}
              style={[styles.trackBtn, active && styles.trackBtnActive]}
            >
              <Text style={[styles.trackBtnText, active && styles.trackBtnTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Continue Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroMetaRow}>
          <Text style={styles.heroOverline}>
            CONTINUE • {activeEntry.module.code} ({activeEntry.module.track.toUpperCase()})
          </Text>
          {activeEntry.module.isFree && !state.isFullUnlocked && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>FREE MODULE 1</Text>
            </View>
          )}
        </View>
        <Text style={styles.heroTitle}>
          {activeEntry.lesson.number}: {activeEntry.lesson.title}
        </Text>
        <Text style={styles.heroSummary}>{activeEntry.lesson.summary}</Text>

        <View style={styles.heroFooter}>
          <Pressable
            onPress={() =>
              !activeEntry.module.isFree && !state.isFullUnlocked
                ? onOpenPaywall()
                : onOpenLesson(activeEntry.lesson.id)
            }
            style={styles.heroCta}
          >
            <Text style={styles.heroCtaText}>Resume Lesson</Text>
            <ArrowRight size={15} color="#111317" />
          </Pressable>
          <Pressable
            onPress={() => onOpenLesson('R1.2')}
            style={styles.heroSecondary}
          >
            <Text style={styles.heroSecondaryText}>Jump to Sight-Reading (R1.2)</Text>
          </Pressable>
        </View>
      </View>

      {/* Musician Metrics (No Gamification) */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>CURRICULUM MASTERY</Text>
          <Text style={styles.metricValue}>
            {stats.masteredLessons} / {stats.totalLessons}
          </Text>
          <Text style={styles.metricSub}>lessons proficient or mastered</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>SIGHT-READING RANGE</Text>
          <Text style={styles.metricValueSmall}>{stats.comfortRangeLabel}</Text>
          <Text style={styles.metricSub}>
            {stats.avgPitchAccuracy > 0
              ? `${stats.avgPitchAccuracy}% avg pitch accuracy`
              : 'Complete a reading pass to calibrate'}
          </Text>
        </View>
      </View>

      {/* Quick Studio Bench Tools */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionHeader}>5-Minute Studio Bench</Text>
        <View style={styles.quickGrid}>
          <Pressable onPress={() => onNavigateTab('lab')} style={styles.quickCard}>
            <Sparkles size={18} color={palette.accentBrass} />
            <Text style={styles.quickTitle}>Fresh Sight-Read</Text>
            <Text style={styles.quickSub}>Procedural unseen passage</Text>
          </Pressable>

          <Pressable onPress={() => onNavigateTab('reference')} style={styles.quickCard}>
            <Compass size={18} color={palette.successEmerald} />
            <Text style={styles.quickTitle}>Scale & Mode Neck</Text>
            <Text style={styles.quickSub}>Pentatonic, Dorian, Mixolydian</Text>
          </Pressable>

          <Pressable onPress={() => onNavigateTab('reference')} style={styles.quickCard}>
            <Disc3 size={18} color={palette.infoSteel} />
            <Text style={styles.quickTitle}>80s/90s/00s Index</Text>
            <Text style={styles.quickSub}>21 iconic song breakdowns</Text>
          </Pressable>

          <Pressable onPress={() => onNavigateTab('course')} style={styles.quickCard}>
            <BookOpen size={18} color={palette.textPrimary} />
            <Text style={styles.quickTitle}>Full Course Tree</Text>
            <Text style={styles.quickSub}>16 modules + Test-Outs</Text>
          </Pressable>
        </View>
      </View>

      {/* Up Next on Active Track */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionHeader}>Your Roadmap Preview</Text>
          <Pressable onPress={() => onNavigateTab('course')}>
            <Text style={styles.linkText}>View all {trackModules.length} modules →</Text>
          </Pressable>
        </View>

        {trackModules.slice(0, 4).map((mod) => {
          const pct = getModuleMasteryPercent(mod.id);
          const locked = !mod.isFree && !state.isFullUnlocked;
          return (
            <Pressable
              key={mod.id}
              onPress={() =>
                locked ? onOpenPaywall() : onOpenLesson(mod.lessons[0].id)
              }
              style={styles.roadRow}
            >
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>{mod.code}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.roadTitle}>{mod.title}</Text>
                <Text style={styles.roadSub} numberOfLines={1}>
                  {state.selectedTrack === 'integrated' ? mod.synergyNote : mod.subtitle}
                </Text>
              </View>
              <Text style={[styles.roadMeta, locked && { color: palette.accentBrass }]}>
                {locked ? '$4.99' : `${pct}%`}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Quiet Practice Log */}
      {state.sessionLogs.length > 0 && (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeader}>Recent Practice Log</Text>
          {state.sessionLogs.slice(0, 4).map((log) => (
            <View key={log.id} style={styles.logRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.logTitle}>{log.title}</Text>
                <Text style={styles.logSub}>
                  {log.mode.toUpperCase()} • {log.bpm} BPM • {log.durationSec}s
                </Text>
              </View>
              <Text style={styles.logAcc}>{log.pitchAccuracy}% pitch</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bgCanvas },
  content: { padding: 16, paddingBottom: 40, gap: 18, maxWidth: 920, alignSelf: 'center', width: '100%' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  overline: { color: palette.accentBrass, fontSize: 10, fontWeight: '800', letterSpacing: 1, fontFamily: 'monospace' },
  title: { color: palette.textPrimary, fontSize: 26, fontWeight: '700', fontFamily: 'Georgia' },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  tunerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.bgSurface,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tunerPillText: { color: palette.textPrimary, fontSize: 12, fontWeight: '700' },
  unlockChip: {
    backgroundColor: palette.accentBrassMuted,
    borderWidth: 1,
    borderColor: palette.accentBrassBorder,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  unlockChipText: { color: palette.accentBrass, fontSize: 12, fontWeight: '700' },
  trackSwitcher: {
    flexDirection: 'row',
    backgroundColor: palette.bgSurface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 4,
    gap: 4,
  },
  trackBtn: { flex: 1, paddingVertical: 8, borderRadius: radius.sm, alignItems: 'center' },
  trackBtnActive: { backgroundColor: palette.bgElevated, borderWidth: 1, borderColor: palette.borderStrong },
  trackBtnText: { color: palette.textMuted, fontSize: 12, fontWeight: '600' },
  trackBtnTextActive: { color: palette.textPrimary, fontWeight: '700' },
  heroCard: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    padding: 18,
    gap: 10,
  },
  heroMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroOverline: { color: palette.accentBrass, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, fontFamily: 'monospace' },
  freeBadge: { backgroundColor: palette.successMuted, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  freeBadgeText: { color: palette.successEmerald, fontSize: 10, fontWeight: '800' },
  heroTitle: { color: palette.textPrimary, fontSize: 20, fontWeight: '700', fontFamily: 'Georgia' },
  heroSummary: { color: palette.textSecondary, fontSize: 13, lineHeight: 20 },
  heroFooter: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: palette.accentBrass,
    borderRadius: radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  heroCtaText: { color: '#111317', fontSize: 13, fontWeight: '800' },
  heroSecondary: {
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  heroSecondaryText: { color: palette.textPrimary, fontSize: 13, fontWeight: '600' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: palette.bgSurface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 14,
    gap: 4,
  },
  metricLabel: { color: palette.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  metricValue: { color: palette.textPrimary, fontSize: 22, fontWeight: '800', fontFamily: 'monospace' },
  metricValueSmall: { color: palette.textPrimary, fontSize: 16, fontWeight: '700', marginTop: 2 },
  metricSub: { color: palette.textSecondary, fontSize: 12 },
  sectionBlock: { gap: 10 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionHeader: { color: palette.textPrimary, fontSize: 16, fontWeight: '700', fontFamily: 'Georgia' },
  linkText: { color: palette.accentBrass, fontSize: 12, fontWeight: '700' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard: {
    flex: 1,
    minWidth: 155,
    backgroundColor: palette.bgSurface,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.md,
    padding: 14,
    gap: 6,
  },
  quickTitle: { color: palette.textPrimary, fontSize: 14, fontWeight: '700' },
  quickSub: { color: palette.textSecondary, fontSize: 12 },
  roadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: palette.bgSurface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 12,
  },
  codeBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: { color: palette.accentBrass, fontSize: 12, fontWeight: '800', fontFamily: 'monospace' },
  roadTitle: { color: palette.textPrimary, fontSize: 14, fontWeight: '700' },
  roadSub: { color: palette.textSecondary, fontSize: 12, marginTop: 2 },
  roadMeta: { color: palette.textSecondary, fontSize: 12, fontWeight: '700', fontFamily: 'monospace' },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: palette.bgSurface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 11,
  },
  logTitle: { color: palette.textPrimary, fontSize: 13, fontWeight: '600' },
  logSub: { color: palette.textMuted, fontSize: 11, fontFamily: 'monospace', marginTop: 2 },
  logAcc: { color: palette.successEmerald, fontSize: 12, fontWeight: '700', fontFamily: 'monospace' },
});

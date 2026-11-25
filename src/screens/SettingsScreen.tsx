import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, Lock, RotateCcw } from 'lucide-react-native';
import { useAppStore } from '../store/useAppStore';
import { palette, radius } from '../theme/tokens';

interface SettingsScreenProps {
  onOpenPaywall: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onOpenPaywall }) => {
  const {
    state,
    setNotationTheme,
    setLeftHanded,
    setTrack,
    resetPurchaseForDemo,
    resetOnboardingForDemo,
  } = useAppStore();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.overline}>STUDIO PREFERENCES & PACKS</Text>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Notation Appearance */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>SHEET MUSIC DISPLAY</Text>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Notation Surface Theme</Text>
            <Text style={styles.rowSub}>
              Engraved ivory paper prepares your eyes for printed books & PDFs.
            </Text>
          </View>
          <View style={styles.seg}>
            <Pressable
              onPress={() => setNotationTheme('paper')}
              style={[styles.segBtn, state.notationTheme === 'paper' && styles.segBtnActive]}
            >
              <Text
                style={[styles.segText, state.notationTheme === 'paper' && styles.segTextActive]}
              >
                Paper
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setNotationTheme('dark')}
              style={[styles.segBtn, state.notationTheme === 'dark' && styles.segBtnActive]}
            >
              <Text
                style={[styles.segText, state.notationTheme === 'dark' && styles.segTextActive]}
              >
                Dark Stage
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Left-Handed Fretboard Mirror</Text>
            <Text style={styles.rowSub}>
              Flips nut and fret order horizontally for left-handed guitarists.
            </Text>
          </View>
          <Pressable
            onPress={() => setLeftHanded(!state.leftHanded)}
            style={[styles.togglePill, state.leftHanded && styles.togglePillOn]}
          >
            <Text
              style={[styles.togglePillText, state.leftHanded && { color: '#111317' }]}
            >
              {state.leftHanded ? 'ON' : 'OFF'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Active Track */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>ACTIVE LEARNING PATH</Text>
        <View style={styles.chipRow}>
          {(
            [
              { id: 'integrated', label: 'Integrated (Both)' },
              { id: 'theory', label: 'Music Theory Only' },
              { id: 'reading', label: 'Reading Music Only' },
            ] as const
          ).map((t) => (
            <Pressable
              key={t.id}
              onPress={() => setTrack(t.id)}
              style={[styles.chip, state.selectedTrack === t.id && styles.chipActive]}
            >
              <Text
                style={[styles.chipText, state.selectedTrack === t.id && styles.chipTextActive]}
              >
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Instrument Packs & Entitlement */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>INSTRUMENT PACKS (ONE-TIME UNLOCKS)</Text>

        <View style={styles.packRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Guitar — Standard Tuning (E A D G B E)</Text>
            <Text style={styles.rowSub}>
              {state.isFullUnlocked
                ? 'Full Curriculum Unlocked (T1–T8, R1–R8 & Capstones)'
                : 'Free Trial (Module 1 of both tracks unlocked)'}
            </Text>
          </View>
          {state.isFullUnlocked ? (
            <View style={styles.ownedBadge}>
              <CheckCircle2 size={14} color={palette.successEmerald} />
              <Text style={styles.ownedText}>OWNED</Text>
            </View>
          ) : (
            <Pressable onPress={onOpenPaywall} style={styles.buyBtn}>
              <Text style={styles.buyBtnText}>Unlock $4.99</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.packRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: palette.textSecondary }]}>
              Bass Guitar — Bass Clef (E A D G)
            </Text>
            <Text style={styles.rowSub}>Planned modular $4.99 expansion pack</Text>
          </View>
          <View style={styles.soonBadge}>
            <Lock size={11} color={palette.textMuted} />
            <Text style={styles.soonText}>SOON</Text>
          </View>
        </View>

        <View style={styles.packRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: palette.textSecondary }]}>
              Piano / Keys — Grand Staff
            </Text>
            <Text style={styles.rowSub}>Planned modular $4.99 expansion pack</Text>
          </View>
          <View style={styles.soonBadge}>
            <Lock size={11} color={palette.textMuted} />
            <Text style={styles.soonText}>SOON</Text>
          </View>
        </View>
      </View>

      {/* Prototype Testing Helpers */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>PROTOTYPE FLOW CONTROLS</Text>
        <View style={styles.chipRow}>
          <Pressable onPress={resetOnboardingForDemo} style={styles.ghostBtn}>
            <RotateCcw size={13} color={palette.textSecondary} />
            <Text style={styles.ghostBtnText}>Replay Onboarding & Diagnostic</Text>
          </Pressable>
          {state.isFullUnlocked && (
            <Pressable onPress={resetPurchaseForDemo} style={styles.ghostBtn}>
              <Text style={styles.ghostBtnText}>Re-lock Paid Modules (Demo)</Text>
            </Pressable>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bgCanvas },
  content: { padding: 16, paddingBottom: 48, gap: 16, maxWidth: 820, alignSelf: 'center', width: '100%' },
  header: { gap: 4 },
  overline: { color: palette.accentBrass, fontSize: 10, fontWeight: '800', letterSpacing: 1, fontFamily: 'monospace' },
  title: { color: palette.textPrimary, fontSize: 24, fontWeight: '700', fontFamily: 'Georgia' },
  card: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 16,
    gap: 12,
  },
  cardLabel: { color: palette.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  rowTitle: { color: palette.textPrimary, fontSize: 14, fontWeight: '700' },
  rowSub: { color: palette.textSecondary, fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: palette.borderHairline },
  seg: {
    flexDirection: 'row',
    backgroundColor: palette.bgCanvas,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 3,
  },
  segBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4 },
  segBtnActive: { backgroundColor: palette.accentBrass },
  segText: { color: palette.textSecondary, fontSize: 12, fontWeight: '600' },
  segTextActive: { color: '#111317', fontWeight: '800' },
  togglePill: {
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  togglePillOn: { backgroundColor: palette.accentBrass, borderColor: palette.accentBrass },
  togglePillText: { color: palette.textSecondary, fontSize: 12, fontWeight: '800' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: palette.accentBrassMuted, borderColor: palette.accentBrass },
  chipText: { color: palette.textSecondary, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: palette.accentBrass, fontWeight: '700' },
  packRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  ownedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: palette.successMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
  },
  ownedText: { color: palette.successEmerald, fontSize: 11, fontWeight: '800' },
  buyBtn: { backgroundColor: palette.accentBrass, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 8 },
  buyBtnText: { color: '#111317', fontSize: 12, fontWeight: '800' },
  soonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.bgElevated,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.sm,
  },
  soonText: { color: palette.textMuted, fontSize: 10, fontWeight: '700' },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ghostBtnText: { color: palette.textPrimary, fontSize: 12, fontWeight: '600' },
});

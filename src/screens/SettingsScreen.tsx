import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, RotateCcw } from 'lucide-react-native';
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
      <Text style={styles.title}>Settings</Text>

      <View style={styles.group}>
        <View style={styles.row}>
          <Text style={styles.rowTitle}>Sheet Music Style</Text>
          <View style={styles.seg}>
            <Pressable
              onPress={() => setNotationTheme('paper')}
              style={[styles.segBtn, state.notationTheme === 'paper' && styles.segBtnActive]}
            >
              <Text style={[styles.segText, state.notationTheme === 'paper' && styles.segTextActive]}>
                Paper
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setNotationTheme('dark')}
              style={[styles.segBtn, state.notationTheme === 'dark' && styles.segBtnActive]}
            >
              <Text style={[styles.segText, state.notationTheme === 'dark' && styles.segTextActive]}>
                Dark
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.rowTitle}>Left-Handed Guitar</Text>
          <Pressable
            onPress={() => setLeftHanded(!state.leftHanded)}
            style={[styles.toggle, state.leftHanded && styles.toggleOn]}
          >
            <Text style={[styles.toggleText, state.leftHanded && { color: '#111317' }]}>
              {state.leftHanded ? 'ON' : 'OFF'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.rowTitle}>Learning Track</Text>
          <View style={styles.seg}>
            {(
              [
                { id: 'integrated', label: 'Both' },
                { id: 'theory', label: 'Theory' },
                { id: 'reading', label: 'Reading' },
              ] as const
            ).map((t) => (
              <Pressable
                key={t.id}
                onPress={() => setTrack(t.id)}
                style={[styles.segBtn, state.selectedTrack === t.id && styles.segBtnActive]}
              >
                <Text
                  style={[styles.segText, state.selectedTrack === t.id && styles.segTextActive]}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.group}>
        <View style={styles.row}>
          <View>
            <Text style={styles.rowTitle}>Guitar Full Course</Text>
            <Text style={styles.rowSub}>
              {state.isFullUnlocked ? 'Unlocked forever' : 'Module 1 free · $4.99 once'}
            </Text>
          </View>
          {state.isFullUnlocked ? (
            <View style={styles.owned}>
              <CheckCircle2 size={15} color={palette.successEmerald} />
              <Text style={styles.ownedText}>Owned</Text>
            </View>
          ) : (
            <Pressable onPress={onOpenPaywall} style={styles.buyBtn}>
              <Text style={styles.buyBtnText}>Unlock $4.99</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={resetOnboardingForDemo} style={styles.ghostBtn}>
          <RotateCcw size={14} color={palette.textSecondary} />
          <Text style={styles.ghostText}>Replay Setup</Text>
        </Pressable>
        {state.isFullUnlocked && (
          <Pressable onPress={resetPurchaseForDemo} style={styles.ghostBtn}>
            <Text style={styles.ghostText}>Reset Unlock (Demo)</Text>
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
    gap: 18,
    maxWidth: 680,
    alignSelf: 'center',
    width: '100%',
  },
  title: { color: palette.textPrimary, fontSize: 24, fontWeight: '700', fontFamily: 'Georgia' },
  group: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 12,
    flexWrap: 'wrap',
  },
  rowTitle: { color: palette.textPrimary, fontSize: 15, fontWeight: '600' },
  rowSub: { color: palette.textSecondary, fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: palette.borderHairline },
  seg: {
    flexDirection: 'row',
    backgroundColor: palette.bgCanvas,
    borderRadius: radius.sm,
    padding: 3,
    gap: 2,
  },
  segBtn: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: 6 },
  segBtnActive: { backgroundColor: palette.accentBrass },
  segText: { color: palette.textSecondary, fontSize: 12, fontWeight: '700' },
  segTextActive: { color: '#111317', fontWeight: '800' },
  toggle: {
    backgroundColor: palette.bgElevated,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  toggleOn: { backgroundColor: palette.accentBrass },
  toggleText: { color: palette.textSecondary, fontSize: 12, fontWeight: '800' },
  owned: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: palette.successMuted,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  ownedText: { color: palette.successEmerald, fontSize: 12, fontWeight: '800' },
  buyBtn: {
    backgroundColor: palette.accentBrass,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  buyBtnText: { color: '#111317', fontSize: 13, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.bgSurface,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ghostText: { color: palette.textPrimary, fontSize: 13, fontWeight: '600' },
});

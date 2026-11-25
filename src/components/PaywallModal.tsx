import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, ShieldCheck, X } from 'lucide-react-native';
import { palette, radius } from '../theme/tokens';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onUnlock: () => void;
}

const INCLUDED_ITEMS = [
  'All 8 Guitar Music Theory Modules (Intervals, Scales, CAGED, Harmony, Rhythm & Modes)',
  'All 8 Standard Notation Reading Modules (Full Open Pos. → Pos. V/VII → Slash Charts & Polyphony)',
  '20+ iconic 80s, 90s & 00s rock & pop analytical song breakdowns',
  'Unlimited Procedural Sight-Reading Generator across every key & neck position',
  'Full-Song Capstone Repertoire played purely from sheet music in Music Stand Mode',
  '100% offline forever • No subscriptions • No account required',
];

export const PaywallModal: React.FC<PaywallModalProps> = ({
  visible,
  onClose,
  onUnlock,
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.topRow}>
            <View style={styles.priceBadge}>
              <Text style={styles.priceBadgeText}>ONE-TIME UNLOCK • NO SUBSCRIPTION</Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close unlock modal"
              style={styles.closeBtn}
            >
              <X size={18} color={palette.textSecondary} />
            </Pressable>
          </View>

          <Text style={styles.headline}>Unlock the Complete Guitar Curriculum</Text>
          <Text style={styles.sub}>
            Pay $4.99 once on iOS or Android. Keep every module, sight-reading generator, and
            capstone score offline forever.
          </Text>

          <View style={styles.list}>
            {INCLUDED_ITEMS.map((item, idx) => (
              <View key={idx} style={styles.listItem}>
                <Check size={15} color={palette.successEmerald} style={{ marginTop: 2 }} />
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>

          <Pressable onPress={onUnlock} style={styles.unlockBtn}>
            <Text style={styles.unlockBtnText}>Unlock Full Guitar Course — $4.99</Text>
          </Pressable>

          <View style={styles.footerRow}>
            <Pressable onPress={onUnlock} style={styles.footerLink}>
              <ShieldCheck size={13} color={palette.textMuted} />
              <Text style={styles.footerLinkText}>Restore Previous Purchase</Text>
            </Pressable>
            <Pressable onPress={onClose}>
              <Text style={styles.footerLinkText}>Keep Practicing Free Module 1</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(8, 10, 14, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: palette.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    padding: 22,
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceBadge: {
    backgroundColor: palette.accentBrassMuted,
    borderColor: palette.accentBrassBorder,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  priceBadgeText: {
    color: palette.accentBrass,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  closeBtn: {
    padding: 4,
  },
  headline: {
    color: palette.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  sub: {
    color: palette.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  list: {
    gap: 10,
    paddingVertical: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  listText: {
    color: palette.textPrimary,
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  unlockBtn: {
    backgroundColor: palette.accentBrass,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  unlockBtnText: {
    color: '#111317',
    fontSize: 15,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 4,
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerLinkText: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});

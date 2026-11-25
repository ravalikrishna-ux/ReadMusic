import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { palette, radius } from '../theme/tokens';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onUnlock: () => void;
}

const PERKS = [
  'All 16 Guitar Modules (Theory + Sheet Reading)',
  '20+ iconic 80s, 90s & 00s song breakdowns',
  'Unlimited sight-reading generator & full songs',
  'Pay once ($4.99) · Works 100% offline forever',
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
            <Text style={styles.badge}>ONE-TIME UNLOCK</Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close unlock modal"
              style={{ padding: 6 }}
            >
              <X size={18} color={palette.textSecondary} />
            </Pressable>
          </View>

          <Text style={styles.headline}>Unlock Full Guitar Course</Text>
          <Text style={styles.sub}>No subscription. Pay $4.99 once and keep everything forever.</Text>

          <View style={styles.list}>
            {PERKS.map((item) => (
              <View key={item} style={styles.listItem}>
                <Check size={16} color={palette.successEmerald} />
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>

          <Pressable onPress={onUnlock} style={styles.unlockBtn}>
            <Text style={styles.unlockBtnText}>Unlock Everything — $4.99</Text>
          </Pressable>

          <View style={styles.footerRow}>
            <Pressable onPress={onUnlock}>
              <Text style={styles.footerLink}>Restore Purchase</Text>
            </Pressable>
            <Pressable onPress={onClose}>
              <Text style={styles.footerLink}>Not Now</Text>
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
    maxWidth: 420,
    backgroundColor: palette.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    padding: 24,
    gap: 14,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { color: palette.accentBrass, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  headline: { color: palette.textPrimary, fontSize: 22, fontWeight: '700', fontFamily: 'Georgia' },
  sub: { color: palette.textSecondary, fontSize: 14, lineHeight: 20 },
  list: { gap: 10, paddingVertical: 6 },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  listText: { color: palette.textPrimary, fontSize: 14, flex: 1 },
  unlockBtn: {
    backgroundColor: palette.accentBrass,
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: 'center',
  },
  unlockBtnText: { color: '#111317', fontSize: 15, fontWeight: '800' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 4 },
  footerLink: { color: palette.textMuted, fontSize: 13, fontWeight: '600' },
});

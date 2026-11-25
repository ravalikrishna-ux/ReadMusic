import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Button, IconButton, Surface, Text } from 'react-native-paper';
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
        <Surface elevation={4} style={styles.sheet}>
          <View style={styles.topRow}>
            <Text variant="labelMedium" style={styles.badge}>
              ONE-TIME UNLOCK
            </Text>
            <IconButton
              size={18}
              icon={({ size, color }) => <X size={size} color={color} />}
              onPress={onClose}
              accessibilityLabel="Close unlock modal"
              style={{ margin: 0 }}
            />
          </View>

          <Text variant="headlineSmall" style={styles.headline}>
            Unlock Full Guitar Course
          </Text>
          <Text variant="bodyMedium" style={styles.sub}>
            No subscription. Pay $4.99 once and keep everything forever.
          </Text>

          <View style={styles.list}>
            {PERKS.map((item) => (
              <View key={item} style={styles.listItem}>
                <Check size={17} color={palette.successEmerald} />
                <Text variant="bodyMedium" style={styles.listText}>
                  {item}
                </Text>
              </View>
            ))}
          </View>

          <Button mode="contained" contentStyle={{ paddingVertical: 6 }} onPress={onUnlock}>
            Unlock Everything — $4.99
          </Button>

          <View style={styles.footerRow}>
            <Button mode="text" compact onPress={onUnlock}>
              Restore Purchase
            </Button>
            <Button mode="text" compact onPress={onClose}>
              Not Now
            </Button>
          </View>
        </Surface>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 32, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: palette.bgSurface,
    borderRadius: 24,
    padding: 24,
    gap: 12,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { color: palette.primary, fontWeight: '800', letterSpacing: 0.8 },
  headline: { color: palette.textPrimary, fontWeight: '700' },
  sub: { color: palette.textSecondary, lineHeight: 20 },
  list: { gap: 10, paddingVertical: 8 },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  listText: { color: palette.textPrimary, flex: 1 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 2 },
});

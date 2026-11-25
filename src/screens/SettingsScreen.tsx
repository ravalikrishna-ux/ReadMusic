import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Divider, List, SegmentedButtons, Surface, Switch, Text } from 'react-native-paper';
import { CheckCircle2, RotateCcw } from 'lucide-react-native';
import { TrackId } from '../core/music/types';
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
      <Text variant="headlineSmall" style={styles.title}>
        Settings
      </Text>

      <Surface elevation={1} style={styles.card}>
        <List.Item
          title="Dark Sheet Music"
          description="Switch between paper white and dark stage view"
          right={() => (
            <Switch
              value={state.notationTheme === 'dark'}
              onValueChange={(val) => setNotationTheme(val ? 'dark' : 'paper')}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Left-Handed Guitar"
          description="Mirror the neck horizontally"
          right={() => (
            <Switch value={state.leftHanded} onValueChange={(val) => setLeftHanded(val)} />
          )}
        />
        <Divider />
        <View style={styles.trackRow}>
          <Text variant="bodyLarge" style={{ fontWeight: '500', marginBottom: 8 }}>
            Learning Track
          </Text>
          <SegmentedButtons
            value={state.selectedTrack}
            onValueChange={(v) => setTrack(v as TrackId)}
            density="small"
            buttons={[
              { value: 'integrated', label: 'Both' },
              { value: 'theory', label: 'Theory' },
              { value: 'reading', label: 'Reading' },
            ]}
          />
        </View>
      </Surface>

      <Surface elevation={1} style={styles.card}>
        <List.Item
          title="Guitar Full Course"
          description={state.isFullUnlocked ? 'Unlocked forever' : 'Module 1 free · $4.99 once'}
          right={() =>
            state.isFullUnlocked ? (
              <Chip
                compact
                style={{ backgroundColor: palette.successMuted, alignSelf: 'center' }}
                textStyle={{ color: palette.successEmerald, fontWeight: '800' }}
                icon={({ size }) => <CheckCircle2 size={size - 2} color={palette.successEmerald} />}
              >
                Owned
              </Chip>
            ) : (
              <Button mode="contained" compact onPress={onOpenPaywall} style={{ alignSelf: 'center' }}>
                Unlock $4.99
              </Button>
            )
          }
        />
      </Surface>

      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={resetOnboardingForDemo}
          icon={({ size, color }) => <RotateCcw size={size - 3} color={color} />}
        >
          Replay Setup
        </Button>
        {state.isFullUnlocked && (
          <Button mode="text" onPress={resetPurchaseForDemo}>
            Reset Unlock (Demo)
          </Button>
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
  title: { color: palette.textPrimary, fontWeight: '800' },
  card: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    overflow: 'hidden',
  },
  trackRow: { paddingHorizontal: 16, paddingVertical: 14 },
  actions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
});

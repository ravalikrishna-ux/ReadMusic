import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { PaperProvider, Surface, Text } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Check, Compass, Music, Settings } from 'lucide-react-native';
import { GuitarTunerModal } from './src/components/GuitarTunerModal';
import { PaywallModal } from './src/components/PaywallModal';
import { LearnScreen } from './src/screens/LearnScreen';
import { LessonDetailScreen } from './src/screens/LessonDetailScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ReferenceScreen } from './src/screens/ReferenceScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SightReadLabScreen } from './src/screens/SightReadLabScreen';
import { AppStoreProvider, useAppStore } from './src/store/useAppStore';
import { readMusicPaperTheme } from './src/theme/paperTheme';
import { palette } from './src/theme/tokens';

type TabId = 'learn' | 'practice' | 'explore' | 'settings';

const ReadMusicShell: React.FC = () => {
  const { state, hydrated, unlockFullCourse } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabId>('learn');
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [tunerOpen, setTunerOpen] = useState(false);

  if (!hydrated) {
    return (
      <View style={[styles.root, styles.center]}>
        <Text variant="headlineSmall" style={{ color: palette.primary, fontWeight: '800' }}>
          ReadMusic
        </Text>
      </View>
    );
  }

  if (!state.hasCompletedOnboarding) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        <OnboardingScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />

      <View style={styles.main}>
        {activeLessonId ? (
          <LessonDetailScreen
            lessonId={activeLessonId}
            onBack={() => setActiveLessonId(null)}
            onOpenLesson={(nextId) => setActiveLessonId(nextId)}
          />
        ) : activeTab === 'learn' ? (
          <LearnScreen
            onOpenLesson={(id) => setActiveLessonId(id)}
            onOpenTuner={() => setTunerOpen(true)}
            onOpenPaywall={() => setPaywallOpen(true)}
          />
        ) : activeTab === 'practice' ? (
          <SightReadLabScreen onOpenPaywall={() => setPaywallOpen(true)} />
        ) : activeTab === 'explore' ? (
          <ReferenceScreen />
        ) : (
          <SettingsScreen onOpenPaywall={() => setPaywallOpen(true)} />
        )}
      </View>

      {/* Material Design 3 Bottom Navigation Bar with Tonal Pill Indicator */}
      <Surface elevation={2} style={styles.tabBar}>
        {(
          [
            { id: 'learn', label: 'Learn', Icon: BookOpen },
            { id: 'practice', label: 'Practice', Icon: Music },
            { id: 'explore', label: 'Explore', Icon: Compass },
            { id: 'settings', label: 'Settings', Icon: Settings },
          ] as const
        ).map(({ id, label, Icon }) => {
          const isCurrent = !activeLessonId && activeTab === id;
          return (
            <Pressable
              key={id}
              onPress={() => {
                setActiveLessonId(null);
                setActiveTab(id);
              }}
              style={styles.tabItem}
            >
              <View style={[styles.pillIndicator, isCurrent && styles.pillIndicatorActive]}>
                <Icon
                  size={20}
                  color={isCurrent ? palette.onPrimaryContainer : palette.textSecondary}
                />
              </View>
              <Text
                variant="labelSmall"
                style={[styles.tabLabel, isCurrent && styles.tabLabelActive]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </Surface>

      <PaywallModal
        visible={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onUnlock={() => {
          unlockFullCourse();
          setPaywallOpen(false);
        }}
      />
      <GuitarTunerModal visible={tunerOpen} onClose={() => setTunerOpen(false)} />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider
        theme={readMusicPaperTheme}
        settings={{
          icon: ({ size, color }) => <Check size={size} color={color} />,
        }}
      >
        <AppStoreProvider>
          <ReadMusicShell />
        </AppStoreProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bgCanvas },
  center: { alignItems: 'center', justifyContent: 'center' },
  main: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: palette.bgSurface,
    borderTopWidth: 1,
    borderTopColor: palette.borderHairline,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pillIndicator: {
    paddingHorizontal: 18,
    paddingVertical: 5,
    borderRadius: 16,
  },
  pillIndicatorActive: {
    backgroundColor: palette.primaryContainer,
  },
  tabLabel: { color: palette.textSecondary, fontWeight: '600' },
  tabLabelActive: { color: palette.textPrimary, fontWeight: '800' },
});

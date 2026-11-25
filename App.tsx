import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { BookMarked, Compass, Home, Music, Settings } from 'lucide-react-native';
import { GuitarTunerModal } from './src/components/GuitarTunerModal';
import { PaywallModal } from './src/components/PaywallModal';
import { CourseTreeScreen } from './src/screens/CourseTreeScreen';
import { LessonDetailScreen } from './src/screens/LessonDetailScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ReferenceScreen } from './src/screens/ReferenceScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SightReadLabScreen } from './src/screens/SightReadLabScreen';
import { StudioHomeScreen } from './src/screens/StudioHomeScreen';
import { AppStoreProvider, useAppStore } from './src/store/useAppStore';
import { palette } from './src/theme/tokens';

type TabId = 'home' | 'course' | 'lab' | 'reference' | 'settings';

const ReadMusicShell: React.FC = () => {
  const { state, hydrated, unlockFullCourse } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [tunerOpen, setTunerOpen] = useState(false);

  if (!hydrated) {
    return (
      <View style={[styles.root, styles.center]}>
        <Text style={styles.loadingText}>ReadMusic</Text>
      </View>
    );
  }

  if (!state.hasCompletedOnboarding) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar style="light" />
        <OnboardingScreen />
      </SafeAreaView>
    );
  }

  const openLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />

      {/* Main Content Area */}
      <View style={styles.main}>
        {activeLessonId ? (
          <LessonDetailScreen
            lessonId={activeLessonId}
            onBack={() => setActiveLessonId(null)}
            onOpenLesson={(nextId) => setActiveLessonId(nextId)}
          />
        ) : activeTab === 'home' ? (
          <StudioHomeScreen
            onOpenLesson={openLesson}
            onNavigateTab={(t) => setActiveTab(t)}
            onOpenTuner={() => setTunerOpen(true)}
            onOpenPaywall={() => setPaywallOpen(true)}
          />
        ) : activeTab === 'course' ? (
          <CourseTreeScreen
            onOpenLesson={openLesson}
            onOpenPaywall={() => setPaywallOpen(true)}
          />
        ) : activeTab === 'lab' ? (
          <SightReadLabScreen onOpenPaywall={() => setPaywallOpen(true)} />
        ) : activeTab === 'reference' ? (
          <ReferenceScreen />
        ) : (
          <SettingsScreen onOpenPaywall={() => setPaywallOpen(true)} />
        )}
      </View>

      {/* Bottom 5-Tab Studio Navigation Bar */}
      <View style={styles.tabBar}>
        {(
          [
            { id: 'home', label: 'Studio', Icon: Home },
            { id: 'course', label: 'Course', Icon: Compass },
            { id: 'lab', label: 'Sight-Read', Icon: Music },
            { id: 'reference', label: 'Reference', Icon: BookMarked },
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
              <Icon
                size={19}
                color={isCurrent ? palette.accentBrass : palette.textMuted}
              />
              <Text style={[styles.tabLabel, isCurrent && styles.tabLabelActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Modals */}
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
      <AppStoreProvider>
        <ReadMusicShell />
      </AppStoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bgCanvas,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: palette.accentBrass,
    fontSize: 22,
    fontFamily: 'Georgia',
    fontWeight: '700',
  },
  main: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: palette.bgSurface,
    borderTopWidth: 1,
    borderTopColor: palette.borderHairline,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 2,
  },
  tabLabel: {
    color: palette.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: palette.accentBrass,
    fontWeight: '800',
  },
});

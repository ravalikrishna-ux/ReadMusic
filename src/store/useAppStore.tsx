import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  InputMode,
  LessonProgress,
  MasteryStatus,
  NotationTheme,
  PracticeSessionLog,
  TrackId,
} from '../core/music/types';
import { CURRICULUM_MODULES } from '../data/curriculum';

const STORAGE_KEY = 'readmusic_state_v1';

export interface PersistedState {
  hasCompletedOnboarding: boolean;
  selectedTrack: TrackId;
  inputMode: InputMode;
  notationTheme: NotationTheme;
  leftHanded: boolean;
  isFullUnlocked: boolean; // $4.99 one-time Guitar unlock
  suggestedTestOuts: string[]; // module IDs flagged by Diagnostic Calibration
  progressByLesson: Record<string, LessonProgress>;
  sessionLogs: PracticeSessionLog[];
  lastLessonId: string;
}

const DEFAULT_STATE: PersistedState = {
  hasCompletedOnboarding: false,
  selectedTrack: 'integrated',
  inputMode: 'touch',
  notationTheme: 'paper',
  leftHanded: false,
  isFullUnlocked: false,
  suggestedTestOuts: [],
  progressByLesson: {},
  sessionLogs: [],
  lastLessonId: 'T1.1',
};

interface AppStoreContextValue {
  state: PersistedState;
  hydrated: boolean;
  completeOnboarding: (params: {
    track: TrackId;
    inputMode: InputMode;
    suggestedTestOuts?: string[];
    startLessonId?: string;
  }) => void;
  setTrack: (track: TrackId) => void;
  setInputMode: (mode: InputMode) => void;
  setNotationTheme: (theme: NotationTheme) => void;
  setLeftHanded: (val: boolean) => void;
  unlockFullCourse: () => void;
  resetPurchaseForDemo: () => void;
  resetOnboardingForDemo: () => void;
  recordLessonProgress: (
    lessonId: string,
    update: Partial<LessonProgress> & { status?: MasteryStatus }
  ) => void;
  markModuleTestedOut: (moduleId: string) => void;
  logPracticeSession: (entry: Omit<PracticeSessionLog, 'id' | 'timestamp'>) => void;
  getModuleMasteryPercent: (moduleId: string) => number;
  getOverallStats: () => {
    masteredLessons: number;
    totalLessons: number;
    totalMinutesPracticed: number;
    avgPitchAccuracy: number;
    comfortRangeLabel: string;
  };
}

const AppStoreContext = createContext<AppStoreContextValue | null>(null);

export const AppStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PersistedState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active) return;
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as Partial<PersistedState>;
            setState((prev) => ({ ...prev, ...parsed }));
          } catch {
            // Keep default state on corrupt JSON
          }
        }
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback((updater: (prev: PersistedState) => PersistedState) => {
    setState((prev) => {
      const next = updater(prev);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const completeOnboarding = useCallback(
    (params: {
      track: TrackId;
      inputMode: InputMode;
      suggestedTestOuts?: string[];
      startLessonId?: string;
    }) => {
      persist((prev) => ({
        ...prev,
        hasCompletedOnboarding: true,
        selectedTrack: params.track,
        inputMode: params.inputMode,
        suggestedTestOuts: params.suggestedTestOuts ?? [],
        lastLessonId:
          params.startLessonId ?? (params.track === 'reading' ? 'R1.1' : 'T1.1'),
      }));
    },
    [persist]
  );

  const setTrack = useCallback(
    (track: TrackId) => persist((prev) => ({ ...prev, selectedTrack: track })),
    [persist]
  );

  const setInputMode = useCallback(
    (inputMode: InputMode) => persist((prev) => ({ ...prev, inputMode })),
    [persist]
  );

  const setNotationTheme = useCallback(
    (notationTheme: NotationTheme) => persist((prev) => ({ ...prev, notationTheme })),
    [persist]
  );

  const setLeftHanded = useCallback(
    (leftHanded: boolean) => persist((prev) => ({ ...prev, leftHanded })),
    [persist]
  );

  const unlockFullCourse = useCallback(
    () => persist((prev) => ({ ...prev, isFullUnlocked: true })),
    [persist]
  );

  const resetPurchaseForDemo = useCallback(
    () => persist((prev) => ({ ...prev, isFullUnlocked: false })),
    [persist]
  );

  const resetOnboardingForDemo = useCallback(
    () => persist((prev) => ({ ...prev, hasCompletedOnboarding: false })),
    [persist]
  );

  const recordLessonProgress = useCallback(
    (lessonId: string, update: Partial<LessonProgress> & { status?: MasteryStatus }) => {
      persist((prev) => {
        const existing = prev.progressByLesson[lessonId] ?? {
          lessonId,
          status: 'not_started' as MasteryStatus,
          bestPitchAccuracy: 0,
          bestTimingAccuracy: 0,
          bestBpm: 0,
          updatedAt: Date.now(),
        };
        const statusRank: Record<MasteryStatus, number> = {
          not_started: 0,
          in_progress: 1,
          proficient: 2,
          mastered: 3,
        };
        const nextStatus =
          update.status && statusRank[update.status] >= statusRank[existing.status]
            ? update.status
            : existing.status;

        return {
          ...prev,
          lastLessonId: lessonId,
          progressByLesson: {
            ...prev.progressByLesson,
            [lessonId]: {
              ...existing,
              ...update,
              status: nextStatus,
              bestPitchAccuracy: Math.max(
                existing.bestPitchAccuracy,
                update.bestPitchAccuracy ?? 0
              ),
              bestTimingAccuracy: Math.max(
                existing.bestTimingAccuracy,
                update.bestTimingAccuracy ?? 0
              ),
              bestBpm: Math.max(existing.bestBpm, update.bestBpm ?? 0),
              updatedAt: Date.now(),
            },
          },
        };
      });
    },
    [persist]
  );

  const markModuleTestedOut = useCallback(
    (moduleId: string) => {
      const mod = CURRICULUM_MODULES.find((m) => m.id === moduleId);
      if (!mod) return;
      persist((prev) => {
        const nextMap = { ...prev.progressByLesson };
        for (const lesson of mod.lessons) {
          nextMap[lesson.id] = {
            lessonId: lesson.id,
            status: 'mastered',
            bestPitchAccuracy: 100,
            bestTimingAccuracy: 100,
            bestBpm: 90,
            testedOut: true,
            updatedAt: Date.now(),
          };
        }
        return {
          ...prev,
          progressByLesson: nextMap,
          suggestedTestOuts: prev.suggestedTestOuts.filter((id) => id !== moduleId),
        };
      });
    },
    [persist]
  );

  const logPracticeSession = useCallback(
    (entry: Omit<PracticeSessionLog, 'id' | 'timestamp'>) => {
      persist((prev) => ({
        ...prev,
        sessionLogs: [
          {
            ...entry,
            id: `sess-${Date.now()}`,
            timestamp: Date.now(),
          },
          ...prev.sessionLogs,
        ].slice(0, 40),
      }));
    },
    [persist]
  );

  const getModuleMasteryPercent = useCallback(
    (moduleId: string) => {
      const mod = CURRICULUM_MODULES.find((m) => m.id === moduleId);
      if (!mod || mod.lessons.length === 0) return 0;
      let score = 0;
      for (const lesson of mod.lessons) {
        const status = state.progressByLesson[lesson.id]?.status;
        if (status === 'mastered') score += 1;
        else if (status === 'proficient') score += 0.8;
        else if (status === 'in_progress') score += 0.35;
      }
      return Math.round((score / mod.lessons.length) * 100);
    },
    [state.progressByLesson]
  );

  const getOverallStats = useCallback(() => {
    const allLessons = CURRICULUM_MODULES.flatMap((m) => m.lessons);
    let masteredLessons = 0;
    for (const l of allLessons) {
      const st = state.progressByLesson[l.id]?.status;
      if (st === 'mastered' || st === 'proficient') masteredLessons++;
    }
    const totalSeconds = state.sessionLogs.reduce((acc, s) => acc + s.durationSec, 0);
    const avgPitch =
      state.sessionLogs.length > 0
        ? Math.round(
            state.sessionLogs.reduce((acc, s) => acc + s.pitchAccuracy, 0) /
              state.sessionLogs.length
          )
        : 0;

    let comfortRangeLabel = 'Open Treble (G4–G5)';
    if (getModuleMasteryPercent('R6') >= 50) comfortRangeLabel = 'Neck-Wide (Open + Pos. V–VII)';
    else if (getModuleMasteryPercent('R4') >= 50) comfortRangeLabel = 'Open Pos. • Keys C, G, D, Em';
    else if (getModuleMasteryPercent('R2') >= 50) comfortRangeLabel = 'Full 6-String Open (E3–G5)';

    return {
      masteredLessons,
      totalLessons: allLessons.length,
      totalMinutesPracticed: Math.max(0, Math.round(totalSeconds / 60)),
      avgPitchAccuracy: avgPitch,
      comfortRangeLabel,
    };
  }, [state.progressByLesson, state.sessionLogs, getModuleMasteryPercent]);

  return (
    <AppStoreContext.Provider
      value={{
        state,
        hydrated,
        completeOnboarding,
        setTrack,
        setInputMode,
        setNotationTheme,
        setLeftHanded,
        unlockFullCourse,
        resetPurchaseForDemo,
        resetOnboardingForDemo,
        recordLessonProgress,
        markModuleTestedOut,
        logPracticeSession,
        getModuleMasteryPercent,
        getOverallStats,
      }}
    >
      {children}
    </AppStoreContext.Provider>
  );
};

export function useAppStore(): AppStoreContextValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used inside AppStoreProvider');
  return ctx;
}

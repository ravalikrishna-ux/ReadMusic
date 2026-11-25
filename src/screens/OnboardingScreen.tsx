import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BookOpen, CheckCircle2, Compass, Layers } from 'lucide-react-native';
import { TrackId } from '../core/music/types';
import { DIAGNOSTIC_QUESTIONS } from '../data/curriculum';
import { useAppStore } from '../store/useAppStore';
import { palette, radius } from '../theme/tokens';

export const OnboardingScreen: React.FC = () => {
  const { completeOnboarding } = useAppStore();
  const [step, setStep] = useState<'track' | 'diagnostic'>('track');
  const [selectedTrack, setSelectedTrack] = useState<TrackId>('integrated');
  const [diagIdx, setDiagIdx] = useState(0);
  const [diagAnswers, setDiagAnswers] = useState<Record<string, boolean>>({});

  const finishOnboarding = (answers: Record<string, boolean> = {}) => {
    const suggestedTestOuts: string[] = [];
    if (answers['diag-1']) suggestedTestOuts.push('T1');
    if (answers['diag-2']) suggestedTestOuts.push('T4');
    if (answers['diag-3']) suggestedTestOuts.push('R1');
    if (answers['diag-4']) suggestedTestOuts.push('R3');
    if (answers['diag-5']) suggestedTestOuts.push('R6');

    completeOnboarding({
      track: selectedTrack,
      inputMode: 'touch',
      suggestedTestOuts,
      startLessonId: selectedTrack === 'reading' ? 'R1.1' : 'T1.1',
    });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <Text style={styles.brand}>ReadMusic</Text>

        {step === 'track' ? (
          <View style={styles.block}>
            <Text style={styles.headline}>What do you want to learn?</Text>
            <Text style={styles.sub}>Pick one to start. You can switch anytime.</Text>

            <View style={styles.cards}>
              {[
                {
                  id: 'integrated' as TrackId,
                  title: 'Both (Recommended)',
                  desc: 'Music theory + reading sheet music together',
                  icon: <Layers size={22} color={palette.accentBrass} />,
                },
                {
                  id: 'theory' as TrackId,
                  title: 'Music Theory',
                  desc: 'Scales, chords & 80s/90s/00s hit songs',
                  icon: <Compass size={22} color={palette.accentBrass} />,
                },
                {
                  id: 'reading' as TrackId,
                  title: 'Read Sheet Music',
                  desc: 'Start with simple notes, play full songs',
                  icon: <BookOpen size={22} color={palette.accentBrass} />,
                },
              ].map((opt) => {
                const active = selectedTrack === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setSelectedTrack(opt.id)}
                    style={[styles.card, active && styles.cardActive]}
                  >
                    <View style={styles.cardIcon}>{opt.icon}</View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{opt.title}</Text>
                      <Text style={styles.cardDesc}>{opt.desc}</Text>
                    </View>
                    {active && <CheckCircle2 size={20} color={palette.accentBrass} />}
                  </Pressable>
                );
              })}
            </View>

            <Pressable onPress={() => finishOnboarding()} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Start Learning →</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setDiagIdx(0);
                setStep('diagnostic');
              }}
              style={styles.secondaryLink}
            >
              <Text style={styles.secondaryLinkText}>
                Already know some theory or notes? Take 1-min skill check
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.block}>
            <View style={styles.diagTop}>
              <Text style={styles.headline}>Quick Skill Check</Text>
              <Text style={styles.counter}>
                {diagIdx + 1} / {DIAGNOSTIC_QUESTIONS.length}
              </Text>
            </View>

            {(() => {
              const q = DIAGNOSTIC_QUESTIONS[diagIdx];
              return (
                <View style={styles.quizCard}>
                  <Text style={styles.quizPrompt}>{q.prompt}</Text>
                  <View style={styles.optList}>
                    {q.options.map((opt, idx) => (
                      <Pressable
                        key={opt}
                        onPress={() => {
                          const next = { ...diagAnswers, [q.id]: idx === q.correctIndex };
                          setDiagAnswers(next);
                          if (diagIdx + 1 >= DIAGNOSTIC_QUESTIONS.length) finishOnboarding(next);
                          else setDiagIdx(diagIdx + 1);
                        }}
                        style={styles.optBtn}
                      >
                        <Text style={styles.optText}>{opt}</Text>
                      </Pressable>
                    ))}
                    <Pressable
                      onPress={() => {
                        const next = { ...diagAnswers, [q.id]: false };
                        setDiagAnswers(next);
                        if (diagIdx + 1 >= DIAGNOSTIC_QUESTIONS.length) finishOnboarding(next);
                        else setDiagIdx(diagIdx + 1);
                      }}
                      style={styles.skipBtn}
                    >
                      <Text style={styles.skipText}>Not sure yet</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })()}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bgCanvas },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: { width: '100%', maxWidth: 520, gap: 24 },
  brand: {
    color: palette.accentBrass,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Georgia',
    letterSpacing: 0.4,
  },
  block: { gap: 16 },
  headline: {
    color: palette.textPrimary,
    fontSize: 30,
    fontWeight: '700',
    fontFamily: 'Georgia',
    lineHeight: 36,
  },
  sub: { color: palette.textSecondary, fontSize: 15 },
  cards: { gap: 12, marginTop: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: palette.bgSurface,
    borderWidth: 1.5,
    borderColor: palette.borderHairline,
    borderRadius: radius.lg,
    padding: 18,
  },
  cardActive: {
    borderColor: palette.accentBrass,
    backgroundColor: palette.bgElevated,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: palette.accentBrassMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { color: palette.textPrimary, fontSize: 16, fontWeight: '700' },
  cardDesc: { color: palette.textSecondary, fontSize: 13, marginTop: 3 },
  primaryBtn: {
    backgroundColor: palette.accentBrass,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryBtnText: { color: '#111317', fontSize: 16, fontWeight: '800' },
  secondaryLink: { alignItems: 'center', paddingVertical: 8 },
  secondaryLinkText: { color: palette.textSecondary, fontSize: 13, fontWeight: '600' },
  diagTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  counter: { color: palette.accentBrass, fontSize: 14, fontWeight: '800', fontFamily: 'monospace' },
  quizCard: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 20,
    gap: 16,
  },
  quizPrompt: { color: palette.textPrimary, fontSize: 17, fontWeight: '600', lineHeight: 25 },
  optList: { gap: 10 },
  optBtn: {
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.md,
    padding: 15,
  },
  optText: { color: palette.textPrimary, fontSize: 15, fontWeight: '600' },
  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipText: { color: palette.textMuted, fontSize: 13, fontWeight: '600' },
});

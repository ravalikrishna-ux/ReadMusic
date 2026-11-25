import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Surface, Text } from 'react-native-paper';
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
        <Text variant="titleMedium" style={styles.brand}>
          ReadMusic
        </Text>

        {step === 'track' ? (
          <View style={styles.block}>
            <Text variant="headlineMedium" style={styles.headline}>
              What do you want to learn?
            </Text>
            <Text variant="bodyLarge" style={styles.sub}>
              Pick one to start. You can switch anytime.
            </Text>

            <View style={styles.cards}>
              {[
                {
                  id: 'integrated' as TrackId,
                  title: 'Both (Recommended)',
                  desc: 'Music theory + reading sheet music together',
                  icon: <Layers size={22} color={palette.primary} />,
                },
                {
                  id: 'theory' as TrackId,
                  title: 'Music Theory',
                  desc: 'Scales, chords & 80s/90s/00s hit songs',
                  icon: <Compass size={22} color={palette.primary} />,
                },
                {
                  id: 'reading' as TrackId,
                  title: 'Read Sheet Music',
                  desc: 'Start with simple notes, play full songs',
                  icon: <BookOpen size={22} color={palette.primary} />,
                },
              ].map((opt) => {
                const active = selectedTrack === opt.id;
                return (
                  <Card
                    key={opt.id}
                    mode={active ? 'elevated' : 'outlined'}
                    onPress={() => setSelectedTrack(opt.id)}
                    style={[styles.card, active && styles.cardActive]}
                  >
                    <Card.Content style={styles.cardRow}>
                      <View style={[styles.iconBox, active && styles.iconBoxActive]}>
                        {opt.icon}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text variant="titleMedium" style={{ fontWeight: '700' }}>
                          {opt.title}
                        </Text>
                        <Text variant="bodyMedium" style={{ color: palette.textSecondary, marginTop: 2 }}>
                          {opt.desc}
                        </Text>
                      </View>
                      {active && <CheckCircle2 size={22} color={palette.primary} />}
                    </Card.Content>
                  </Card>
                );
              })}
            </View>

            <Button
              mode="contained"
              contentStyle={{ paddingVertical: 8 }}
              labelStyle={{ fontSize: 16, fontWeight: '700' }}
              onPress={() => finishOnboarding()}
              style={{ marginTop: 8 }}
            >
              Start Learning →
            </Button>

            <Button
              mode="text"
              onPress={() => {
                setDiagIdx(0);
                setStep('diagnostic');
              }}
            >
              Already know some theory or notes? Take 1-min skill check
            </Button>
          </View>
        ) : (
          <View style={styles.block}>
            <View style={styles.diagTop}>
              <Text variant="headlineSmall" style={styles.headline}>
                Quick Skill Check
              </Text>
              <Text variant="titleSmall" style={{ color: palette.primary, fontWeight: '800' }}>
                {diagIdx + 1} / {DIAGNOSTIC_QUESTIONS.length}
              </Text>
            </View>

            {(() => {
              const q = DIAGNOSTIC_QUESTIONS[diagIdx];
              return (
                <Surface elevation={1} style={styles.quizCard}>
                  <Text variant="titleMedium" style={{ fontWeight: '600', lineHeight: 24 }}>
                    {q.prompt}
                  </Text>
                  <View style={styles.optList}>
                    {q.options.map((opt, idx) => (
                      <Button
                        key={opt}
                        mode="outlined"
                        contentStyle={{ justifyContent: 'flex-start', paddingVertical: 6 }}
                        onPress={() => {
                          const next = { ...diagAnswers, [q.id]: idx === q.correctIndex };
                          setDiagAnswers(next);
                          if (diagIdx + 1 >= DIAGNOSTIC_QUESTIONS.length) finishOnboarding(next);
                          else setDiagIdx(diagIdx + 1);
                        }}
                      >
                        {opt}
                      </Button>
                    ))}
                    <Button
                      mode="text"
                      onPress={() => {
                        const next = { ...diagAnswers, [q.id]: false };
                        setDiagAnswers(next);
                        if (diagIdx + 1 >= DIAGNOSTIC_QUESTIONS.length) finishOnboarding(next);
                        else setDiagIdx(diagIdx + 1);
                      }}
                    >
                      Not sure yet
                    </Button>
                  </View>
                </Surface>
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
  container: { width: '100%', maxWidth: 500, gap: 20 },
  brand: { color: palette.primary, fontWeight: '800', letterSpacing: 0.3 },
  block: { gap: 14 },
  headline: { color: palette.textPrimary, fontWeight: '700' },
  sub: { color: palette.textSecondary },
  cards: { gap: 12, marginTop: 4 },
  card: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.lg,
    borderColor: palette.borderHairline,
  },
  cardActive: {
    borderWidth: 2,
    borderColor: palette.primary,
    backgroundColor: '#FFFFFF',
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: palette.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxActive: { backgroundColor: palette.primaryContainer },
  diagTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quizCard: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.lg,
    padding: 22,
    gap: 16,
  },
  optList: { gap: 10 },
});

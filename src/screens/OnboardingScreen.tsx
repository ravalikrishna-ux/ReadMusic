import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BookOpen, CheckCircle2, Compass, Layers, Mic, Music, Smartphone } from 'lucide-react-native';
import { InputMode, TrackId } from '../core/music/types';
import { DIAGNOSTIC_QUESTIONS } from '../data/curriculum';
import { useAppStore } from '../store/useAppStore';
import { palette, radius } from '../theme/tokens';

export const OnboardingScreen: React.FC = () => {
  const { completeOnboarding } = useAppStore();
  const [step, setStep] = useState<'track' | 'input' | 'diagnostic'>('track');
  const [selectedTrack, setSelectedTrack] = useState<TrackId>('integrated');
  const [selectedInput, setSelectedInput] = useState<InputMode>('touch');
  const [diagIdx, setDiagIdx] = useState(0);
  const [diagAnswers, setDiagAnswers] = useState<Record<string, boolean>>({});

  const finishWithDiagnostic = (answers: Record<string, boolean>) => {
    const suggestedTestOuts: string[] = [];
    if (answers['diag-1']) suggestedTestOuts.push('T1');
    if (answers['diag-2']) suggestedTestOuts.push('T4');
    if (answers['diag-3']) suggestedTestOuts.push('R1');
    if (answers['diag-4']) suggestedTestOuts.push('R3');
    if (answers['diag-5']) suggestedTestOuts.push('R6');

    const startLessonId = selectedTrack === 'reading' ? 'R1.1' : 'T1.1';

    completeOnboarding({
      track: selectedTrack,
      inputMode: selectedInput,
      suggestedTestOuts,
      startLessonId,
    });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Brand Masthead */}
        <View style={styles.masthead}>
          <Text style={styles.brandOverline}>READMUSIC • GUITAR EDITION (E A D G B E)</Text>
          <Text style={styles.headline}>
            Music theory & sight-reading for guitarists who already play.
          </Text>
          <Text style={styles.subhead}>
            No cartoon gamification. No subscriptions. Module 1 of both tracks is completely free;
            unlock the entire curriculum once for $4.99.
          </Text>
        </View>

        {/* Stepper */}
        <View style={styles.stepRow}>
          {[
            { id: 'track', label: '1. Choose Track' },
            { id: 'input', label: '2. Practice Input' },
            { id: 'diagnostic', label: '3. Optional Calibration' },
          ].map((s) => (
            <View
              key={s.id}
              style={[styles.stepPill, step === s.id && styles.stepPillActive]}
            >
              <Text style={[styles.stepText, step === s.id && styles.stepTextActive]}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {step === 'track' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What do you want to master?</Text>
            <Text style={styles.sectionDesc}>
              You can switch tracks anytime — your progress stays unified underneath.
            </Text>

            <View style={styles.cards}>
              {[
                {
                  id: 'integrated' as TrackId,
                  title: 'Integrated Path — Theory + Reading (Recommended)',
                  desc: '16 interleaved stages where each Theory milestone unlocks right before the Reading module that uses it.',
                  icon: <Layers size={20} color={palette.accentBrass} />,
                },
                {
                  id: 'theory' as TrackId,
                  title: 'Music Theory Only (T1–T8)',
                  desc: 'Fretboard geography, intervals, major/minor/pentatonic scales, CAGED triads, modes & 80s/90s/00s rock/pop song breakdowns.',
                  icon: <Compass size={20} color={palette.accentBrass} />,
                },
                {
                  id: 'reading' as TrackId,
                  title: 'Reading Standard Notation Only (R1–R8)',
                  desc: 'Treble clef (8vb) in standard tuning — no TAB crutches — scaling from open notes up to full multi-section sheet music pieces.',
                  icon: <BookOpen size={20} color={palette.accentBrass} />,
                },
              ].map((opt) => {
                const active = selectedTrack === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setSelectedTrack(opt.id)}
                    style={[styles.choiceCard, active && styles.choiceCardActive]}
                  >
                    <View style={styles.choiceTop}>
                      {opt.icon}
                      <Text style={styles.choiceTitle}>{opt.title}</Text>
                      {active && <CheckCircle2 size={18} color={palette.accentBrass} />}
                    </View>
                    <Text style={styles.choiceDesc}>{opt.desc}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable onPress={() => setStep('input')} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Continue</Text>
            </Pressable>
          </View>
        )}

        {step === 'input' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How are you practicing right now?</Text>
            <Text style={styles.sectionDesc}>
              Every lesson supports both live guitar microphone listening and silent on-screen
              fretboard practice.
            </Text>

            <View style={styles.cards}>
              <Pressable
                onPress={() => setSelectedInput('mic')}
                style={[styles.choiceCard, selectedInput === 'mic' && styles.choiceCardActive]}
              >
                <View style={styles.choiceTop}>
                  <Mic size={20} color={palette.successEmerald} />
                  <Text style={styles.choiceTitle}>With My Guitar (Live Microphone Pitch Detection)</Text>
                </View>
                <Text style={styles.choiceDesc}>
                  Hands-free listening for acoustic or amplified electric guitar. Play real notes on
                  your instrument to advance Wait Mode and Tempo Mode scores.
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setSelectedInput('touch')}
                style={[styles.choiceCard, selectedInput === 'touch' && styles.choiceCardActive]}
              >
                <View style={styles.choiceTop}>
                  <Smartphone size={20} color={palette.accentBrass} />
                  <Text style={styles.choiceTitle}>On-Screen Interactive Fretboard (No Guitar Needed)</Text>
                </View>
                <Text style={styles.choiceDesc}>
                  Tap frets directly on the responsive neck with plucked guitar audio — ideal on the
                  couch, train, or desk. Flip to Mic anytime.
                </Text>
              </Pressable>
            </View>

            <View style={styles.btnRow}>
              <Pressable onPress={() => setStep('track')} style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>Back</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setDiagIdx(0);
                  setStep('diagnostic');
                }}
                style={[styles.primaryBtn, { flex: 1 }]}
              >
                <Text style={styles.primaryBtnText}>2-Minute Skill Calibration</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() =>
                completeOnboarding({
                  track: selectedTrack,
                  inputMode: selectedInput,
                  suggestedTestOuts: [],
                })
              }
              style={styles.skipLink}
            >
              <Text style={styles.skipLinkText}>Skip calibration & start cleanly at Module 1 →</Text>
            </Pressable>
          </View>
        )}

        {step === 'diagnostic' && (
          <View style={styles.section}>
            <View style={styles.diagHeader}>
              <Text style={styles.sectionTitle}>Quick Skill Calibration</Text>
              <Text style={styles.diagCounter}>
                {diagIdx + 1} / {DIAGNOSTIC_QUESTIONS.length}
              </Text>
            </View>
            <Text style={styles.sectionDesc}>
              Answer honestly — any familiar module will be badged with a 1-tap Test-Out so you
              never waste time repeating fundamentals you already own.
            </Text>

            {(() => {
              const q = DIAGNOSTIC_QUESTIONS[diagIdx];
              return (
                <View style={styles.diagCard}>
                  <View style={styles.diagTag}>
                    <Music size={12} color={palette.accentBrass} />
                    <Text style={styles.diagTagText}>{q.area.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.diagPrompt}>{q.prompt}</Text>
                  <View style={styles.optionsCol}>
                    {q.options.map((opt, oIdx) => (
                      <Pressable
                        key={opt}
                        onPress={() => {
                          const nextAnswers = {
                            ...diagAnswers,
                            [q.id]: oIdx === q.correctIndex,
                          };
                          setDiagAnswers(nextAnswers);
                          if (diagIdx + 1 >= DIAGNOSTIC_QUESTIONS.length) {
                            finishWithDiagnostic(nextAnswers);
                          } else {
                            setDiagIdx(diagIdx + 1);
                          }
                        }}
                        style={styles.optionBtn}
                      >
                        <Text style={styles.optionBtnText}>{opt}</Text>
                      </Pressable>
                    ))}
                    <Pressable
                      onPress={() => {
                        const nextAnswers = { ...diagAnswers, [q.id]: false };
                        setDiagAnswers(nextAnswers);
                        if (diagIdx + 1 >= DIAGNOSTIC_QUESTIONS.length) {
                          finishWithDiagnostic(nextAnswers);
                        } else {
                          setDiagIdx(diagIdx + 1);
                        }
                      }}
                      style={styles.unsureBtn}
                    >
                      <Text style={styles.unsureBtnText}>Not sure yet (teach me this)</Text>
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
  screen: {
    flex: 1,
    backgroundColor: palette.bgCanvas,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 680,
    gap: 20,
  },
  masthead: {
    gap: 10,
    paddingTop: 12,
  },
  brandOverline: {
    color: palette.accentBrass,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    fontFamily: 'monospace',
  },
  headline: {
    color: palette.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Georgia',
    lineHeight: 35,
  },
  subhead: {
    color: palette.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  stepRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stepPill: {
    backgroundColor: palette.bgSurface,
    borderColor: palette.borderHairline,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  stepPillActive: {
    backgroundColor: palette.accentBrassMuted,
    borderColor: palette.accentBrassBorder,
  },
  stepText: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  stepTextActive: {
    color: palette.accentBrass,
    fontWeight: '700',
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    color: palette.textPrimary,
    fontSize: 19,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  sectionDesc: {
    color: palette.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  cards: {
    gap: 12,
  },
  choiceCard: {
    backgroundColor: palette.bgSurface,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.md,
    padding: 16,
    gap: 8,
  },
  choiceCardActive: {
    borderColor: palette.accentBrass,
    backgroundColor: palette.bgElevated,
  },
  choiceTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  choiceTitle: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  choiceDesc: {
    color: palette.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: palette.accentBrass,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#111317',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryBtn: {
    backgroundColor: palette.bgSurface,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  secondaryBtnText: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  skipLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipLinkText: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  diagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diagCounter: {
    color: palette.accentBrass,
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  diagCard: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 18,
    gap: 14,
  },
  diagTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: palette.accentBrassMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  diagTagText: {
    color: palette.accentBrass,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  diagPrompt: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  optionsCol: {
    gap: 10,
  },
  optionBtn: {
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.sm,
    padding: 13,
  },
  optionBtnText: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  unsureBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  unsureBtnText: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});

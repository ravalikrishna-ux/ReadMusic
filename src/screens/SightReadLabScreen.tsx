import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Lock, Shuffle } from 'lucide-react-native';
import { PracticePlayer } from '../components/PracticePlayer';
import { KeySignatureId, PlayableScore } from '../core/music/types';
import {
  generateSightReadingScore,
  PositionPreset,
  RhythmLevel,
} from '../core/notation/sightReadingGenerator';
import { PLAYABLE_SCORES, SCORE_LIST } from '../data/scores';
import { useAppStore } from '../store/useAppStore';
import { palette, radius } from '../theme/tokens';

interface SightReadLabScreenProps {
  onOpenPaywall: () => void;
}

const POSITIONS: Array<{ id: PositionPreset; label: string; free: boolean }> = [
  { id: 'open-treble', label: 'Open ①–③', free: true },
  { id: 'open-full', label: 'Full Open ①–⑥', free: false },
  { id: 'pos-2', label: 'Pos. II', free: false },
  { id: 'pos-5', label: 'Pos. V', free: false },
  { id: 'pos-7', label: 'Pos. VII', free: false },
];

const KEYS: KeySignatureId[] = ['C', 'G', 'D', 'A', 'F', 'Am', 'Em', 'Dm'];
const RHYTHMS: Array<{ id: RhythmLevel; label: string }> = [
  { id: 'basic', label: 'Quarter / Half' },
  { id: 'eighths', label: 'Eighth Notes' },
  { id: 'syncopated', label: 'Syncopated' },
  { id: 'sixteenths', label: '16th Grooves' },
];

export const SightReadLabScreen: React.FC<SightReadLabScreenProps> = ({ onOpenPaywall }) => {
  const { state } = useAppStore();
  const [tab, setTab] = useState<'generator' | 'repertoire'>('generator');
  const [position, setPosition] = useState<PositionPreset>('open-treble');
  const [keySig, setKeySig] = useState<KeySignatureId>('C');
  const [rhythm, setRhythm] = useState<RhythmLevel>('basic');
  const [bars, setBars] = useState<4 | 8>(4);
  const [allowPeek, setAllowPeek] = useState(false);

  const [generatedScore, setGeneratedScore] = useState<PlayableScore>(() =>
    generateSightReadingScore({
      position: 'open-treble',
      keySignature: 'C',
      rhythmLevel: 'basic',
      measureCount: 4,
      allowPeekFret: false,
      seed: 1042,
    })
  );

  const [selectedRepertoireId, setSelectedRepertoireId] = useState<string>('r1-2-high-e-horizon');

  const regenerate = (overrides?: Partial<{
    position: PositionPreset;
    keySig: KeySignatureId;
    rhythm: RhythmLevel;
    bars: 4 | 8;
    allowPeek: boolean;
  }>) => {
    const p = overrides?.position ?? position;
    const k = overrides?.keySig ?? keySig;
    const r = overrides?.rhythm ?? rhythm;
    const b = overrides?.bars ?? bars;
    const peek = overrides?.allowPeek ?? allowPeek;

    setGeneratedScore(
      generateSightReadingScore({
        position: p,
        keySignature: k,
        rhythmLevel: r,
        measureCount: b,
        allowPeekFret: peek,
        seed: Math.floor(Math.random() * 999999),
      })
    );
  };

  const activeScore =
    tab === 'generator'
      ? generatedScore
      : PLAYABLE_SCORES[selectedRepertoireId] ?? SCORE_LIST[0];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.overline}>SIGHT-READ LAB • PURE STANDARD NOTATION</Text>
        <Text style={styles.title}>Endless Sight-Reading & Repertoire</Text>
        <Text style={styles.sub}>
          Generate fresh unseen passages so your eyes truly read instead of memorizing — or perform
          curated etudes and full multi-section Capstone pieces.
        </Text>
      </View>

      {/* Lab Mode Switcher */}
      <View style={styles.modeSwitch}>
        <Pressable
          onPress={() => setTab('generator')}
          style={[styles.modeBtn, tab === 'generator' && styles.modeBtnActive]}
        >
          <Text style={[styles.modeBtnText, tab === 'generator' && styles.modeBtnTextActive]}>
            Procedural Generator
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('repertoire')}
          style={[styles.modeBtn, tab === 'repertoire' && styles.modeBtnActive]}
        >
          <Text style={[styles.modeBtnText, tab === 'repertoire' && styles.modeBtnTextActive]}>
            Etudes & Full Capstones ({SCORE_LIST.length})
          </Text>
        </Pressable>
      </View>

      {tab === 'generator' ? (
        <View style={styles.configCard}>
          <View style={styles.configGroup}>
            <Text style={styles.cfgLabel}>NECK POSITION</Text>
            <View style={styles.chipRow}>
              {POSITIONS.map((p) => {
                const locked = !p.free && !state.isFullUnlocked;
                const active = position === p.id;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => {
                      if (locked) {
                        onOpenPaywall();
                        return;
                      }
                      setPosition(p.id);
                      regenerate({ position: p.id });
                    }}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    {locked && <Lock size={10} color={palette.accentBrass} />}
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.configGroup}>
            <Text style={styles.cfgLabel}>KEY SIGNATURE</Text>
            <View style={styles.chipRow}>
              {KEYS.map((k) => {
                const active = keySig === k;
                return (
                  <Pressable
                    key={k}
                    onPress={() => {
                      setKeySig(k);
                      regenerate({ keySig: k });
                    }}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{k}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.configGroup}>
            <Text style={styles.cfgLabel}>RHYTHM PALETTE</Text>
            <View style={styles.chipRow}>
              {RHYTHMS.map((r) => {
                const active = rhythm === r.id;
                return (
                  <Pressable
                    key={r.id}
                    onPress={() => {
                      setRhythm(r.id);
                      regenerate({ rhythm: r.id });
                    }}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {r.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.genFooter}>
            <View style={styles.chipRow}>
              {([4, 8] as const).map((b) => (
                <Pressable
                  key={b}
                  onPress={() => {
                    setBars(b);
                    regenerate({ bars: b });
                  }}
                  style={[styles.chip, bars === b && styles.chipActive]}
                >
                  <Text style={[styles.chipText, bars === b && styles.chipTextActive]}>
                    {b} Bars
                  </Text>
                </Pressable>
              ))}
              <Pressable
                onPress={() => {
                  const next = !allowPeek;
                  setAllowPeek(next);
                  regenerate({ allowPeek: next });
                }}
                style={[styles.chip, allowPeek && styles.chipActive]}
              >
                <Text style={[styles.chipText, allowPeek && styles.chipTextActive]}>
                  Allow Peek: {allowPeek ? 'ON' : 'OFF'}
                </Text>
              </Pressable>
            </View>

            <Pressable onPress={() => regenerate()} style={styles.genBtn}>
              <Shuffle size={14} color="#111317" />
              <Text style={styles.genBtnText}>New Unseen Passage</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.repertoireGrid}>
          {SCORE_LIST.map((sc) => {
            const locked = sc.moduleId !== 'R1' && !state.isFullUnlocked;
            const active = selectedRepertoireId === sc.id;
            return (
              <Pressable
                key={sc.id}
                onPress={() => (locked ? onOpenPaywall() : setSelectedRepertoireId(sc.id))}
                style={[styles.repCard, active && styles.repCardActive]}
              >
                <View style={styles.repTop}>
                  <Text style={styles.repCode}>{sc.moduleId}</Text>
                  {sc.isCapstone && (
                    <Text style={styles.repCap}>CAPSTONE</Text>
                  )}
                  {locked && <Lock size={12} color={palette.accentBrass} />}
                </View>
                <Text style={styles.repTitle}>{sc.title}</Text>
                <Text style={styles.repSub} numberOfLines={2}>
                  {sc.subtitle}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Active Interactive Practice Player */}
      <PracticePlayer
        score={activeScore}
        onGenerateFreshSightRead={tab === 'generator' ? () => regenerate() : undefined}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bgCanvas },
  content: { padding: 16, paddingBottom: 48, gap: 16, maxWidth: 980, alignSelf: 'center', width: '100%' },
  header: { gap: 4 },
  overline: { color: palette.accentBrass, fontSize: 10, fontWeight: '800', letterSpacing: 1, fontFamily: 'monospace' },
  title: { color: palette.textPrimary, fontSize: 24, fontWeight: '700', fontFamily: 'Georgia' },
  sub: { color: palette.textSecondary, fontSize: 13, lineHeight: 19 },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: palette.bgSurface,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  modeBtn: { flex: 1, paddingVertical: 8, borderRadius: radius.sm, alignItems: 'center' },
  modeBtnActive: { backgroundColor: palette.accentBrass },
  modeBtnText: { color: palette.textSecondary, fontSize: 12, fontWeight: '700' },
  modeBtnTextActive: { color: '#111317', fontWeight: '800' },
  configCard: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 14,
    gap: 12,
  },
  configGroup: { gap: 6 },
  cfgLabel: { color: palette.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 0.7 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: palette.accentBrassMuted, borderColor: palette.accentBrass },
  chipText: { color: palette.textSecondary, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: palette.accentBrass, fontWeight: '700' },
  genFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 4,
  },
  genBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.accentBrass,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  genBtnText: { color: '#111317', fontSize: 12, fontWeight: '800' },
  repertoireGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  repCard: {
    width: '48%',
    minWidth: 210,
    flexGrow: 1,
    backgroundColor: palette.bgSurface,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.md,
    padding: 12,
    gap: 4,
  },
  repCardActive: { borderColor: palette.accentBrass, backgroundColor: palette.bgElevated },
  repTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  repCode: { color: palette.accentBrass, fontSize: 11, fontWeight: '800', fontFamily: 'monospace' },
  repCap: { color: palette.successEmerald, fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  repTitle: { color: palette.textPrimary, fontSize: 14, fontWeight: '700', fontFamily: 'Georgia' },
  repSub: { color: palette.textSecondary, fontSize: 11, lineHeight: 16 },
});

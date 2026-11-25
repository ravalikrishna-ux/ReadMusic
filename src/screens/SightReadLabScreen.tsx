import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Lock, Shuffle, SlidersHorizontal } from 'lucide-react-native';
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
  { id: 'open-treble', label: 'Open Strings ①–③', free: true },
  { id: 'open-full', label: 'All Open Strings', free: false },
  { id: 'pos-2', label: '2nd Pos', free: false },
  { id: 'pos-5', label: '5th Pos', free: false },
  { id: 'pos-7', label: '7th Pos', free: false },
];

const KEYS: KeySignatureId[] = ['C', 'G', 'D', 'A', 'F', 'Am', 'Em', 'Dm'];
const RHYTHMS: Array<{ id: RhythmLevel; label: string }> = [
  { id: 'basic', label: 'Easy' },
  { id: 'eighths', label: '8th Notes' },
  { id: 'syncopated', label: 'Groove' },
  { id: 'sixteenths', label: 'Fast 16ths' },
];

export const SightReadLabScreen: React.FC<SightReadLabScreenProps> = ({ onOpenPaywall }) => {
  const { state } = useAppStore();
  const [tab, setTab] = useState<'random' | 'songs'>('random');
  const [showFilters, setShowFilters] = useState(false);

  const [position, setPosition] = useState<PositionPreset>('open-treble');
  const [keySig, setKeySig] = useState<KeySignatureId>('C');
  const [rhythm, setRhythm] = useState<RhythmLevel>('basic');

  const [generatedScore, setGeneratedScore] = useState<PlayableScore>(() =>
    generateSightReadingScore({
      position: 'open-treble',
      keySignature: 'C',
      rhythmLevel: 'basic',
      measureCount: 4,
      allowPeekFret: true,
      seed: 1042,
    })
  );

  const [selectedSongId, setSelectedSongId] = useState<string>('r1-2-high-e-horizon');

  const regenerate = (
    overrides?: Partial<{ position: PositionPreset; keySig: KeySignatureId; rhythm: RhythmLevel }>
  ) => {
    const p = overrides?.position ?? position;
    const k = overrides?.keySig ?? keySig;
    const r = overrides?.rhythm ?? rhythm;
    setGeneratedScore(
      generateSightReadingScore({
        position: p,
        keySignature: k,
        rhythmLevel: r,
        measureCount: 4,
        allowPeekFret: true,
        seed: Math.floor(Math.random() * 999999),
      })
    );
  };

  const activeScore =
    tab === 'random' ? generatedScore : PLAYABLE_SCORES[selectedSongId] ?? SCORE_LIST[0];

  const posLabel = POSITIONS.find((p) => p.id === position)?.label ?? 'Open';
  const rhythmLabel = RHYTHMS.find((r) => r.id === rhythm)?.label ?? 'Easy';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Clean Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Practice</Text>
        <View style={styles.modeSwitch}>
          <Pressable
            onPress={() => setTab('random')}
            style={[styles.modeBtn, tab === 'random' && styles.modeBtnActive]}
          >
            <Text style={[styles.modeText, tab === 'random' && styles.modeTextActive]}>
              Random
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab('songs')}
            style={[styles.modeBtn, tab === 'songs' && styles.modeBtnActive]}
          >
            <Text style={[styles.modeText, tab === 'songs' && styles.modeTextActive]}>
              Songs ({SCORE_LIST.length})
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Compact 1-Row Controls for Random Sight-Reading */}
      {tab === 'random' ? (
        <View style={styles.filterWrap}>
          <View style={styles.summaryBar}>
            <Pressable onPress={() => setShowFilters((v) => !v)} style={styles.filterToggle}>
              <SlidersHorizontal size={14} color={palette.accentBrass} />
              <Text style={styles.filterSummaryText}>
                {posLabel} · Key {keySig} · {rhythmLabel}
              </Text>
            </Pressable>
            <Pressable onPress={() => regenerate()} style={styles.newBtn}>
              <Shuffle size={14} color="#111317" />
              <Text style={styles.newBtnText}>New</Text>
            </Pressable>
          </View>

          {showFilters && (
            <View style={styles.drawer}>
              <View style={styles.chipRow}>
                {POSITIONS.map((p) => {
                  const locked = !p.free && !state.isFullUnlocked;
                  const active = position === p.id;
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => {
                        if (locked) return onOpenPaywall();
                        setPosition(p.id);
                        regenerate({ position: p.id });
                      }}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      {locked && <Lock size={11} color={palette.accentBrass} />}
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {p.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.chipRow}>
                {KEYS.map((k) => (
                  <Pressable
                    key={k}
                    onPress={() => {
                      setKeySig(k);
                      regenerate({ keySig: k });
                    }}
                    style={[styles.chip, keySig === k && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, keySig === k && styles.chipTextActive]}>
                      {k}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.chipRow}>
                {RHYTHMS.map((r) => (
                  <Pressable
                    key={r.id}
                    onPress={() => {
                      setRhythm(r.id);
                      regenerate({ rhythm: r.id });
                    }}
                    style={[styles.chip, rhythm === r.id && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, rhythm === r.id && styles.chipTextActive]}>
                      {r.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>
      ) : (
        /* Horizontal Clean Song Picker Strip */
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.songStrip}>
            {SCORE_LIST.map((sc) => {
              const locked = sc.moduleId !== 'R1' && !state.isFullUnlocked;
              const active = selectedSongId === sc.id;
              return (
                <Pressable
                  key={sc.id}
                  onPress={() => (locked ? onOpenPaywall() : setSelectedSongId(sc.id))}
                  style={[styles.songChip, active && styles.songChipActive]}
                >
                  <View style={styles.songChipTop}>
                    <Text style={styles.songMod}>{sc.moduleId}</Text>
                    {locked && <Lock size={11} color={palette.accentBrass} />}
                    {sc.isCapstone && <Text style={styles.capTag}>Full Song</Text>}
                  </View>
                  <Text style={styles.songChipTitle} numberOfLines={1}>
                    {sc.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Immediately Visible Player */}
      <PracticePlayer
        score={activeScore}
        onGenerateFreshSightRead={tab === 'random' ? () => regenerate() : undefined}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bgCanvas },
  content: {
    padding: 20,
    paddingBottom: 48,
    gap: 14,
    maxWidth: 920,
    alignSelf: 'center',
    width: '100%',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  title: { color: palette.textPrimary, fontSize: 24, fontWeight: '700', fontFamily: 'Georgia' },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: palette.bgSurface,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  modeBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  modeBtnActive: { backgroundColor: palette.accentBrass },
  modeText: { color: palette.textSecondary, fontSize: 13, fontWeight: '700' },
  modeTextActive: { color: '#111317', fontWeight: '800' },
  filterWrap: { gap: 10 },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    backgroundColor: palette.bgSurface,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.md,
    padding: 8,
    paddingLeft: 12,
  },
  filterToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  filterSummaryText: { color: palette.textPrimary, fontSize: 13, fontWeight: '600' },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.accentBrass,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  newBtnText: { color: '#111317', fontSize: 13, fontWeight: '800' },
  drawer: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 12,
    gap: 10,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.bgElevated,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  chipActive: { backgroundColor: palette.accentBrassMuted, borderWidth: 1, borderColor: palette.accentBrass },
  chipText: { color: palette.textSecondary, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: palette.accentBrass, fontWeight: '700' },
  songStrip: { flexDirection: 'row', gap: 10, paddingBottom: 4 },
  songChip: {
    width: 190,
    backgroundColor: palette.bgSurface,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.md,
    padding: 12,
    gap: 4,
  },
  songChipActive: { borderColor: palette.accentBrass, backgroundColor: palette.bgElevated },
  songChipTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  songMod: { color: palette.accentBrass, fontSize: 11, fontWeight: '800', fontFamily: 'monospace' },
  capTag: { color: palette.successEmerald, fontSize: 10, fontWeight: '800' },
  songChipTitle: { color: palette.textPrimary, fontSize: 14, fontWeight: '700' },
});

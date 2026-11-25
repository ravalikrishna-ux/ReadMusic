import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, SegmentedButtons, Surface, Text } from 'react-native-paper';
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
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Practice
        </Text>
        <SegmentedButtons
          value={tab}
          onValueChange={(v) => setTab(v as 'random' | 'songs')}
          density="small"
          style={{ width: 220 }}
          buttons={[
            { value: 'random', label: 'Random' },
            { value: 'songs', label: `Songs (${SCORE_LIST.length})` },
          ]}
        />
      </View>

      {tab === 'random' ? (
        <View style={styles.filterWrap}>
          <Surface elevation={1} style={styles.summaryBar}>
            <Button
              mode="text"
              compact
              onPress={() => setShowFilters((v) => !v)}
              icon={({ size, color }) => <SlidersHorizontal size={size - 3} color={color} />}
            >
              {posLabel} · Key {keySig} · {rhythmLabel}
            </Button>
            <Button
              mode="contained"
              compact
              onPress={() => regenerate()}
              icon={({ size, color }) => <Shuffle size={size - 3} color={color} />}
            >
              New
            </Button>
          </Surface>

          {showFilters && (
            <Surface elevation={1} style={styles.drawer}>
              <View style={styles.chipRow}>
                {POSITIONS.map((p) => {
                  const locked = !p.free && !state.isFullUnlocked;
                  const active = position === p.id;
                  return (
                    <Chip
                      key={p.id}
                      compact
                      showSelectedCheck={false}
                      selected={active}
                      mode={active ? 'flat' : 'outlined'}
                      icon={
                        locked
                          ? ({ size, color }) => <Lock size={size - 4} color={color} />
                          : undefined
                      }
                      onPress={() => {
                        if (locked) return onOpenPaywall();
                        setPosition(p.id);
                        regenerate({ position: p.id });
                      }}
                    >
                      {p.label}
                    </Chip>
                  );
                })}
              </View>

              <View style={styles.chipRow}>
                {KEYS.map((k) => (
                  <Chip
                    key={k}
                    compact
                    showSelectedCheck={false}
                    selected={keySig === k}
                    mode={keySig === k ? 'flat' : 'outlined'}
                    onPress={() => {
                      setKeySig(k);
                      regenerate({ keySig: k });
                    }}
                  >
                    {k}
                  </Chip>
                ))}
              </View>

              <View style={styles.chipRow}>
                {RHYTHMS.map((r) => (
                  <Chip
                    key={r.id}
                    compact
                    showSelectedCheck={false}
                    selected={rhythm === r.id}
                    mode={rhythm === r.id ? 'flat' : 'outlined'}
                    onPress={() => {
                      setRhythm(r.id);
                      regenerate({ rhythm: r.id });
                    }}
                  >
                    {r.label}
                  </Chip>
                ))}
              </View>
            </Surface>
          )}
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.songStrip}>
            {SCORE_LIST.map((sc) => {
              const locked = sc.moduleId !== 'R1' && !state.isFullUnlocked;
              const active = selectedSongId === sc.id;
              return (
                <Card
                  key={sc.id}
                  mode={active ? 'elevated' : 'outlined'}
                  onPress={() => (locked ? onOpenPaywall() : setSelectedSongId(sc.id))}
                  style={[styles.songCard, active && styles.songCardActive]}
                >
                  <Card.Content style={{ gap: 4, paddingVertical: 12 }}>
                    <View style={styles.songTop}>
                      <Text variant="labelSmall" style={{ color: palette.primary, fontWeight: '800' }}>
                        {sc.moduleId}
                      </Text>
                      {locked && <Lock size={12} color={palette.textMuted} />}
                      {sc.isCapstone && (
                        <Text variant="labelSmall" style={{ color: palette.successEmerald, fontWeight: '800' }}>
                          Full Song
                        </Text>
                      )}
                    </View>
                    <Text variant="titleSmall" style={{ fontWeight: '700' }} numberOfLines={1}>
                      {sc.title}
                    </Text>
                  </Card.Content>
                </Card>
              );
            })}
          </View>
        </ScrollView>
      )}

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
  title: { color: palette.textPrimary, fontWeight: '800' },
  filterWrap: { gap: 10 },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: palette.bgSurface,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.lg,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  drawer: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 14,
    gap: 10,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  songStrip: { flexDirection: 'row', gap: 10, paddingVertical: 2 },
  songCard: {
    width: 196,
    backgroundColor: palette.bgSurface,
    borderRadius: radius.md,
    borderColor: palette.borderHairline,
  },
  songCardActive: { borderWidth: 2, borderColor: palette.primary },
  songTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});

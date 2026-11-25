import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Divider, List, SegmentedButtons, Surface, Text } from 'react-native-paper';
import { Volume2 } from 'lucide-react-native';
import { InteractiveFretboard } from '../components/InteractiveFretboard';
import { SongBreakdownCard } from '../components/SongBreakdownCard';
import { audioEngine } from '../core/audio/audioEngine';
import {
  getScaleFretboardMarkers,
  INTERVALS,
  pitchClassToName,
  SCALES,
} from '../core/music/guitarEngine';
import { ScaleId } from '../core/music/types';
import { SONG_BREAKDOWNS } from '../data/songs';
import { useAppStore } from '../store/useAppStore';
import { palette, radius } from '../theme/tokens';

const ROOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const SCALE_KEYS: ScaleId[] = [
  'minor_pentatonic',
  'major_pentatonic',
  'major',
  'natural_minor',
  'blues',
  'dorian',
  'mixolydian',
  'lydian',
  'phrygian',
  'harmonic_minor',
];

export const ReferenceScreen: React.FC = () => {
  const { state } = useAppStore();
  const [section, setSection] = useState<'scales' | 'songs' | 'intervals'>('scales');
  const [rootPc, setRootPc] = useState<number>(4);
  const [scaleId, setScaleId] = useState<ScaleId>('minor_pentatonic');
  const [labelMode, setLabelMode] = useState<'notes' | 'degrees'>('notes');
  const [decadeFilter, setDecadeFilter] = useState<'All' | '80s' | '90s' | '00s'>('All');

  const scaleMarkers = useMemo(
    () => getScaleFretboardMarkers(rootPc, scaleId, 12),
    [rootPc, scaleId]
  );

  const filteredSongs = useMemo(
    () =>
      decadeFilter === 'All'
        ? SONG_BREAKDOWNS
        : SONG_BREAKDOWNS.filter((s) => s.decade === decadeFilter),
    [decadeFilter]
  );

  const playCurrentScale = () => {
    const sc = SCALES[scaleId];
    const baseMidi = 52 + ((rootPc - 4 + 12) % 12);
    sc.semitones.concat([12]).forEach((semi, idx) => {
      setTimeout(() => audioEngine.playGuitarNote(baseMidi + semi, 0.75, 0.24), idx * 220);
    });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text variant="headlineSmall" style={styles.title}>
        Explore
      </Text>

      <SegmentedButtons
        value={section}
        onValueChange={(v) => setSection(v as 'scales' | 'songs' | 'intervals')}
        buttons={[
          { value: 'scales', label: 'Scales' },
          { value: 'songs', label: 'Hit Songs' },
          { value: 'intervals', label: 'Intervals' },
        ]}
      />

      {section === 'scales' && (
        <View style={styles.block}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.rowStrip}>
              {ROOTS.map((pc) => (
                <Chip
                  key={pc}
                  compact
                  showSelectedCheck={false}
                  selected={rootPc === pc}
                  mode={rootPc === pc ? 'flat' : 'outlined'}
                  onPress={() => setRootPc(pc)}
                >
                  {pitchClassToName(pc)}
                </Chip>
              ))}
            </View>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.rowStrip}>
              {SCALE_KEYS.map((id) => (
                <Chip
                  key={id}
                  compact
                  showSelectedCheck={false}
                  selected={scaleId === id}
                  mode={scaleId === id ? 'flat' : 'outlined'}
                  onPress={() => setScaleId(id)}
                >
                  {SCALES[id].name}
                </Chip>
              ))}
            </View>
          </ScrollView>

          <View style={styles.scaleHeader}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={{ fontWeight: '700' }}>
                {pitchClassToName(rootPc)} {SCALES[scaleId].name}
              </Text>
              <Text variant="labelMedium" style={{ color: palette.primary, marginTop: 2 }}>
                {SCALES[scaleId].formula}
              </Text>
            </View>
            <View style={styles.scaleBtns}>
              <Button
                mode="contained"
                compact
                onPress={playCurrentScale}
                icon={({ size, color }) => <Volume2 size={size - 3} color={color} />}
              >
                Play
              </Button>
              <Button
                mode="outlined"
                compact
                onPress={() => setLabelMode((m) => (m === 'notes' ? 'degrees' : 'notes'))}
              >
                {labelMode === 'notes' ? 'Notes' : 'Degrees'}
              </Button>
            </View>
          </View>

          <InteractiveFretboard
            fretCount={12}
            leftHanded={state.leftHanded}
            scaleMarkers={scaleMarkers}
            labelMode={labelMode}
          />
        </View>
      )}

      {section === 'songs' && (
        <View style={styles.block}>
          <View style={styles.rowStrip}>
            {(['All', '80s', '90s', '00s'] as const).map((dec) => (
              <Chip
                key={dec}
                compact
                showSelectedCheck={false}
                selected={decadeFilter === dec}
                mode={decadeFilter === dec ? 'flat' : 'outlined'}
                onPress={() => setDecadeFilter(dec)}
              >
                {dec}
              </Chip>
            ))}
          </View>

          {filteredSongs.map((song) => (
            <SongBreakdownCard
              key={song.id}
              song={song}
              onExploreScale={(r, s) => {
                setRootPc(r);
                setScaleId(s);
                setSection('scales');
              }}
            />
          ))}
        </View>
      )}

      {section === 'intervals' && (
        <Surface elevation={1} style={styles.listCard}>
          {INTERVALS.map((iv, idx) => (
            <React.Fragment key={iv.semitones}>
              <List.Item
                title={`${iv.name} (${iv.semitones} ${iv.semitones === 1 ? 'fret' : 'frets'})`}
                description={iv.rockCue}
                onPress={() => {
                  audioEngine.playGuitarNote(45, 0.9, 0.26);
                  setTimeout(() => audioEngine.playGuitarNote(45 + iv.semitones, 1.0, 0.26), 340);
                }}
                left={() => (
                  <View style={styles.ivBadge}>
                    <Text variant="labelLarge" style={{ color: palette.primary, fontWeight: '800' }}>
                      {iv.shortName}
                    </Text>
                  </View>
                )}
                right={() => (
                  <View style={{ justifyContent: 'center', paddingRight: 8 }}>
                    <Volume2 size={17} color={palette.primary} />
                  </View>
                )}
              />
              {idx < INTERVALS.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Surface>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bgCanvas },
  content: {
    padding: 20,
    paddingBottom: 48,
    gap: 16,
    maxWidth: 920,
    alignSelf: 'center',
    width: '100%',
  },
  title: { color: palette.textPrimary, fontWeight: '800' },
  block: { gap: 12 },
  rowStrip: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  scaleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingTop: 4,
  },
  scaleBtns: { flexDirection: 'row', gap: 8 },
  listCard: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    overflow: 'hidden',
  },
  ivBadge: {
    width: 44,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: palette.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginLeft: 12,
  },
});

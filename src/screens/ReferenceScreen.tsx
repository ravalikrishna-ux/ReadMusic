import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
      <Text style={styles.title}>Explore</Text>

      <View style={styles.tabs}>
        {(
          [
            { id: 'scales', label: 'Scales' },
            { id: 'songs', label: 'Hit Songs' },
            { id: 'intervals', label: 'Intervals' },
          ] as const
        ).map((t) => {
          const active = section === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => setSection(t.id)}
              style={[styles.tabBtn, active && styles.tabBtnActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {section === 'scales' && (
        <View style={styles.block}>
          {/* Root Strip */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.rowStrip}>
              {ROOTS.map((pc) => (
                <Pressable
                  key={pc}
                  onPress={() => setRootPc(pc)}
                  style={[styles.chip, rootPc === pc && styles.chipActive]}
                >
                  <Text style={[styles.chipText, rootPc === pc && styles.chipTextActive]}>
                    {pitchClassToName(pc)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Scale Strip */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.rowStrip}>
              {SCALE_KEYS.map((id) => (
                <Pressable
                  key={id}
                  onPress={() => setScaleId(id)}
                  style={[styles.chip, scaleId === id && styles.chipActive]}
                >
                  <Text style={[styles.chipText, scaleId === id && styles.chipTextActive]}>
                    {SCALES[id].name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Clean Action Header */}
          <View style={styles.scaleHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.scaleTitle}>
                {pitchClassToName(rootPc)} {SCALES[scaleId].name}
              </Text>
              <Text style={styles.scaleSub}>{SCALES[scaleId].formula}</Text>
            </View>
            <View style={styles.scaleBtns}>
              <Pressable onPress={playCurrentScale} style={styles.playBtn}>
                <Volume2 size={14} color="#111317" />
                <Text style={styles.playText}>Play</Text>
              </Pressable>
              <Pressable
                onPress={() => setLabelMode((m) => (m === 'notes' ? 'degrees' : 'notes'))}
                style={styles.ghostBtn}
              >
                <Text style={styles.ghostText}>
                  {labelMode === 'notes' ? 'Notes' : 'Degrees'}
                </Text>
              </Pressable>
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
              <Pressable
                key={dec}
                onPress={() => setDecadeFilter(dec)}
                style={[styles.chip, decadeFilter === dec && styles.chipActive]}
              >
                <Text style={[styles.chipText, decadeFilter === dec && styles.chipTextActive]}>
                  {dec}
                </Text>
              </Pressable>
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
        <View style={styles.block}>
          {INTERVALS.map((iv) => (
            <Pressable
              key={iv.semitones}
              onPress={() => {
                audioEngine.playGuitarNote(45, 0.9, 0.26);
                setTimeout(() => audioEngine.playGuitarNote(45 + iv.semitones, 1.0, 0.26), 340);
              }}
              style={styles.ivRow}
            >
              <View style={styles.ivBadge}>
                <Text style={styles.ivBadgeText}>{iv.shortName}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.ivName}>
                  {iv.name} ({iv.semitones} {iv.semitones === 1 ? 'fret' : 'frets'})
                </Text>
                <Text style={styles.ivCue}>{iv.rockCue}</Text>
              </View>
              <Volume2 size={16} color={palette.accentBrass} />
            </Pressable>
          ))}
        </View>
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
  title: { color: palette.textPrimary, fontSize: 24, fontWeight: '700', fontFamily: 'Georgia' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: palette.bgSurface,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  tabBtnActive: { backgroundColor: palette.accentBrass },
  tabText: { color: palette.textSecondary, fontSize: 13, fontWeight: '700' },
  tabTextActive: { color: '#111317', fontWeight: '800' },
  block: { gap: 12 },
  rowStrip: { flexDirection: 'row', gap: 6 },
  chip: {
    backgroundColor: palette.bgSurface,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.pill,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  chipActive: { backgroundColor: palette.accentBrassMuted, borderColor: palette.accentBrass },
  chipText: { color: palette.textSecondary, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: palette.accentBrass, fontWeight: '700' },
  scaleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingTop: 4,
  },
  scaleTitle: { color: palette.textPrimary, fontSize: 18, fontWeight: '700', fontFamily: 'Georgia' },
  scaleSub: { color: palette.accentBrass, fontSize: 12, fontWeight: '700', fontFamily: 'monospace', marginTop: 2 },
  scaleBtns: { flexDirection: 'row', gap: 8 },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.accentBrass,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  playText: { color: '#111317', fontSize: 13, fontWeight: '800' },
  ghostBtn: {
    backgroundColor: palette.bgSurface,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ghostText: { color: palette.textPrimary, fontSize: 13, fontWeight: '600' },
  ivRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: palette.bgSurface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 14,
  },
  ivBadge: {
    width: 42,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: palette.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ivBadgeText: { color: palette.accentBrass, fontSize: 13, fontWeight: '800', fontFamily: 'monospace' },
  ivName: { color: palette.textPrimary, fontSize: 14, fontWeight: '700' },
  ivCue: { color: palette.textSecondary, fontSize: 12, marginTop: 2 },
});

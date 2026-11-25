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
  const [rootPc, setRootPc] = useState<number>(4); // E default
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
      <View style={styles.header}>
        <Text style={styles.overline}>OFFLINE POCKET HANDBOOK</Text>
        <Text style={styles.title}>Guitar Studio Reference</Text>
      </View>

      {/* Section Switcher */}
      <View style={styles.tabs}>
        {(
          [
            { id: 'scales', label: 'Scale & Mode Neck' },
            { id: 'songs', label: '80s/90s/00s Songs' },
            { id: 'intervals', label: 'Interval Ear Guide' },
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
          <View style={styles.panel}>
            <Text style={styles.label}>ROOT NOTE</Text>
            <View style={styles.chipRow}>
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

            <Text style={[styles.label, { marginTop: 8 }]}>SCALE / MODE</Text>
            <View style={styles.chipRow}>
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

            <View style={styles.scaleSummary}>
              <View style={{ flex: 1 }}>
                <Text style={styles.scaleHeading}>
                  {pitchClassToName(rootPc)} {SCALES[scaleId].name}
                </Text>
                <Text style={styles.scaleFormula}>
                  {SCALES[scaleId].formula} • {SCALES[scaleId].mood}
                </Text>
                <Text style={styles.scaleTip}>{SCALES[scaleId].guitarTip}</Text>
              </View>
              <View style={styles.scaleControls}>
                <Pressable onPress={playCurrentScale} style={styles.playBtn}>
                  <Volume2 size={14} color="#111317" />
                  <Text style={styles.playBtnText}>Play Scale</Text>
                </Pressable>
                <Pressable
                  onPress={() => setLabelMode((m) => (m === 'notes' ? 'degrees' : 'notes'))}
                  style={styles.ghostBtn}
                >
                  <Text style={styles.ghostBtnText}>
                    Show: {labelMode === 'notes' ? 'Notes' : 'Degrees'}
                  </Text>
                </Pressable>
              </View>
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
          <View style={styles.chipRow}>
            {(['All', '80s', '90s', '00s'] as const).map((dec) => (
              <Pressable
                key={dec}
                onPress={() => setDecadeFilter(dec)}
                style={[styles.chip, decadeFilter === dec && styles.chipActive]}
              >
                <Text style={[styles.chipText, decadeFilter === dec && styles.chipTextActive]}>
                  {dec === 'All' ? `All Eras (${SONG_BREAKDOWNS.length})` : `${dec} Rock & Pop`}
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
          <Text style={styles.subText}>
            Tap any interval below to hear it plucked sequentially and harmonically from A3 (5th
            fret, Low E / Open A).
          </Text>
          {INTERVALS.map((iv) => (
            <Pressable
              key={iv.semitones}
              onPress={() => {
                audioEngine.playGuitarNote(45, 0.9, 0.26);
                setTimeout(() => audioEngine.playGuitarNote(45 + iv.semitones, 1.0, 0.26), 340);
              }}
              style={styles.intervalRow}
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
              <Volume2 size={15} color={palette.accentBrass} />
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bgCanvas },
  content: { padding: 16, paddingBottom: 48, gap: 16, maxWidth: 960, alignSelf: 'center', width: '100%' },
  header: { gap: 4 },
  overline: { color: palette.accentBrass, fontSize: 10, fontWeight: '800', letterSpacing: 1, fontFamily: 'monospace' },
  title: { color: palette.textPrimary, fontSize: 24, fontWeight: '700', fontFamily: 'Georgia' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: palette.bgSurface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 4,
    gap: 4,
  },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: radius.sm, alignItems: 'center' },
  tabBtnActive: { backgroundColor: palette.accentBrass },
  tabText: { color: palette.textSecondary, fontSize: 12, fontWeight: '700' },
  tabTextActive: { color: '#111317', fontWeight: '800' },
  block: { gap: 12 },
  panel: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 14,
    gap: 8,
  },
  label: { color: palette.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 0.7 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
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
  scaleSummary: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: palette.borderHairline,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
  },
  scaleHeading: { color: palette.textPrimary, fontSize: 16, fontWeight: '700', fontFamily: 'Georgia' },
  scaleFormula: { color: palette.accentBrass, fontSize: 12, fontWeight: '700', fontFamily: 'monospace', marginTop: 3 },
  scaleTip: { color: palette.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 4 },
  scaleControls: { flexDirection: 'row', gap: 8 },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.accentBrass,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  playBtnText: { color: '#111317', fontSize: 12, fontWeight: '800' },
  ghostBtn: {
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  ghostBtnText: { color: palette.textPrimary, fontSize: 12, fontWeight: '600' },
  subText: { color: palette.textSecondary, fontSize: 13, lineHeight: 19 },
  intervalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: palette.bgSurface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 12,
  },
  ivBadge: {
    width: 42,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: palette.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.borderStrong,
  },
  ivBadgeText: { color: palette.accentBrass, fontSize: 13, fontWeight: '800', fontFamily: 'monospace' },
  ivName: { color: palette.textPrimary, fontSize: 14, fontWeight: '700' },
  ivCue: { color: palette.textSecondary, fontSize: 12, marginTop: 2 },
});

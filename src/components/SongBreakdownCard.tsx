import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { ExternalLink, Volume2 } from 'lucide-react-native';
import { audioEngine } from '../core/audio/audioEngine';
import { SCALES } from '../core/music/guitarEngine';
import { SongBreakdown } from '../core/music/types';
import { palette, radius } from '../theme/tokens';

interface SongBreakdownCardProps {
  song: SongBreakdown;
  onExploreScale?: (rootPc: number, scaleId: SongBreakdown['scaleId']) => void;
}

export const SongBreakdownCard: React.FC<SongBreakdownCardProps> = ({
  song,
  onExploreScale,
}) => {
  const playScalePreview = () => {
    const scale = SCALES[song.scaleId];
    const baseMidi = 52 + ((song.rootPitchClass - 4 + 12) % 12);
    scale.semitones.forEach((semi, i) => {
      setTimeout(() => audioEngine.playGuitarNote(baseMidi + semi, 0.7, 0.24), i * 210);
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{song.title}</Text>
          <Text style={styles.sub}>
            {song.artist} · {song.decade} · {song.key}
          </Text>
        </View>
        <View style={styles.scaleBadge}>
          <Text style={styles.scaleBadgeText}>{SCALES[song.scaleId].name}</Text>
        </View>
      </View>

      {/* Clean Chord Strip */}
      <View style={styles.chordRow}>
        {song.progressionChords.map((chord, idx) => (
          <View key={`${song.id}-${idx}`} style={styles.chordPill}>
            <Text style={styles.chordName}>{chord}</Text>
            <Text style={styles.roman}>{song.progressionRoman[idx]}</Text>
          </View>
        ))}
      </View>

      {/* Single punchy insight */}
      <Text style={styles.insight}>{song.guitarInsight}</Text>

      {/* Compact Actions */}
      <View style={styles.actions}>
        <Pressable onPress={playScalePreview} style={styles.primaryBtn}>
          <Volume2 size={13} color="#111317" />
          <Text style={styles.primaryBtnText}>Hear Scale</Text>
        </Pressable>
        {onExploreScale && (
          <Pressable
            onPress={() => onExploreScale(song.rootPitchClass, song.scaleId)}
            style={styles.ghostBtn}
          >
            <Text style={styles.ghostBtnText}>See on Neck</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() =>
            Linking.openURL(
              `https://open.spotify.com/search/${encodeURIComponent(song.spotifyQuery)}`
            ).catch(() => {})
          }
          style={styles.ghostBtn}
        >
          <ExternalLink size={12} color={palette.textSecondary} />
          <Text style={styles.ghostBtnText}>Spotify</Text>
        </Pressable>
        <Pressable
          onPress={() =>
            Linking.openURL(
              `https://www.youtube.com/results?search_query=${encodeURIComponent(song.youtubeQuery)}`
            ).catch(() => {})
          }
          style={styles.ghostBtn}
        >
          <ExternalLink size={12} color={palette.textSecondary} />
          <Text style={styles.ghostBtnText}>YouTube</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  title: {
    color: palette.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  sub: {
    color: palette.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  scaleBadge: {
    backgroundColor: palette.accentBrassMuted,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scaleBadgeText: {
    color: palette.accentBrass,
    fontSize: 11,
    fontWeight: '700',
  },
  chordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chordPill: {
    backgroundColor: palette.bgElevated,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignItems: 'center',
    minWidth: 56,
  },
  chordName: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  roman: {
    color: palette.accentBrass,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginTop: 1,
  },
  insight: {
    color: palette.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.accentBrass,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  primaryBtnText: { color: '#111317', fontSize: 12, fontWeight: '800' },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: palette.bgElevated,
    borderRadius: radius.sm,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  ghostBtnText: { color: palette.textPrimary, fontSize: 12, fontWeight: '600' },
});

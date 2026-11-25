import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Surface, Text } from 'react-native-paper';
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
    <Card mode="elevated" style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={styles.title}>
              {song.title}
            </Text>
            <Text variant="bodySmall" style={{ color: palette.textSecondary }}>
              {song.artist} · {song.decade} · {song.key}
            </Text>
          </View>
          <Chip compact style={styles.scaleChip} textStyle={styles.scaleChipText}>
            {SCALES[song.scaleId].name}
          </Chip>
        </View>

        <View style={styles.chordRow}>
          {song.progressionChords.map((chord, idx) => (
            <Surface key={`${song.id}-${idx}`} elevation={0} style={styles.chordTile}>
              <Text variant="labelLarge" style={styles.chordName}>
                {chord}
              </Text>
              <Text variant="labelSmall" style={styles.roman}>
                {song.progressionRoman[idx]}
              </Text>
            </Surface>
          ))}
        </View>

        <Text variant="bodyMedium" style={styles.insight}>
          {song.guitarInsight}
        </Text>

        <View style={styles.actions}>
          <Button
            mode="contained"
            compact
            onPress={playScalePreview}
            icon={({ size, color }) => <Volume2 size={size - 3} color={color} />}
          >
            Hear Scale
          </Button>
          {onExploreScale && (
            <Button
              mode="contained-tonal"
              compact
              onPress={() => onExploreScale(song.rootPitchClass, song.scaleId)}
            >
              See on Neck
            </Button>
          )}
          <Button
            mode="outlined"
            compact
            onPress={() =>
              Linking.openURL(
                `https://open.spotify.com/search/${encodeURIComponent(song.spotifyQuery)}`
              ).catch(() => {})
            }
            icon={({ size, color }) => <ExternalLink size={size - 4} color={color} />}
          >
            Spotify
          </Button>
          <Button
            mode="outlined"
            compact
            onPress={() =>
              Linking.openURL(
                `https://www.youtube.com/results?search_query=${encodeURIComponent(song.youtubeQuery)}`
              ).catch(() => {})
            }
            icon={({ size, color }) => <ExternalLink size={size - 4} color={color} />}
          >
            YouTube
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.lg,
  },
  content: { gap: 14 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  title: { fontWeight: '700', color: palette.textPrimary },
  scaleChip: { backgroundColor: palette.primaryContainer },
  scaleChipText: { color: palette.onPrimaryContainer, fontSize: 11, fontWeight: '700' },
  chordRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chordTile: {
    backgroundColor: palette.bgElevated,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 60,
  },
  chordName: { color: palette.textPrimary, fontWeight: '800' },
  roman: { color: palette.primary, fontWeight: '700', marginTop: 1 },
  insight: { color: palette.textSecondary, lineHeight: 20 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});

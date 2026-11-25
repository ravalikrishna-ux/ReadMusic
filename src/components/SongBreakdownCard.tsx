import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { ExternalLink, Headphones, Music2 } from 'lucide-react-native';
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
    const baseMidi = 52 + ((song.rootPitchClass - 4 + 12) % 12); // Comfortable guitar mid-range
    scale.semitones.forEach((semi, i) => {
      setTimeout(() => {
        audioEngine.playGuitarNote(baseMidi + semi, 0.7, 0.24);
      }, i * 210);
    });
  };

  const openSpotify = () => {
    const url = `https://open.spotify.com/search/${encodeURIComponent(song.spotifyQuery)}`;
    Linking.openURL(url).catch(() => {});
  };

  const openYouTube = () => {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(song.youtubeQuery)}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <View style={styles.decadeBadge}>
              <Text style={styles.decadeText}>{song.decade}</Text>
            </View>
            <Text style={styles.title}>{song.title}</Text>
          </View>
          <Text style={styles.artist}>
            {song.artist} ({song.year}) • {song.key}
          </Text>
        </View>
        <View style={styles.modePill}>
          <Text style={styles.modeText}>{song.scaleOrMode}</Text>
        </View>
      </View>

      {/* Roman Numeral & Chord Progression Strip */}
      <View style={styles.progressionStrip}>
        {song.progressionRoman.map((roman, idx) => (
          <View key={`${song.id}-p-${idx}`} style={styles.chordCell}>
            <Text style={styles.romanText}>{roman}</Text>
            <Text style={styles.chordText}>{song.progressionChords[idx] ?? ''}</Text>
          </View>
        ))}
      </View>

      {/* Listening Cue */}
      <View style={styles.detailBlock}>
        <View style={styles.detailLabelRow}>
          <Headphones size={13} color={palette.accentBrass} />
          <Text style={styles.detailLabel}>WHAT TO LISTEN FOR</Text>
        </View>
        <Text style={styles.detailBody}>{song.listeningCue}</Text>
      </View>

      {/* Guitar Neck Insight */}
      <View style={styles.detailBlock}>
        <View style={styles.detailLabelRow}>
          <Music2 size={13} color={palette.successEmerald} />
          <Text style={styles.detailLabel}>GUITARIST TAKEAWAY</Text>
        </View>
        <Text style={styles.detailBody}>{song.guitarInsight}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <Pressable onPress={playScalePreview} style={styles.actionBtnPrimary}>
          <Text style={styles.actionBtnPrimaryText}>Hear Scale Color</Text>
        </Pressable>
        {onExploreScale && (
          <Pressable
            onPress={() => onExploreScale(song.rootPitchClass, song.scaleId)}
            style={styles.actionBtn}
          >
            <Text style={styles.actionBtnText}>Show on Neck</Text>
          </Pressable>
        )}
        <Pressable onPress={openSpotify} style={styles.actionBtn}>
          <ExternalLink size={12} color={palette.textSecondary} />
          <Text style={styles.actionBtnText}>Spotify</Text>
        </Pressable>
        <Pressable onPress={openYouTube} style={styles.actionBtn}>
          <ExternalLink size={12} color={palette.textSecondary} />
          <Text style={styles.actionBtnText}>YouTube</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 14,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    flexWrap: 'wrap',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  decadeBadge: {
    backgroundColor: palette.accentBrassMuted,
    borderColor: palette.accentBrassBorder,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  decadeText: {
    color: palette.accentBrass,
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  title: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  artist: {
    color: palette.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },
  modePill: {
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  modeText: {
    color: palette.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  progressionStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: palette.bgCanvas,
    borderRadius: radius.sm,
    padding: 10,
    borderWidth: 1,
    borderColor: palette.borderHairline,
  },
  chordCell: {
    minWidth: 58,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: palette.bgElevated,
    alignItems: 'center',
  },
  romanText: {
    color: palette.accentBrass,
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  chordText: {
    color: palette.textSecondary,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  detailBlock: {
    gap: 4,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    color: palette.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  detailBody: {
    color: palette.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 2,
  },
  actionBtnPrimary: {
    backgroundColor: palette.accentBrass,
    borderRadius: radius.sm,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  actionBtnPrimaryText: {
    color: '#111317',
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionBtnText: {
    color: palette.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
});

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Chip, Surface, Text } from 'react-native-paper';
import { audioEngine } from '../core/audio/audioEngine';
import {
  FretboardScaleMarker,
  getMidiAtFret,
  GUITAR_STANDARD_EADGBE,
  midiToScientificPitch,
} from '../core/music/guitarEngine';
import { FretPosition } from '../core/music/types';
import { palette, radius } from '../theme/tokens';

interface InteractiveFretboardProps {
  fretCount?: number;
  leftHanded?: boolean;
  scaleMarkers?: FretboardScaleMarker[];
  labelMode?: 'notes' | 'degrees';
  hintPosition?: FretPosition | null;
  feedbackFret?: { stringNumber: number; fret: number; ok: boolean } | null;
  onFretPress?: (info: { stringNumber: number; fret: number; soundingMidi: number }) => void;
}

const INLAY_FRETS = new Set([3, 5, 7, 9, 12, 15]);

export const InteractiveFretboard: React.FC<InteractiveFretboardProps> = ({
  fretCount = 12,
  leftHanded = false,
  scaleMarkers = [],
  labelMode = 'notes',
  hintPosition = null,
  feedbackFret = null,
  onFretPress,
}) => {
  const [lastTapped, setLastTapped] = useState<{
    stringNumber: number;
    fret: number;
    label: string;
  } | null>(null);

  const orderedStrings = [...GUITAR_STANDARD_EADGBE.strings].sort(
    (a, b) => a.stringNumber - b.stringNumber
  );

  const frets = Array.from({ length: fretCount + 1 }, (_, i) => i);
  const displayFrets = leftHanded ? [...frets].reverse() : frets;

  const markerLookup = new Map<string, FretboardScaleMarker>();
  for (const m of scaleMarkers) {
    markerLookup.set(`${m.stringNumber}-${m.fret}`, m);
  }

  const handleTap = (stringNumber: number, fret: number) => {
    const soundingMidi = getMidiAtFret(stringNumber, fret);
    const pitch = midiToScientificPitch(soundingMidi);
    audioEngine.playGuitarNote(soundingMidi, 1.0);
    setLastTapped({ stringNumber, fret, label: `${pitch.name}${pitch.octave}` });
    onFretPress?.({ stringNumber, fret, soundingMidi });
  };

  return (
    <Surface elevation={1} style={styles.wrapper}>
      <View style={styles.topRow}>
        <Text variant="labelLarge" style={styles.caption}>
          Guitar Neck {leftHanded ? '(Left-Handed)' : ''} · Tap any fret
        </Text>
        {lastTapped && (
          <Chip compact style={styles.readoutChip} textStyle={styles.readoutText}>
            {lastTapped.label} · Fret {lastTapped.fret}
          </Chip>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.neckContainer}>
          <View style={styles.fretNumberRow}>
            <View style={styles.stringLabelCol} />
            {displayFrets.map((fret) => (
              <View
                key={`hdr-${fret}`}
                style={[styles.fretNumCell, fret === 0 && styles.openCellWidth]}
              >
                <Text
                  style={[
                    styles.fretNumText,
                    INLAY_FRETS.has(fret) && styles.fretNumAccent,
                  ]}
                >
                  {fret === 0 ? 'OPEN' : fret}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.woodBoard}>
            {orderedStrings.map((str) => {
              const stringThickness = 1 + (str.stringNumber - 1) * 0.42;
              return (
                <View key={str.stringNumber} style={styles.stringRow}>
                  <View style={styles.stringLabelCol}>
                    <Text style={styles.stringBadgeText}>
                      {str.label.replace(/\d/, '')}
                    </Text>
                    <Text style={styles.stringNumSub}>({str.stringNumber})</Text>
                  </View>

                  {displayFrets.map((fret) => {
                    const key = `${str.stringNumber}-${fret}`;
                    const marker = markerLookup.get(key);
                    const isHint =
                      hintPosition?.stringNumber === str.stringNumber &&
                      hintPosition?.fret === fret;
                    const isFeedback =
                      feedbackFret?.stringNumber === str.stringNumber &&
                      feedbackFret?.fret === fret;
                    const isLast =
                      lastTapped?.stringNumber === str.stringNumber &&
                      lastTapped?.fret === fret;

                    const showInlayDot =
                      str.stringNumber === 3 && INLAY_FRETS.has(fret) && fret !== 12;
                    const showDoubleInlay =
                      (str.stringNumber === 2 || str.stringNumber === 5) && fret === 12;

                    return (
                      <Pressable
                        key={key}
                        onPress={() => handleTap(str.stringNumber, fret)}
                        style={({ pressed }) => [
                          styles.fretCell,
                          fret === 0 && styles.openCell,
                          pressed && styles.fretCellPressed,
                        ]}
                      >
                        {(showInlayDot || showDoubleInlay) && (
                          <View style={styles.inlayDot} pointerEvents="none" />
                        )}

                        <View
                          pointerEvents="none"
                          style={[
                            styles.stringWire,
                            {
                              height: stringThickness,
                              backgroundColor: str.wound
                                ? palette.stringWound
                                : palette.stringPlain,
                            },
                          ]}
                        />

                        {isFeedback ? (
                          <View
                            style={[
                              styles.dotMarker,
                              {
                                backgroundColor: feedbackFret.ok
                                  ? palette.successEmerald
                                  : palette.errorCoral,
                              },
                            ]}
                          >
                            <Text style={styles.dotMarkerWhiteText}>
                              {feedbackFret.ok ? '✓' : '×'}
                            </Text>
                          </View>
                        ) : isHint ? (
                          <View
                            style={[
                              styles.dotMarker,
                              {
                                backgroundColor: palette.accentBrass,
                                borderWidth: 2,
                                borderColor: '#FFFFFF',
                              },
                            ]}
                          >
                            <Text style={styles.dotMarkerWhiteText}>
                              {fret === 0 ? 'O' : fret}
                            </Text>
                          </View>
                        ) : marker ? (
                          <View
                            style={[
                              styles.dotMarker,
                              marker.isRoot ? styles.rootMarker : styles.scaleToneMarker,
                            ]}
                          >
                            <Text style={styles.dotMarkerWhiteText}>
                              {labelMode === 'degrees' ? marker.degreeLabel : marker.pitchName}
                            </Text>
                          </View>
                        ) : isLast ? (
                          <View style={styles.lastTapDot} />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  caption: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  readoutChip: {
    backgroundColor: palette.primaryContainer,
  },
  readoutText: {
    color: palette.onPrimaryContainer,
    fontSize: 12,
    fontWeight: '700',
  },
  neckContainer: {
    paddingBottom: 4,
  },
  fretNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  stringLabelCol: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  stringBadgeText: {
    color: '#F5F3EE',
    fontSize: 11,
    fontWeight: '700',
  },
  stringNumSub: {
    color: '#A59E94',
    fontSize: 9,
  },
  fretNumCell: {
    width: 54,
    alignItems: 'center',
  },
  openCellWidth: {
    width: 50,
  },
  fretNumText: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  fretNumAccent: {
    color: palette.primary,
    fontWeight: '800',
  },
  woodBoard: {
    backgroundColor: palette.fretboardWood,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  stringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 37,
  },
  fretCell: {
    width: 54,
    height: 37,
    borderRightWidth: 2,
    borderRightColor: palette.fretWire,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  openCell: {
    width: 50,
    backgroundColor: '#211B17',
    borderRightWidth: 5,
    borderRightColor: palette.fretboardNut,
  },
  fretCellPressed: {
    backgroundColor: 'rgba(15, 107, 110, 0.35)',
  },
  stringWire: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  inlayDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: palette.fretInlay,
    position: 'absolute',
  },
  dotMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  rootMarker: {
    backgroundColor: palette.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  scaleToneMarker: {
    backgroundColor: '#485460',
    borderWidth: 1,
    borderColor: '#8391A1',
  },
  dotMarkerWhiteText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  lastTapDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(217, 119, 6, 0.65)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    zIndex: 2,
  },
});

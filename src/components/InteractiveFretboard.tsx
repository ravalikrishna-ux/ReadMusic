import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  FretboardScaleMarker,
  getMidiAtFret,
  GUITAR_STANDARD_EADGBE,
  midiToScientificPitch,
} from '../core/music/guitarEngine';
import { FretPosition } from '../core/music/types';
import { audioEngine } from '../core/audio/audioEngine';
import { palette, radius } from '../theme/tokens';

interface InteractiveFretboardProps {
  fretCount?: number;
  leftHanded?: boolean;
  scaleMarkers?: FretboardScaleMarker[];
  labelMode?: 'notes' | 'degrees';
  hintPosition?: FretPosition | null; // Optional Peek Fret glow
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

  // Display strings top-to-bottom: ① High E down to ⑥ Low E (standard guitarist perspective!)
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
    <View style={styles.wrapper}>
      <View style={styles.topRow}>
        <Text style={styles.caption}>
          INTERACTIVE FRETBOARD • STANDARD TUNING ({GUITAR_STANDARD_EADGBE.tuningName})
          {leftHanded ? ' • LEFT-HANDED' : ''}
        </Text>
        {lastTapped && (
          <View style={styles.readoutPill}>
            <Text style={styles.readoutText}>
              String {lastTapped.stringNumber} • Fret {lastTapped.fret} → {lastTapped.label}
            </Text>
          </View>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.neckContainer}>
          {/* Fret number header row */}
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

          {/* Strings ① to ⑥ */}
          <View style={styles.woodBoard}>
            {orderedStrings.map((str) => {
              const stringThickness = 1 + (str.stringNumber - 1) * 0.42;
              return (
                <View key={str.stringNumber} style={styles.stringRow}>
                  {/* String name badge */}
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
                      str.stringNumber === 3 &&
                      INLAY_FRETS.has(fret) &&
                      fret !== 12;
                    const showDoubleInlay =
                      (str.stringNumber === 2 || str.stringNumber === 5) &&
                      fret === 12;

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
                        {/* Fret inlay dot */}
                        {(showInlayDot || showDoubleInlay) && (
                          <View style={styles.inlayDot} pointerEvents="none" />
                        )}

                        {/* Guitar string wire */}
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

                        {/* Feedback, Hint, Scale Marker, or Tapped Indicator */}
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
                            <Text style={styles.dotMarkerDarkText}>
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
                                borderColor: '#FFF',
                              },
                            ]}
                          >
                            <Text style={styles.dotMarkerDarkText}>
                              {fret === 0 ? 'O' : fret}
                            </Text>
                          </View>
                        ) : marker ? (
                          <View
                            style={[
                              styles.dotMarker,
                              marker.isRoot
                                ? styles.rootMarker
                                : styles.scaleToneMarker,
                            ]}
                          >
                            <Text
                              style={
                                marker.isRoot
                                  ? styles.dotMarkerDarkText
                                  : styles.dotMarkerLightText
                              }
                            >
                              {labelMode === 'degrees'
                                ? marker.degreeLabel
                                : marker.pitchName}
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
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: palette.bgSurface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 12,
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
    color: palette.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  readoutPill: {
    backgroundColor: palette.accentBrassMuted,
    borderColor: palette.accentBrassBorder,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  readoutText: {
    color: palette.accentBrass,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  neckContainer: {
    paddingBottom: 4,
  },
  fretNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stringLabelCol: {
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  stringBadgeText: {
    color: palette.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  stringNumSub: {
    color: palette.textMuted,
    fontSize: 9,
  },
  fretNumCell: {
    width: 52,
    alignItems: 'center',
  },
  openCellWidth: {
    width: 48,
  },
  fretNumText: {
    color: palette.textMuted,
    fontSize: 10,
    fontFamily: 'monospace',
  },
  fretNumAccent: {
    color: palette.accentBrass,
    fontWeight: '700',
  },
  woodBoard: {
    backgroundColor: palette.fretboardWood,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#3A312A',
    overflow: 'hidden',
  },
  stringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
  },
  fretCell: {
    width: 52,
    height: 36,
    borderRightWidth: 2,
    borderRightColor: palette.fretWire,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  openCell: {
    width: 48,
    backgroundColor: '#191512',
    borderRightWidth: 5,
    borderRightColor: palette.fretboardNut,
  },
  fretCellPressed: {
    backgroundColor: 'rgba(217, 164, 65, 0.22)',
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
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  rootMarker: {
    backgroundColor: palette.accentBrass,
  },
  scaleToneMarker: {
    backgroundColor: '#2D3442',
    borderWidth: 1,
    borderColor: '#5B677E',
  },
  dotMarkerDarkText: {
    color: '#111317',
    fontSize: 10,
    fontWeight: '800',
  },
  dotMarkerLightText: {
    color: palette.textPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  lastTapDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(217, 164, 65, 0.55)',
    borderWidth: 1.5,
    borderColor: palette.accentBrass,
    zIndex: 2,
  },
});

import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Mic, MicOff, Volume2, X } from 'lucide-react-native';
import { audioEngine } from '../core/audio/audioEngine';
import { GUITAR_STANDARD_EADGBE, midiToFrequency, midiToScientificPitch } from '../core/music/guitarEngine';
import { DetectedPitch } from '../core/music/types';
import { palette, radius } from '../theme/tokens';

interface GuitarTunerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const GuitarTunerModal: React.FC<GuitarTunerModalProps> = ({ visible, onClose }) => {
  const [listening, setListening] = useState(false);
  const [pitch, setPitch] = useState<DetectedPitch | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible && listening) {
      audioEngine.stopMicListener();
      setListening(false);
      setPitch(null);
    }
  }, [visible, listening]);

  const toggleListening = async () => {
    if (listening) {
      audioEngine.stopMicListener();
      setListening(false);
      setPitch(null);
      return;
    }
    setError(null);
    const res = await audioEngine.startMicListener((p) => setPitch(p));
    if (res.ok) setListening(true);
    else setError(res.error ?? 'Unable to open microphone.');
  };

  const detectedInfo = pitch ? midiToScientificPitch(pitch.midi) : null;
  const inTune = pitch !== null && Math.abs(pitch.cents) <= 8;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.topRow}>
            <Text style={styles.title}>Standard Guitar Tuner (E A D G B E)</Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close tuner"
              style={{ padding: 6 }}
            >
              <X size={18} color={palette.textSecondary} />
            </Pressable>
          </View>

          {/* Live Readout */}
          <View style={styles.meterBox}>
            <Text
              style={[
                styles.bigNote,
                inTune && { color: palette.successEmerald },
              ]}
            >
              {detectedInfo ? `${detectedInfo.name}${detectedInfo.octave}` : '—'}
            </Text>
            <Text style={styles.hzText}>
              {pitch
                ? `${pitch.frequencyHz} Hz • ${pitch.cents > 0 ? `+${pitch.cents}` : pitch.cents} cents`
                : listening
                  ? 'Pluck any open string cleanly...'
                  : 'Tap Enable Mic or pluck reference pitches below'}
            </Text>
            {pitch && (
              <View style={styles.centsTrack}>
                <View style={styles.centsCenterLine} />
                <View
                  style={[
                    styles.centsNeedle,
                    {
                      left: `${Math.max(5, Math.min(95, 50 + pitch.cents))}%`,
                      backgroundColor: inTune
                        ? palette.successEmerald
                        : palette.accentBrass,
                    },
                  ]}
                />
              </View>
            )}
          </View>

          <Pressable
            onPress={toggleListening}
            style={[styles.micBtn, listening && styles.micBtnActive]}
          >
            {listening ? <Mic size={16} color="#111317" /> : <MicOff size={16} color="#111317" />}
            <Text style={styles.micBtnText}>
              {listening ? 'Stop Microphone' : 'Enable Live Mic Tuner'}
            </Text>
          </Pressable>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Reference Pitch Buttons */}
          <Text style={styles.refLabel}>REFERENCE PITCHES (TAP TO HEAR)</Text>
          <View style={styles.stringGrid}>
            {GUITAR_STANDARD_EADGBE.strings.map((s) => (
              <Pressable
                key={s.stringNumber}
                onPress={() => audioEngine.playGuitarNote(s.openMidi, 1.8, 0.3)}
                style={styles.stringBtn}
              >
                <Volume2 size={13} color={palette.accentBrass} />
                <Text style={styles.stringBtnTitle}>
                  ({s.stringNumber}) {s.label}
                </Text>
                <Text style={styles.stringBtnHz}>
                  {midiToFrequency(s.openMidi).toFixed(1)} Hz
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(8, 10, 14, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: palette.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    padding: 20,
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  meterBox: {
    backgroundColor: palette.bgCanvas,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    padding: 18,
    alignItems: 'center',
    gap: 8,
  },
  bigNote: {
    color: palette.accentBrass,
    fontSize: 40,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  hzText: {
    color: palette.textSecondary,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  centsTrack: {
    width: '100%',
    height: 10,
    backgroundColor: palette.bgElevated,
    borderRadius: 5,
    marginTop: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  centsCenterLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: palette.textMuted,
  },
  centsNeedle: {
    position: 'absolute',
    top: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: -4,
  },
  micBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: palette.accentBrass,
    borderRadius: radius.md,
    paddingVertical: 12,
  },
  micBtnActive: {
    backgroundColor: palette.successEmerald,
  },
  micBtnText: {
    color: '#111317',
    fontSize: 14,
    fontWeight: '800',
  },
  errorText: {
    color: palette.errorCoral,
    fontSize: 12,
    textAlign: 'center',
  },
  refLabel: {
    color: palette.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  stringGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stringBtn: {
    width: '31%',
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.borderHairline,
    borderRadius: radius.sm,
    padding: 10,
    alignItems: 'center',
    gap: 3,
  },
  stringBtnTitle: {
    color: palette.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  stringBtnHz: {
    color: palette.textMuted,
    fontSize: 10,
    fontFamily: 'monospace',
  },
});

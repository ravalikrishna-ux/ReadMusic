import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Button, IconButton, Surface, Text } from 'react-native-paper';
import { Mic, MicOff, Volume2, X } from 'lucide-react-native';
import { audioEngine } from '../core/audio/audioEngine';
import {
  GUITAR_STANDARD_EADGBE,
  midiToFrequency,
  midiToScientificPitch,
} from '../core/music/guitarEngine';
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
        <Surface elevation={4} style={styles.card}>
          <View style={styles.topRow}>
            <Text variant="titleMedium" style={{ fontWeight: '700' }}>
              Guitar Tuner (E A D G B E)
            </Text>
            <IconButton
              size={18}
              icon={({ size, color }) => <X size={size} color={color} />}
              onPress={onClose}
              accessibilityLabel="Close tuner"
              style={{ margin: 0 }}
            />
          </View>

          <Surface elevation={0} style={styles.meterBox}>
            <Text
              variant="displaySmall"
              style={[
                styles.bigNote,
                inTune && { color: palette.successEmerald },
              ]}
            >
              {detectedInfo ? `${detectedInfo.name}${detectedInfo.octave}` : '—'}
            </Text>
            <Text variant="bodySmall" style={{ color: palette.textSecondary }}>
              {pitch
                ? `${pitch.frequencyHz} Hz · ${pitch.cents > 0 ? `+${pitch.cents}` : pitch.cents} cents`
                : listening
                  ? 'Pluck any open string...'
                  : 'Turn on mic or tap a string below'}
            </Text>
            {pitch && (
              <View style={styles.centsTrack}>
                <View style={styles.centsCenterLine} />
                <View
                  style={[
                    styles.centsNeedle,
                    {
                      left: `${Math.max(5, Math.min(95, 50 + pitch.cents))}%`,
                      backgroundColor: inTune ? palette.successEmerald : palette.primary,
                    },
                  ]}
                />
              </View>
            )}
          </Surface>

          <Button
            mode="contained"
            buttonColor={listening ? palette.successEmerald : palette.primary}
            onPress={toggleListening}
            icon={({ size, color }) =>
              listening ? <Mic size={size - 2} color={color} /> : <MicOff size={size - 2} color={color} />
            }
          >
            {listening ? 'Stop Microphone' : 'Enable Live Mic'}
          </Button>

          {error && (
            <Text variant="bodySmall" style={{ color: palette.errorCoral, textAlign: 'center' }}>
              {error}
            </Text>
          )}

          <Text variant="labelSmall" style={{ color: palette.textMuted, fontWeight: '700' }}>
            TAP TO HEAR REFERENCE PITCH
          </Text>

          <View style={styles.stringGrid}>
            {GUITAR_STANDARD_EADGBE.strings.map((s) => (
              <Button
                key={s.stringNumber}
                mode="contained-tonal"
                compact
                style={styles.stringBtn}
                onPress={() => audioEngine.playGuitarNote(s.openMidi, 1.8, 0.3)}
                icon={({ size, color }) => <Volume2 size={size - 4} color={color} />}
              >
                {s.label} ({midiToFrequency(s.openMidi).toFixed(0)}Hz)
              </Button>
            ))}
          </View>
        </Surface>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 32, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: palette.bgSurface,
    borderRadius: 24,
    padding: 22,
    gap: 14,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meterBox: {
    backgroundColor: palette.bgElevated,
    borderRadius: radius.md,
    padding: 18,
    alignItems: 'center',
    gap: 6,
  },
  bigNote: { color: palette.primary, fontWeight: '800' },
  centsTrack: {
    width: '100%',
    height: 8,
    backgroundColor: palette.borderHairline,
    borderRadius: 4,
    marginTop: 8,
    position: 'relative',
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
    top: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: -5,
  },
  stringGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stringBtn: { width: '48%', flexGrow: 1 },
});

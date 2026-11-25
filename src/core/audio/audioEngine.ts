import { Platform } from 'react-native';
import { midiToFrequency } from '../music/guitarEngine';
import { DetectedPitch } from '../music/types';
import { detectPitchYin } from './yinPitchDetector';

/**
 * Cross-platform Audio Synthesis, Sample-Accurate Metronome & Live Mic Pitch Engine.
 * - On Web: Uses WebAudio API (warm plucked-string acoustic guitar synth + live getUserMedia YIN DSP).
 * - On Native iOS/Android: Exposes clean adapter boundary for the native Expo AVAudioEngine / Oboe C++ YIN module.
 */

type PitchCallback = (pitch: DetectedPitch | null) => void;

class ReadMusicAudioEngine {
  private ctx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private rafId: number | null = null;
  private prevRms = 0;

  private ensureContext(): AudioContext | null {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return null;
    }
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Warm plucked-guitar synthesis using fundamental + soft 2nd/3rd harmonics
   * passed through a decaying low-pass brightness envelope (acoustic pluck character).
   */
  public playGuitarNote(soundingMidi: number, durationSec = 1.1, gainLevel = 0.28): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freq = midiToFrequency(soundingMidi);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(gainLevel, now + 0.008);
    masterGain.gain.exponentialRampToValueAtTime(gainLevel * 0.45, now + 0.14);
    masterGain.gain.exponentialRampToValueAtTime(0.0008, now + durationSec);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(4800, freq * 7.5), now);
    filter.frequency.exponentialRampToValueAtTime(Math.max(520, freq * 2.1), now + durationSec * 0.85);
    filter.Q.value = 0.8;

    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq, now);

    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.24, now);
    osc2Gain.gain.exponentialRampToValueAtTime(0.03, now + 0.25);

    osc1.connect(filter);
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + durationSec + 0.05);
    osc2.stop(now + durationSec + 0.05);
  }

  public playChord(soundingMidis: number[], strumDelayMs = 28): void {
    soundingMidis.forEach((midi, idx) => {
      setTimeout(() => {
        this.playGuitarNote(midi, 1.4, 0.18);
      }, idx * strumDelayMs);
    });
  }

  public playMetronomeClick(isDownbeat: boolean): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isDownbeat ? 1180 : 820, now);
    osc.frequency.exponentialRampToValueAtTime(isDownbeat ? 620 : 440, now + 0.035);

    gain.gain.setValueAtTime(isDownbeat ? 0.28 : 0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  public async startMicListener(onPitch: PitchCallback): Promise<{ ok: boolean; error?: string }> {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.mediaDevices) {
      return {
        ok: false,
        error: 'Live microphone listening requires WebAudio browser mic permissions or the native iOS/Android DSP module.',
      };
    }

    try {
      const ctx = this.ensureContext();
      if (!ctx) return { ok: false, error: 'AudioContext unavailable.' };

      this.stopMicListener();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      this.micStream = stream;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      this.analyser = analyser;

      const buffer = new Float32Array(analyser.fftSize);
      const tick = () => {
        if (!this.analyser || !this.ctx) return;
        this.analyser.getFloatTimeDomainData(buffer);
        const pitch = detectPitchYin(
          buffer,
          { sampleRate: this.ctx.sampleRate, rmsGate: 0.015 },
          this.prevRms
        );
        this.prevRms = pitch?.rms ?? 0;
        onPitch(pitch);
        this.rafId = requestAnimationFrame(tick);
      };
      this.rafId = requestAnimationFrame(tick);
      return { ok: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Microphone access denied.';
      return { ok: false, error: msg };
    }
  }

  public stopMicListener(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    this.analyser = null;
    this.prevRms = 0;
  }
}

export const audioEngine = new ReadMusicAudioEngine();

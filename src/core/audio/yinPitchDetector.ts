import { frequencyToMidi } from '../music/guitarEngine';
import { DetectedPitch } from '../music/types';

export interface YinDetectorOptions {
  sampleRate: number;
  threshold?: number;       // YIN cumulative mean normalized threshold (default 0.14)
  minFrequencyHz?: number;  // Low E2 is 82.41 Hz -> default 72 Hz
  maxFrequencyHz?: number;  // High guitar notes -> default 1400 Hz
  rmsGate?: number;         // Minimum signal energy to reject ambient room noise
}

/**
 * Pure TypeScript YIN Fundamental Frequency Estimator tuned for Acoustic & Electric Guitar.
 * Mirrors the exact contract of the native iOS/Android C++17 Expo Audio Module so evaluation
 * behavior stays consistent across mobile and web preview.
 */
export function detectPitchYin(
  buffer: Float32Array,
  options: YinDetectorOptions,
  previousRms = 0
): DetectedPitch | null {
  const sampleRate = options.sampleRate;
  const threshold = options.threshold ?? 0.14;
  const minFreq = options.minFrequencyHz ?? 72;
  const maxFreq = options.maxFrequencyHz ?? 1400;
  const rmsGate = options.rmsGate ?? 0.012;

  // 1. Compute RMS energy & check noise gate
  let sumSq = 0;
  for (let i = 0; i < buffer.length; i++) {
    sumSq += buffer[i] * buffer[i];
  }
  const rms = Math.sqrt(sumSq / buffer.length);
  if (rms < rmsGate) {
    return null;
  }

  const maxLag = Math.min(Math.floor(buffer.length / 2), Math.ceil(sampleRate / minFreq));
  const minLag = Math.max(2, Math.floor(sampleRate / maxFreq));
  if (maxLag <= minLag) {
    return null;
  }

  // 2. Difference function d(tau)
  const diff = new Float32Array(maxLag + 1);
  for (let tau = minLag; tau <= maxLag; tau++) {
    let sum = 0;
    for (let i = 0; i < maxLag; i++) {
      const delta = buffer[i] - buffer[i + tau];
      sum += delta * delta;
    }
    diff[tau] = sum;
  }

  // 3. Cumulative mean normalized difference function d'(tau)
  const cmndf = new Float32Array(maxLag + 1);
  cmndf[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau <= maxLag; tau++) {
    runningSum += diff[tau];
    cmndf[tau] = runningSum > 0 ? (diff[tau] * tau) / runningSum : 1;
  }

  // 4. Absolute threshold search (first local minimum below threshold)
  let tauEstimate = -1;
  for (let tau = minLag; tau < maxLag; tau++) {
    if (cmndf[tau] < threshold) {
      while (tau + 1 < maxLag && cmndf[tau + 1] < cmndf[tau]) {
        tau++;
      }
      tauEstimate = tau;
      break;
    }
  }

  // Fallback to global minimum if clarity is decent
  if (tauEstimate === -1) {
    let bestVal = 1;
    for (let tau = minLag; tau < maxLag; tau++) {
      if (cmndf[tau] < bestVal) {
        bestVal = cmndf[tau];
        tauEstimate = tau;
      }
    }
    if (bestVal > 0.25 || tauEstimate === -1) {
      return null;
    }
  }

  // 5. Parabolic interpolation for sub-sample precision
  let betterTau = tauEstimate;
  if (tauEstimate > minLag && tauEstimate < maxLag) {
    const s0 = cmndf[tauEstimate - 1];
    const s1 = cmndf[tauEstimate];
    const s2 = cmndf[tauEstimate + 1];
    const denom = 2 * s1 - s2 - s0;
    if (Math.abs(denom) > 1e-8) {
      betterTau = tauEstimate + (s2 - s0) / (2 * denom);
    }
  }

  const frequencyHz = sampleRate / betterTau;
  if (frequencyHz < minFreq || frequencyHz > maxFreq || !Number.isFinite(frequencyHz)) {
    return null;
  }

  const clarity = Math.max(0, Math.min(1, 1 - cmndf[tauEstimate]));
  if (clarity < 0.72) {
    return null;
  }

  const { midi, cents } = frequencyToMidi(frequencyHz);
  const isOnset = previousRms < rmsGate || rms > previousRms * 1.45;

  return {
    frequencyHz: Number(frequencyHz.toFixed(2)),
    midi,
    cents,
    clarity: Number(clarity.toFixed(3)),
    rms: Number(rms.toFixed(4)),
    isOnset,
    timestampMs: Date.now(),
  };
}

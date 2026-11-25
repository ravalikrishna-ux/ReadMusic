import { describe, expect, it } from 'vitest';
import { detectPitchYin } from '../audio/yinPitchDetector';
import {
  DURATION_BEATS,
  getFretPositionsForMidi,
  getMidiAtFret,
  getScaleFretboardMarkers,
  GUITAR_STANDARD_EADGBE,
  midiToFrequency,
  midiToScientificPitch,
  soundingToWrittenMidi,
  writtenMidiToStaffStep,
  writtenToSoundingMidi,
} from '../music/guitarEngine';
import { generateSightReadingScore } from '../notation/sightReadingGenerator';

function synthesizeGuitarLikeWave(freqHz: number, sampleRate = 44100, length = 2048): Float32Array {
  const buf = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    // Fundamental + realistic 2nd & 3rd guitar harmonics
    buf[i] =
      0.65 * Math.sin(2 * Math.PI * freqHz * t) +
      0.22 * Math.sin(2 * Math.PI * freqHz * 2 * t) +
      0.10 * Math.sin(2 * Math.PI * freqHz * 3 * t);
  }
  return buf;
}

describe('Standard Guitar Pitch & Staff Engine', () => {
  it('computes exact standard tuning open-string frequencies and 8vb written MIDI', () => {
    const lowE = midiToScientificPitch(40); // Open 6th string E2
    expect(lowE.name).toBe('E');
    expect(lowE.octave).toBe(2);
    expect(lowE.writtenMidi).toBe(52); // Written E3
    expect(lowE.frequencyHz).toBeCloseTo(82.41, 1);

    const openA = midiToScientificPitch(45);
    expect(openA.frequencyHz).toBeCloseTo(110.0, 1);

    const highE = midiToScientificPitch(64); // Open 1st string E4
    expect(highE.writtenMidi).toBe(76); // Written E5
    expect(highE.frequencyHz).toBeCloseTo(329.63, 1);
  });

  it('maps written guitar treble pitches to exact diatonic staff steps including ledger lines', () => {
    expect(writtenMidiToStaffStep(64).step).toBe(0);  // E4 bottom line
    expect(writtenMidiToStaffStep(67).step).toBe(2);  // G4 2nd line (open 3rd string)
    expect(writtenMidiToStaffStep(71).step).toBe(4);  // B4 middle line (open 2nd string)
    expect(writtenMidiToStaffStep(76).step).toBe(7);  // E5 4th space (open 1st string)
    expect(writtenMidiToStaffStep(77).step).toBe(8);  // F5 top line
    expect(writtenMidiToStaffStep(60).step).toBe(-2); // C4 1st ledger line below (Middle C)
    expect(writtenMidiToStaffStep(57).step).toBe(-4); // A3 2nd ledger line below (open 5th string)
    expect(writtenMidiToStaffStep(52).step).toBe(-7); // E3 space below 3rd ledger line (open 6th string)
    expect(writtenMidiToStaffStep(81).step).toBe(10); // A5 1st ledger line above (Pos. V high E f5)
  });

  it('resolves equivalent neck positions for the same sounding pitch (written C5 / sounding C4)', () => {
    const soundingC4 = writtenToSoundingMidi(72); // MIDI 60
    expect(soundingC4).toBe(60);
    expect(soundingToWrittenMidi(60)).toBe(72);

    const allPos = getFretPositionsForMidi(60, { maxFret: 15 });
    expect(allPos).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ stringNumber: 2, fret: 1 }),
        expect.objectContaining({ stringNumber: 3, fret: 5 }),
        expect.objectContaining({ stringNumber: 4, fret: 10 }),
        expect.objectContaining({ stringNumber: 5, fret: 15 }),
      ])
    );

    // Ranking by Pos. V should put 3rd string fret 5 first!
    const posV = getFretPositionsForMidi(60, { minFret: 5, maxFret: 8, preferredStartFret: 5 });
    expect(posV[0].stringNumber).toBe(3);
    expect(posV[0].fret).toBe(5);
  });

  it('generates accurate E Minor Pentatonic fretboard markers across all 6 strings', () => {
    const markers = getScaleFretboardMarkers(4, 'minor_pentatonic', 12);
    const roots = markers.filter((m) => m.isRoot);
    expect(roots.length).toBeGreaterThanOrEqual(6);
    for (const m of markers) {
      const midi = getMidiAtFret(m.stringNumber, m.fret);
      const rel = ((midi % 12) - 4 + 12) % 12;
      expect([0, 3, 5, 7, 10]).toContain(rel);
    }
    expect(GUITAR_STANDARD_EADGBE.strings).toHaveLength(6);
  });
});

describe('Procedural Sight-Reading Generator', () => {
  it('generates deterministic, bar-accurate scores within Pos. V and G Major constraints', () => {
    const a = generateSightReadingScore({
      position: 'pos-5',
      keySignature: 'G',
      rhythmLevel: 'eighths',
      measureCount: 8,
      seed: 4242,
    });
    const b = generateSightReadingScore({
      position: 'pos-5',
      keySignature: 'G',
      rhythmLevel: 'eighths',
      measureCount: 8,
      seed: 4242,
    });

    expect(a.measures).toHaveLength(8);
    expect(a.measures[0].positionMarker).toBe('Pos. V');
    expect(a).toEqual(b);

    // Every bar sums cleanly to 4 beats and respects frets 5..8
    for (const m of a.measures) {
      const totalBeats = m.events.reduce((acc, ev) => acc + DURATION_BEATS[ev.duration], 0);
      expect(totalBeats).toBeCloseTo(4, 5);
      for (const ev of m.events) {
        if (!ev.isRest && ev.pitches[0]?.hint) {
          expect(ev.pitches[0].hint.fret).toBeGreaterThanOrEqual(5);
          expect(ev.pitches[0].hint.fret).toBeLessThanOrEqual(8);
        }
      }
    }
  });
});

describe('YIN Real-Time Guitar Pitch Detector', () => {
  it('accurately detects Low E2 (82.41 Hz), A2 (110 Hz), G3 (196 Hz), and High E4 (329.63 Hz)', () => {
    const targets = [40, 45, 50, 55, 59, 64]; // All 6 standard open guitar strings
    for (const midi of targets) {
      const freq = midiToFrequency(midi);
      const wave = synthesizeGuitarLikeWave(freq, 44100, 2048);
      const detected = detectPitchYin(wave, { sampleRate: 44100 });
      expect(detected).not.toBeNull();
      expect(detected?.midi).toBe(midi);
      expect(Math.abs(detected?.cents ?? 99)).toBeLessThanOrEqual(10);
    }
  });

  it('rejects ambient silence below the RMS noise gate', () => {
    const quiet = new Float32Array(2048).fill(0.001);
    expect(detectPitchYin(quiet, { sampleRate: 44100 })).toBeNull();
  });
});

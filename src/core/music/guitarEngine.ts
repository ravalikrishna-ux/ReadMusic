import {
  FretPosition,
  InstrumentProfile,
  IntervalDefinition,
  KeySignatureId,
  NoteDuration,
  PitchClass,
  ScaleDefinition,
  ScaleId,
  ScientificPitch,
} from './types';

export const GUITAR_STANDARD_EADGBE: InstrumentProfile = {
  id: 'guitar-standard-eadgbe',
  displayName: 'Guitar (Standard Tuning)',
  tuningName: 'E A D G B E',
  clef: 'treble-8vb',
  transpositionSemitones: 12,
  fretCount: 15,
  strings: [
    { stringNumber: 6, openMidi: 40, label: 'E2', wound: true },
    { stringNumber: 5, openMidi: 45, label: 'A2', wound: true },
    { stringNumber: 4, openMidi: 50, label: 'D3', wound: true },
    { stringNumber: 3, openMidi: 55, label: 'G3', wound: false },
    { stringNumber: 2, openMidi: 59, label: 'B3', wound: false },
    { stringNumber: 1, openMidi: 64, label: 'E4', wound: false },
  ],
};

const SHARP_NAMES: PitchClass[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NAMES: PitchClass[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const KEY_SIGNATURES: Record<
  KeySignatureId,
  { label: string; accidentals: number; preferFlats: boolean; rootPc: number; isMinor: boolean; sharpsOrFlats: PitchClass[] }
> = {
  C: { label: 'C Major', accidentals: 0, preferFlats: false, rootPc: 0, isMinor: false, sharpsOrFlats: [] },
  Am: { label: 'A Minor', accidentals: 0, preferFlats: false, rootPc: 9, isMinor: true, sharpsOrFlats: [] },
  G: { label: 'G Major (1♯)', accidentals: 1, preferFlats: false, rootPc: 7, isMinor: false, sharpsOrFlats: ['F#'] },
  Em: { label: 'E Minor (1♯)', accidentals: 1, preferFlats: false, rootPc: 4, isMinor: true, sharpsOrFlats: ['F#'] },
  D: { label: 'D Major (2♯)', accidentals: 2, preferFlats: false, rootPc: 2, isMinor: false, sharpsOrFlats: ['F#', 'C#'] },
  Bm: { label: 'B Minor (2♯)', accidentals: 2, preferFlats: false, rootPc: 11, isMinor: true, sharpsOrFlats: ['F#', 'C#'] },
  A: { label: 'A Major (3♯)', accidentals: 3, preferFlats: false, rootPc: 9, isMinor: false, sharpsOrFlats: ['F#', 'C#', 'G#'] },
  E: { label: 'E Major (4♯)', accidentals: 4, preferFlats: false, rootPc: 4, isMinor: false, sharpsOrFlats: ['F#', 'C#', 'G#', 'D#'] },
  F: { label: 'F Major (1♭)', accidentals: -1, preferFlats: true, rootPc: 5, isMinor: false, sharpsOrFlats: ['Bb'] },
  Dm: { label: 'D Minor (1♭)', accidentals: -1, preferFlats: true, rootPc: 2, isMinor: true, sharpsOrFlats: ['Bb'] },
  Bb: { label: 'Bb Major (2♭)', accidentals: -2, preferFlats: true, rootPc: 10, isMinor: false, sharpsOrFlats: ['Bb', 'Eb'] },
};

export const DURATION_BEATS: Record<NoteDuration, number> = {
  w: 4,
  'h.': 3,
  h: 2,
  'q.': 1.5,
  q: 1,
  '8': 0.5,
  '16': 0.25,
};

export const SCALES: Record<ScaleId, ScaleDefinition> = {
  major: {
    id: 'major',
    name: 'Major (Ionian)',
    formula: '1 – 2 – 3 – 4 – 5 – 6 – 7',
    semitones: [0, 2, 4, 5, 7, 9, 11],
    degreeLabels: ['1', '2', '3', '4', '5', '6', '7'],
    mood: 'Bright, resolved, anthemic',
    guitarTip: 'The master ruler: every chord and mode is described by how it alters Major.',
  },
  natural_minor: {
    id: 'natural_minor',
    name: 'Natural Minor (Aeolian)',
    formula: '1 – 2 – ♭3 – 4 – 5 – ♭6 – ♭7',
    semitones: [0, 2, 3, 5, 7, 8, 10],
    degreeLabels: ['1', '2', '♭3', '4', '5', '♭6', '♭7'],
    mood: 'Melancholic, dramatic, rock-standard minor',
    guitarTip: 'That ♭6 (e.g., C in E Minor) gives riffs like "Seven Nation Army" their dramatic pull.',
  },
  minor_pentatonic: {
    id: 'minor_pentatonic',
    name: 'Minor Pentatonic',
    formula: '1 – ♭3 – 4 – 5 – ♭7',
    semitones: [0, 3, 5, 7, 10],
    degreeLabels: ['1', '♭3', '4', '5', '♭7'],
    mood: 'Raw, punchy, indestructible rock/blues core',
    guitarTip: 'Removes the half-step tensions (2 & ♭6) so every note sits cleanly over rock progressions.',
  },
  major_pentatonic: {
    id: 'major_pentatonic',
    name: 'Major Pentatonic',
    formula: '1 – 2 – 3 – 5 – 6',
    semitones: [0, 2, 4, 7, 9],
    degreeLabels: ['1', '2', '3', '5', '6'],
    mood: 'Warm, uplifting, melodic Britpop & soul-rock',
    guitarTip: 'Uses the exact same 5 neck shapes as its relative Minor Pentatonic — just center on the Major root!',
  },
  blues: {
    id: 'blues',
    name: 'Blues Scale',
    formula: '1 – ♭3 – 4 – ♭5 – 5 – ♭7',
    semitones: [0, 3, 5, 6, 7, 10],
    degreeLabels: ['1', '♭3', '4', '♭5', '5', '♭7'],
    mood: 'Gritty, vocal, expressive',
    guitarTip: 'Treat the ♭5 blue note as a passing spice or bend into the 5th rather than resting on it.',
  },
  dorian: {
    id: 'dorian',
    name: 'Dorian Mode',
    formula: '1 – 2 – ♭3 – 4 – 5 – 6 – ♭7',
    semitones: [0, 2, 3, 5, 7, 9, 10],
    degreeLabels: ['1', '2', '♭3', '4', '5', '6', '♭7'],
    mood: 'Cool, hypnotic minor with a lifted major IV chord',
    guitarTip: 'Natural Minor with a raised natural 6th — listen for the i → IV shift in "Wicked Game" & "Boulevard of Broken Dreams".',
  },
  mixolydian: {
    id: 'mixolydian',
    name: 'Mixolydian Mode',
    formula: '1 – 2 – 3 – 4 – 5 – 6 – ♭7',
    semitones: [0, 2, 4, 5, 7, 9, 10],
    degreeLabels: ['1', '2', '3', '4', '5', '6', '♭7'],
    mood: 'Driving classic rock, swaggering major',
    guitarTip: 'Major scale with a ♭7 — instantly creates the I – ♭VII – IV classic rock engine ("Sweet Child O\' Mine").',
  },
  lydian: {
    id: 'lydian',
    name: 'Lydian Mode',
    formula: '1 – 2 – 3 – ♯4 – 5 – 6 – 7',
    semitones: [0, 2, 4, 6, 7, 9, 11],
    degreeLabels: ['1', '2', '3', '♯4', '5', '6', '7'],
    mood: 'Dreamy, floating, cinematic',
    guitarTip: 'Major scale with a raised ♯4 — emphasizes bright I → II major-to-major lifts.',
  },
  phrygian: {
    id: 'phrygian',
    name: 'Phrygian Mode',
    formula: '1 – ♭2 – ♭3 – 4 – 5 – ♭6 – ♭7',
    semitones: [0, 1, 3, 5, 7, 8, 10],
    degreeLabels: ['1', '♭2', '♭3', '4', '5', '♭6', '♭7'],
    mood: 'Dark, menacing, Spanish/metal edge',
    guitarTip: 'The half-step from ♭2 down to 1 (e.g., F → E on the open low string) is the signature heavy rock crunch.',
  },
  harmonic_minor: {
    id: 'harmonic_minor',
    name: 'Harmonic Minor',
    formula: '1 – 2 – ♭3 – 4 – 5 – ♭6 – 7',
    semitones: [0, 2, 3, 5, 7, 8, 11],
    degreeLabels: ['1', '2', '♭3', '4', '5', '♭6', '7'],
    mood: 'Dramatic, neo-classical, Latin-rock pull',
    guitarTip: 'Raising the 7th creates a strong dominant V7 → i resolution (heard in Santana\'s "Smooth").',
  },
};

export const INTERVALS: IntervalDefinition[] = [
  { semitones: 0, shortName: 'P1', name: 'Unison', rockCue: 'Same pitch anchor' },
  { semitones: 1, shortName: 'm2', name: 'Minor 2nd', rockCue: '1 fret — Jaws / Phrygian crunch' },
  { semitones: 2, shortName: 'M2', name: 'Major 2nd', rockCue: '2 frets — whole step / sus2 shimmer' },
  { semitones: 3, shortName: 'm3', name: 'Minor 3rd', rockCue: '3 frets — dark minor riff backbone' },
  { semitones: 4, shortName: 'M3', name: 'Major 3rd', rockCue: '4 frets — bright major chord identity' },
  { semitones: 5, shortName: 'P4', name: 'Perfect 4th', rockCue: '5 frets — adjacent open strings (E→A)' },
  { semitones: 6, shortName: '♭5', name: 'Tritone', rockCue: '6 frets — "Enter Sandman" & blues spice' },
  { semitones: 7, shortName: 'P5', name: 'Perfect 5th', rockCue: '7 frets — universal rock power chord' },
  { semitones: 8, shortName: 'm6', name: 'Minor 6th', rockCue: '8 frets — bittersweet minor lift' },
  { semitones: 9, shortName: 'M6', name: 'Major 6th', rockCue: '9 frets — blues-rock shuffle & Dorian color' },
  { semitones: 10, shortName: 'm7', name: 'Minor 7th', rockCue: '10 frets — dominant/Mixolydian pull' },
  { semitones: 11, shortName: 'M7', name: 'Major 7th', rockCue: '11 frets — lush "Everlong" / "Mr. Brightside" edge' },
  { semitones: 12, shortName: 'P8', name: 'Octave', rockCue: '12 frets — alt-rock octave lead ("Cherub Rock")' },
];

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function frequencyToMidi(frequencyHz: number): { midi: number; cents: number } {
  const exact = 69 + 12 * Math.log2(frequencyHz / 440);
  const midi = Math.round(exact);
  const cents = Math.round((exact - midi) * 100);
  return { midi, cents };
}

export function soundingToWrittenMidi(
  soundingMidi: number,
  instrument: InstrumentProfile = GUITAR_STANDARD_EADGBE
): number {
  return soundingMidi + instrument.transpositionSemitones;
}

export function writtenToSoundingMidi(
  writtenMidi: number,
  instrument: InstrumentProfile = GUITAR_STANDARD_EADGBE
): number {
  return writtenMidi - instrument.transpositionSemitones;
}

export function pitchClassToName(pc: number, preferFlats = false): PitchClass {
  const normalized = ((pc % 12) + 12) % 12;
  return preferFlats ? FLAT_NAMES[normalized] : SHARP_NAMES[normalized];
}

export function midiToScientificPitch(
  soundingMidi: number,
  preferFlats = false,
  instrument: InstrumentProfile = GUITAR_STANDARD_EADGBE
): ScientificPitch {
  const pc = ((soundingMidi % 12) + 12) % 12;
  const octave = Math.floor(soundingMidi / 12) - 1;
  const writtenMidi = soundingToWrittenMidi(soundingMidi, instrument);
  return {
    midi: soundingMidi,
    writtenMidi,
    name: pitchClassToName(pc, preferFlats),
    octave,
    writtenOctave: Math.floor(writtenMidi / 12) - 1,
    frequencyHz: Number(midiToFrequency(soundingMidi).toFixed(2)),
  };
}

export function writtenMidiToLabel(writtenMidi: number, preferFlats = false): string {
  const pc = ((writtenMidi % 12) + 12) % 12;
  const octave = Math.floor(writtenMidi / 12) - 1;
  return `${pitchClassToName(pc, preferFlats)}${octave}`;
}

/**
 * Returns the diatonic staff step relative to Treble Clef bottom line (E4 = written MIDI 64 -> step 0).
 * Each +1 step moves up half a staff space (line -> space -> line).
 * Examples:
 *  E4 (64) -> 0  (1st/bottom line)
 *  G4 (67) -> 2  (2nd line — G clef curl)
 *  B4 (71) -> 4  (3rd/middle line)
 *  D5 (74) -> 6  (4th line)
 *  F5 (77) -> 8  (5th/top line)
 *  C4 (60) -> -2 (1st ledger line below)
 *  A3 (57) -> -4 (2nd ledger line below — open 5th string)
 *  E3 (52) -> -7 (space below 3rd ledger line below — open 6th string)
 */
const DIATONIC_INDEX_SHARP = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6]; // C=0, D=1, E=2, F=3, G=4, A=5, B=6
const DIATONIC_INDEX_FLAT  = [0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6];

export function writtenMidiToStaffStep(writtenMidi: number, preferFlats = false): {
  step: number;
  isAccidental: boolean;
  accidentalSymbol?: '#' | 'b';
} {
  const octave = Math.floor(writtenMidi / 12) - 1;
  const pc = ((writtenMidi % 12) + 12) % 12;
  const letterIndex = preferFlats ? DIATONIC_INDEX_FLAT[pc] : DIATONIC_INDEX_SHARP[pc];
  // E4 is octave 4, letterIndex 2 -> absolute diatonic 4*7 + 2 = 30
  const absDiatonic = octave * 7 + letterIndex;
  const step = absDiatonic - 30;
  const isBlackKey = [1, 3, 6, 8, 10].includes(pc);
  return {
    step,
    isAccidental: isBlackKey,
    accidentalSymbol: isBlackKey ? (preferFlats ? 'b' : '#') : undefined,
  };
}

export function getMidiAtFret(
  stringNumber: number,
  fret: number,
  instrument: InstrumentProfile = GUITAR_STANDARD_EADGBE
): number {
  const str = instrument.strings.find((s) => s.stringNumber === stringNumber);
  if (!str) {
    throw new Error(`Unknown stringNumber: ${stringNumber}`);
  }
  return str.openMidi + fret;
}

/**
 * Finds all valid fretboard positions for a sounding MIDI note on the instrument.
 * Optionally filters or ranks by a target neck position (0 = Open, 2 = Pos II, 5 = Pos V, 7 = Pos VII).
 */
export function getFretPositionsForMidi(
  soundingMidi: number,
  options?: { minFret?: number; maxFret?: number; preferredStartFret?: number },
  instrument: InstrumentProfile = GUITAR_STANDARD_EADGBE
): FretPosition[] {
  const minFret = options?.minFret ?? 0;
  const maxFret = options?.maxFret ?? instrument.fretCount;
  const results: FretPosition[] = [];

  for (const str of instrument.strings) {
    const fret = soundingMidi - str.openMidi;
    if (fret >= minFret && fret <= maxFret) {
      const finger =
        fret === 0
          ? 0
          : options?.preferredStartFret && options.preferredStartFret > 0
            ? (Math.min(4, Math.max(1, fret - options.preferredStartFret + 1)) as 1 | 2 | 3 | 4)
            : (Math.min(4, fret) as 1 | 2 | 3 | 4);
      results.push({ stringNumber: str.stringNumber, fret, finger });
    }
  }

  if (options?.preferredStartFret !== undefined) {
    const target = options.preferredStartFret;
    results.sort((a, b) => {
      const distA = target === 0 ? a.fret : Math.abs(a.fret - (target + 1.5));
      const distB = target === 0 ? b.fret : Math.abs(b.fret - (target + 1.5));
      return distA - distB;
    });
  } else {
    // Default: prefer lowest comfortable fret
    results.sort((a, b) => a.fret - b.fret);
  }

  return results;
}

export interface FretboardScaleMarker {
  stringNumber: number;
  fret: number;
  soundingMidi: number;
  pitchName: PitchClass;
  degreeLabel: string;
  isRoot: boolean;
}

export function getScaleFretboardMarkers(
  rootPc: number,
  scaleId: ScaleId,
  maxFret = 12,
  preferFlats = false,
  instrument: InstrumentProfile = GUITAR_STANDARD_EADGBE
): FretboardScaleMarker[] {
  const scale = SCALES[scaleId];
  const markers: FretboardScaleMarker[] = [];

  for (const str of instrument.strings) {
    for (let fret = 0; fret <= maxFret; fret++) {
      const midi = str.openMidi + fret;
      const pc = ((midi % 12) + 12) % 12;
      const interval = ((pc - rootPc) % 12 + 12) % 12;
      const idx = scale.semitones.indexOf(interval);
      if (idx !== -1) {
        markers.push({
          stringNumber: str.stringNumber,
          fret,
          soundingMidi: midi,
          pitchName: pitchClassToName(pc, preferFlats),
          degreeLabel: scale.degreeLabels[idx],
          isRoot: interval === 0,
        });
      }
    }
  }

  return markers;
}

export function formatCircledString(stringNumber: number): string {
  const symbols = ['', '①', '②', '③', '④', '⑤', '⑥'];
  return symbols[stringNumber] ?? String(stringNumber);
}

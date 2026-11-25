import {
  DURATION_BEATS,
  getFretPositionsForMidi,
  KEY_SIGNATURES,
  SCALES,
  soundingToWrittenMidi,
} from '../music/guitarEngine';
import {
  KeySignatureId,
  NoteDuration,
  PlayableScore,
  ScoreMeasure,
  ScoreNoteEvent,
} from '../music/types';

export type PositionPreset = 'open-treble' | 'open-full' | 'pos-2' | 'pos-5' | 'pos-7';
export type RhythmLevel = 'basic' | 'eighths' | 'syncopated' | 'sixteenths';

export interface SightReadingConfig {
  position: PositionPreset;
  keySignature: KeySignatureId;
  rhythmLevel: RhythmLevel;
  measureCount: 4 | 8 | 16;
  timeSignature?: [number, number];
  bpm?: number;
  allowPeekFret?: boolean;
  seed?: number;
}

const POSITION_BOUNDS: Record<
  PositionPreset,
  {
    label: string;
    positionMarker?: string;
    minSoundingMidi: number;
    maxSoundingMidi: number;
    minFret: number;
    maxFret: number;
    preferredStartFret: number;
  }
> = {
  'open-treble': {
    label: 'Open Position (Strings ①–③)',
    minSoundingMidi: 55, // G3 (written G4)
    maxSoundingMidi: 67, // G4 (written G5)
    minFret: 0,
    maxFret: 3,
    preferredStartFret: 0,
  },
  'open-full': {
    label: 'Full Open Position (Strings ①–⑥)',
    minSoundingMidi: 40, // E2 (written E3)
    maxSoundingMidi: 67, // G4 (written G5)
    minFret: 0,
    maxFret: 4,
    preferredStartFret: 0,
  },
  'pos-2': {
    label: 'Second Position (Pos. II)',
    positionMarker: 'Pos. II',
    minSoundingMidi: 47, // B2
    maxSoundingMidi: 69, // A4
    minFret: 2,
    maxFret: 5,
    preferredStartFret: 2,
  },
  'pos-5': {
    label: 'Fifth Position (Pos. V)',
    positionMarker: 'Pos. V',
    minSoundingMidi: 50, // D3
    maxSoundingMidi: 72, // C5
    minFret: 5,
    maxFret: 8,
    preferredStartFret: 5,
  },
  'pos-7': {
    label: 'Seventh Position (Pos. VII)',
    positionMarker: 'Pos. VII',
    minSoundingMidi: 52, // E3
    maxSoundingMidi: 74, // D5
    minFret: 7,
    maxFret: 10,
    preferredStartFret: 7,
  },
};

function createRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Curated idiomatic bar-level rhythm patterns in 4/4 and 3/4
const RHYTHM_PATTERNS_4_4: Record<RhythmLevel, NoteDuration[][]> = {
  basic: [
    ['q', 'q', 'h'],
    ['h', 'q', 'q'],
    ['q', 'q', 'q', 'q'],
    ['h', 'h'],
    ['h.', 'q'],
  ],
  eighths: [
    ['q', '8', '8', 'q', 'q'],
    ['8', '8', 'q', '8', '8', 'q'],
    ['q', 'q', '8', '8', 'q'],
    ['h', '8', '8', 'q'],
    ['8', '8', '8', '8', 'h'],
  ],
  syncopated: [
    ['q.', '8', 'q', 'q'],
    ['q', 'q.', '8', 'q'],
    ['q.', '8', '8', '8', 'q'],
    ['8', '8', 'q.', '8', 'q'],
    ['q.', '8', 'h'],
  ],
  sixteenths: [
    ['q', '16', '16', '8', 'q', 'q'],
    ['8', '16', '16', 'q', '8', '8', 'q'],
    ['q.', '8', '16', '16', '8', 'q'],
    ['16', '16', '16', '16', 'q', '8', '8', 'q'],
  ],
};

const RHYTHM_PATTERNS_3_4: Record<RhythmLevel, NoteDuration[][]> = {
  basic: [
    ['q', 'q', 'q'],
    ['h', 'q'],
    ['q', 'h'],
    ['h.'],
  ],
  eighths: [
    ['q', '8', '8', 'q'],
    ['8', '8', 'q', 'q'],
    ['q', 'q', '8', '8'],
  ],
  syncopated: [
    ['q.', '8', 'q'],
    ['q', 'q.', '8'],
  ],
  sixteenths: [
    ['q', '16', '16', '8', 'q'],
    ['8', '8', '16', '16', '8', 'q'],
  ],
};

export function generateSightReadingScore(config: SightReadingConfig): PlayableScore {
  const seed = config.seed ?? Math.floor(Date.now() % 1_000_000);
  const rand = createRng(seed);
  const timeSig: [number, number] = config.timeSignature ?? [4, 4];
  const keyInfo = KEY_SIGNATURES[config.keySignature];
  const bounds = POSITION_BOUNDS[config.position];

  const scaleIntervals = keyInfo.isMinor ? SCALES.natural_minor.semitones : SCALES.major.semitones;
  const pitchPool: number[] = [];

  for (let midi = bounds.minSoundingMidi; midi <= bounds.maxSoundingMidi; midi++) {
    const pc = ((midi % 12) + 12) % 12;
    const rel = ((pc - keyInfo.rootPc) % 12 + 12) % 12;
    if (scaleIntervals.includes(rel)) {
      const positions = getFretPositionsForMidi(midi, {
        minFret: bounds.minFret,
        maxFret: bounds.maxFret,
        preferredStartFret: bounds.preferredStartFret,
      });
      if (positions.length > 0) {
        pitchPool.push(midi);
      }
    }
  }

  // Fallback safeguard if a rare combination has a tiny pool
  if (pitchPool.length < 4) {
    for (let midi = 55; midi <= 67; midi++) {
      pitchPool.push(midi);
    }
  }

  // Pick a musical starting pitch near tonic in the middle of the pool
  const tonicIndices = pitchPool
    .map((m, idx) => ({ m, idx }))
    .filter(({ m }) => ((m % 12) + 12) % 12 === keyInfo.rootPc);

  let currentIdx =
    tonicIndices.length > 0
      ? tonicIndices[Math.floor(tonicIndices.length / 2)].idx
      : Math.floor(pitchPool.length / 2);

  const patterns =
    timeSig[0] === 3 ? RHYTHM_PATTERNS_3_4[config.rhythmLevel] : RHYTHM_PATTERNS_4_4[config.rhythmLevel];

  const measures: ScoreMeasure[] = [];

  for (let mIdx = 0; mIdx < config.measureCount; mIdx++) {
    const isFinalBar = mIdx === config.measureCount - 1;
    const chosenPattern: NoteDuration[] = isFinalBar
      ? timeSig[0] === 3
        ? ['q', 'h']
        : ['q', 'q', 'h']
      : patterns[Math.floor(rand() * patterns.length)];

    const events: ScoreNoteEvent[] = [];
    let beatOffset = 0;

    for (let eIdx = 0; eIdx < chosenPattern.length; eIdx++) {
      const dur = chosenPattern[eIdx];
      const isLastEvent = isFinalBar && eIdx === chosenPattern.length - 1;

      // Occasional rest (10% chance, never on beat 0 or final note)
      const shouldRest = !isLastEvent && eIdx > 0 && dur === 'q' && rand() < 0.08;

      if (shouldRest) {
        events.push({
          id: `gen-${seed}-m${mIdx}-e${eIdx}`,
          beatOffset,
          duration: dur,
          isRest: true,
          pitches: [],
        });
      } else {
        if (isLastEvent && tonicIndices.length > 0) {
          // Resolve cleanly to nearest tonic!
          let nearest = tonicIndices[0].idx;
          let minDist = Math.abs(nearest - currentIdx);
          for (const t of tonicIndices) {
            const d = Math.abs(t.idx - currentIdx);
            if (d < minDist) {
              minDist = d;
              nearest = t.idx;
            }
          }
          currentIdx = nearest;
        } else if (!(mIdx === 0 && eIdx === 0)) {
          // Stepwise melodic contour bias: mostly +/-1 or +/-2 scale steps, rare leap +/-3
          const r = rand();
          let stepDelta = 0;
          if (r < 0.34) stepDelta = 1;
          else if (r < 0.68) stepDelta = -1;
          else if (r < 0.80) stepDelta = 2;
          else if (r < 0.92) stepDelta = -2;
          else if (r < 0.96) stepDelta = 3;
          else stepDelta = -3;

          const candidate = currentIdx + stepDelta;
          if (candidate >= 0 && candidate < pitchPool.length) {
            currentIdx = candidate;
          } else {
            currentIdx = Math.max(0, Math.min(pitchPool.length - 1, currentIdx - stepDelta));
          }
        }

        const soundingMidi = pitchPool[currentIdx];
        const writtenMidi = soundingToWrittenMidi(soundingMidi);
        const hint = getFretPositionsForMidi(soundingMidi, {
          minFret: bounds.minFret,
          maxFret: bounds.maxFret,
          preferredStartFret: bounds.preferredStartFret,
        })[0];

        events.push({
          id: `gen-${seed}-m${mIdx}-e${eIdx}`,
          beatOffset,
          duration: dur,
          pitches: [
            {
              writtenMidi,
              voice: 1,
              hint,
            },
          ],
        });
      }

      beatOffset += DURATION_BEATS[dur];
    }

    measures.push({
      index: mIdx,
      positionMarker: mIdx === 0 ? bounds.positionMarker : undefined,
      events,
    });
  }

  return {
    id: `procedural-${seed}`,
    title: `Sight-Read Etude #${seed % 1000}`,
    subtitle: `${bounds.label} • ${keyInfo.label} • ${config.rhythmLevel.toUpperCase()}`,
    moduleId: 'sight-read-lab',
    bpmDefault: config.bpm ?? 76,
    bpmTarget: (config.bpm ?? 76) + 16,
    timeSignature: timeSig,
    keySignature: config.keySignature,
    allowPeekFret: config.allowPeekFret ?? false,
    measures,
  };
}

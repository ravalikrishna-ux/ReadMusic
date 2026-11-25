import { PlayableScore, ScoreMeasure, ScoreNoteEvent } from '../core/music/types';

// Helper to build crisp, readable single-line note events cleanly
function ev(
  id: string,
  beatOffset: number,
  duration: ScoreNoteEvent['duration'],
  writtenMidi: number,
  stringNumber: number,
  fret: number,
  extra?: Partial<ScoreNoteEvent> & {
    finger?: 0 | 1 | 2 | 3 | 4;
    accidental?: '#' | 'b' | 'n';
  }
): ScoreNoteEvent {
  return {
    id,
    beatOffset,
    duration,
    chordSymbol: extra?.chordSymbol,
    isSlash: extra?.isSlash,
    pitches: [
      {
        writtenMidi,
        accidental: extra?.accidental,
        voice: 1,
        hint: { stringNumber, fret, finger: extra?.finger },
      },
    ],
  };
}

function slash(id: string, beatOffset: number, duration: ScoreNoteEvent['duration'], chordSymbol?: string): ScoreNoteEvent {
  return {
    id,
    beatOffset,
    duration,
    isSlash: true,
    chordSymbol,
    pitches: [{ writtenMidi: 71, voice: 1 }], // B4 middle-line rhythm slash
  };
}

function rest(id: string, beatOffset: number, duration: ScoreNoteEvent['duration']): ScoreNoteEvent {
  return { id, beatOffset, duration, isRest: true, pitches: [] };
}

/**
 * Written MIDI Reference for Guitar Standard Tuning (Treble Clef 8vb):
 * String ①: E5=76 (f0), F5=77 (f1), F#5=78 (f2), G5=79 (f3), A5=81 (f5), B5=83 (f7), C6=84 (f8)
 * String ②: B4=71 (f0), C5=72 (f1), D5=74 (f3), E5=76 (f5), F#5=78 (f7), G5=79 (f8)
 * String ③: G4=67 (f0), A4=69 (f2), B4=71 (f4), C5=72 (f5), D5=74 (f7)
 * String ④: D4=62 (f0), E4=64 (f2), F4=65 (f3), F#4=66 (f4), G4=67 (f5), A4=69 (f7)
 * String ⑤: A3=57 (f0), B3=59 (f2), C4=60 (f3), D4=62 (f5), E4=64 (f7)
 * String ⑥: E3=52 (f0), F3=53 (f1), F#3=54 (f2), G3=55 (f3), A3=57 (f5)
 */

export const PLAYABLE_SCORES: Record<string, PlayableScore> = {
  'r1-2-high-e-horizon': {
    id: 'r1-2-high-e-horizon',
    title: 'High E Horizon',
    subtitle: 'Module R1.2 • First String (E5 – F5 – G5) • Whole, Half & Quarter Notes',
    moduleId: 'R1',
    bpmDefault: 72,
    bpmTarget: 88,
    timeSignature: [4, 4],
    keySignature: 'C',
    allowPeekFret: true,
    measures: [
      {
        index: 0,
        sectionLabel: 'Open ①',
        events: [
          ev('r12-0-0', 0, 'q', 76, 1, 0, { finger: 0 }),
          ev('r12-0-1', 1, 'q', 77, 1, 1, { finger: 1 }),
          ev('r12-0-2', 2, 'h', 79, 1, 3, { finger: 3 }),
        ],
      },
      {
        index: 1,
        events: [
          ev('r12-1-0', 0, 'q', 79, 1, 3, { finger: 3 }),
          ev('r12-1-1', 1, 'q', 77, 1, 1, { finger: 1 }),
          ev('r12-1-2', 2, 'h', 76, 1, 0, { finger: 0 }),
        ],
      },
      {
        index: 2,
        events: [
          ev('r12-2-0', 0, 'q', 77, 1, 1, { finger: 1 }),
          ev('r12-2-1', 1, 'q', 79, 1, 3, { finger: 3 }),
          ev('r12-2-2', 2, 'q', 77, 1, 1, { finger: 1 }),
          ev('r12-2-3', 3, 'q', 76, 1, 0, { finger: 0 }),
        ],
      },
      {
        index: 3,
        events: [
          ev('r12-3-0', 0, 'h', 77, 1, 1, { finger: 1 }),
          ev('r12-3-1', 2, 'h', 76, 1, 0, { finger: 0 }),
        ],
      },
    ],
  },

  'r1-3-two-string-ballad': {
    id: 'r1-3-two-string-ballad',
    title: 'Two-String Ballad',
    subtitle: 'Module R1.3 • Strings ① & ② (B4 – G5) • Smooth String Crossing',
    moduleId: 'R1',
    bpmDefault: 74,
    bpmTarget: 92,
    timeSignature: [4, 4],
    keySignature: 'C',
    allowPeekFret: true,
    measures: [
      {
        index: 0,
        events: [
          ev('r13-0-0', 0, 'q', 72, 2, 1, { finger: 1 }), // C5
          ev('r13-0-1', 1, 'q', 74, 2, 3, { finger: 3 }), // D5
          ev('r13-0-2', 2, 'q', 76, 1, 0, { finger: 0 }), // E5
          ev('r13-0-3', 3, 'q', 74, 2, 3, { finger: 3 }), // D5
        ],
      },
      {
        index: 1,
        events: [
          ev('r13-1-0', 0, 'q', 76, 1, 0, { finger: 0 }),
          ev('r13-1-1', 1, 'q', 77, 1, 1, { finger: 1 }),
          ev('r13-1-2', 2, 'h', 79, 1, 3, { finger: 3 }),
        ],
      },
      {
        index: 2,
        events: [
          ev('r13-2-0', 0, 'q', 77, 1, 1, { finger: 1 }),
          ev('r13-2-1', 1, 'q', 76, 1, 0, { finger: 0 }),
          ev('r13-2-2', 2, 'q', 74, 2, 3, { finger: 3 }),
          ev('r13-2-3', 3, 'q', 71, 2, 0, { finger: 0 }), // B4
        ],
      },
      {
        index: 3,
        events: [
          ev('r13-3-0', 0, 'h', 74, 2, 3, { finger: 3 }),
          ev('r13-3-1', 2, 'h', 72, 2, 1, { finger: 1 }),
        ],
      },
    ],
  },

  'r1-4-acoustic-waltz': {
    id: 'r1-4-acoustic-waltz',
    title: 'Acoustic Waltz in C',
    subtitle: 'Module R1.4 • Strings ①–③ (G4 – G5) • 3/4 Meter & Dotted Half Notes',
    moduleId: 'R1',
    bpmDefault: 80,
    bpmTarget: 96,
    timeSignature: [3, 4],
    keySignature: 'C',
    allowPeekFret: true,
    measures: [
      {
        index: 0,
        events: [
          ev('r14-0-0', 0, 'q', 67, 3, 0, { finger: 0 }), // G4
          ev('r14-0-1', 1, 'q', 72, 2, 1, { finger: 1 }), // C5
          ev('r14-0-2', 2, 'q', 76, 1, 0, { finger: 0 }), // E5
        ],
      },
      {
        index: 1,
        events: [
          ev('r14-1-0', 0, 'h', 74, 2, 3, { finger: 3 }), // D5
          ev('r14-1-1', 2, 'q', 71, 2, 0, { finger: 0 }), // B4
        ],
      },
      {
        index: 2,
        events: [
          ev('r14-2-0', 0, 'q', 69, 3, 2, { finger: 2 }), // A4
          ev('r14-2-1', 1, 'q', 72, 2, 1, { finger: 1 }), // C5
          ev('r14-2-2', 2, 'q', 74, 2, 3, { finger: 3 }), // D5
        ],
      },
      {
        index: 3,
        events: [ev('r14-3-0', 0, 'h.', 72, 2, 1, { finger: 1 })],
      },
    ],
  },

  'r2-4-open-folk-rock': {
    id: 'r2-4-open-folk-rock',
    title: 'Open-Position Folk Rock',
    subtitle: 'Module R2.4 • Full 6-String Open Position (E3 – G5) • Bass Ledger Lines',
    moduleId: 'R2',
    bpmDefault: 76,
    bpmTarget: 92,
    timeSignature: [4, 4],
    keySignature: 'C',
    allowPeekFret: true,
    measures: [
      {
        index: 0,
        sectionLabel: 'Bass Walk',
        events: [
          ev('r24-0-0', 0, 'q', 52, 6, 0, { finger: 0 }), // E3 (3 ledger lines below)
          ev('r24-0-1', 1, 'q', 55, 6, 3, { finger: 3 }), // G3
          ev('r24-0-2', 2, 'q', 57, 5, 0, { finger: 0 }), // A3 (2nd ledger line below)
          ev('r24-0-3', 3, 'q', 60, 5, 3, { finger: 3 }), // C4 (Middle C!)
        ],
      },
      {
        index: 1,
        events: [
          ev('r24-1-0', 0, 'q', 62, 4, 0, { finger: 0 }), // D4
          ev('r24-1-1', 1, 'q', 64, 4, 2, { finger: 2 }), // E4
          ev('r24-1-2', 2, 'h', 67, 3, 0, { finger: 0 }), // G4
        ],
      },
      {
        index: 2,
        events: [
          ev('r24-2-0', 0, 'q', 69, 3, 2, { finger: 2 }), // A4
          ev('r24-2-1', 1, 'q', 67, 3, 0, { finger: 0 }), // G4
          ev('r24-2-2', 2, 'q', 64, 4, 2, { finger: 2 }), // E4
          ev('r24-2-3', 3, 'q', 62, 4, 0, { finger: 0 }), // D4
        ],
      },
      {
        index: 3,
        events: [
          ev('r24-3-0', 0, 'h', 60, 5, 3, { finger: 3 }), // C4
          ev('r24-3-1', 2, 'h', 57, 5, 0, { finger: 0 }), // A3
        ],
      },
    ],
  },

  'r3-2-90s-anthem-hook': {
    id: 'r3-2-90s-anthem-hook',
    title: '90s Anthem Hook',
    subtitle: 'Module R3.2 • Beamed Eighth Notes & Dotted-Quarter Syncopation',
    moduleId: 'R3',
    bpmDefault: 84,
    bpmTarget: 102,
    timeSignature: [4, 4],
    keySignature: 'C',
    allowPeekFret: true,
    measures: [
      {
        index: 0,
        events: [
          ev('r32-0-0', 0, 'q.', 72, 2, 1, { finger: 1 }),
          ev('r32-0-1', 1.5, '8', 74, 2, 3, { finger: 3 }),
          ev('r32-0-2', 2, '8', 76, 1, 0, { finger: 0 }),
          ev('r32-0-3', 2.5, '8', 74, 2, 3, { finger: 3 }),
          ev('r32-0-4', 3, 'q', 72, 2, 1, { finger: 1 }),
        ],
      },
      {
        index: 1,
        events: [
          ev('r32-1-0', 0, 'q.', 69, 3, 2, { finger: 2 }),
          ev('r32-1-1', 1.5, '8', 67, 3, 0, { finger: 0 }),
          ev('r32-1-2', 2, 'h', 64, 4, 2, { finger: 2 }),
        ],
      },
      {
        index: 2,
        events: [
          ev('r32-2-0', 0, '8', 67, 3, 0, { finger: 0 }),
          ev('r32-2-1', 0.5, '8', 69, 3, 2, { finger: 2 }),
          ev('r32-2-2', 1, 'q', 72, 2, 1, { finger: 1 }),
          ev('r32-2-3', 2, '8', 74, 2, 3, { finger: 3 }),
          ev('r32-2-4', 2.5, '8', 76, 1, 0, { finger: 0 }),
          ev('r32-2-5', 3, 'q', 79, 1, 3, { finger: 3 }),
        ],
      },
      {
        index: 3,
        events: [
          ev('r32-3-0', 0, 'q.', 76, 1, 0, { finger: 0 }),
          ev('r32-3-1', 1.5, '8', 74, 2, 3, { finger: 3 }),
          ev('r32-3-2', 2, 'h', 72, 2, 1, { finger: 1 }),
        ],
      },
    ],
  },

  'r4-2-britpop-in-g': {
    id: 'r4-2-britpop-in-g',
    title: 'Britpop Melody in G',
    subtitle: 'Module R4.2 • Key of G Major (1♯: F♯) • Open Position',
    moduleId: 'R4',
    bpmDefault: 86,
    bpmTarget: 104,
    timeSignature: [4, 4],
    keySignature: 'G',
    allowPeekFret: true,
    measures: [
      {
        index: 0,
        events: [
          ev('r42-0-0', 0, 'q', 67, 3, 0, { finger: 0 }), // G4
          ev('r42-0-1', 1, '8', 71, 2, 0, { finger: 0 }), // B4
          ev('r42-0-2', 1.5, '8', 74, 2, 3, { finger: 3 }), // D5
          ev('r42-0-3', 2, 'q', 78, 1, 2, { finger: 2 }), // F#5 (from key sig!)
          ev('r42-0-4', 3, 'q', 79, 1, 3, { finger: 3 }), // G5
        ],
      },
      {
        index: 1,
        events: [
          ev('r42-1-0', 0, 'q.', 78, 1, 2, { finger: 2 }),
          ev('r42-1-1', 1.5, '8', 76, 1, 0, { finger: 0 }),
          ev('r42-1-2', 2, 'h', 74, 2, 3, { finger: 3 }),
        ],
      },
      {
        index: 2,
        events: [
          ev('r42-2-0', 0, 'q', 72, 2, 1, { finger: 1 }),
          ev('r42-2-1', 1, 'q', 71, 2, 0, { finger: 0 }),
          ev('r42-2-2', 2, '8', 69, 3, 2, { finger: 2 }),
          ev('r42-2-3', 2.5, '8', 67, 3, 0, { finger: 0 }),
          ev('r42-2-4', 3, 'q', 66, 4, 4, { finger: 4 }), // F#4
        ],
      },
      {
        index: 3,
        events: [
          ev('r42-3-0', 0, 'h', 67, 3, 0, { finger: 0 }),
          rest('r42-3-1', 2, 'h'),
        ],
      },
    ],
  },

  'r5-2-studio-band-chart': {
    id: 'r5-2-studio-band-chart',
    title: 'Studio Band Chart #1',
    subtitle: 'Module R5.2 • Hybrid Intro Riff → Slash-Chord Rhythm Section',
    moduleId: 'R5',
    bpmDefault: 94,
    bpmTarget: 112,
    timeSignature: [4, 4],
    keySignature: 'G',
    allowPeekFret: false,
    measures: [
      {
        index: 0,
        sectionLabel: 'Intro Riff',
        events: [
          ev('r52-0-0', 0, '8', 55, 6, 3, { finger: 3, chordSymbol: 'G5' }),
          ev('r52-0-1', 0.5, '8', 59, 5, 2, { finger: 2 }),
          ev('r52-0-2', 1, 'q', 62, 4, 0, { finger: 0 }),
          ev('r52-0-3', 2, '8', 66, 4, 4, { finger: 4 }),
          ev('r52-0-4', 2.5, '8', 67, 3, 0, { finger: 0 }),
          ev('r52-0-5', 3, 'q', 62, 4, 0, { finger: 0 }),
        ],
      },
      {
        index: 1,
        sectionLabel: 'Verse Groove',
        events: [
          slash('r52-1-0', 0, 'q', 'G'),
          slash('r52-1-1', 1, 'q'),
          slash('r52-1-2', 2, 'q', 'D'),
          slash('r52-1-3', 3, 'q'),
        ],
      },
      {
        index: 2,
        events: [
          slash('r52-2-0', 0, 'q', 'Em7'),
          slash('r52-2-1', 1, 'q'),
          slash('r52-2-2', 2, 'q', 'Cadd9'),
          slash('r52-2-3', 3, 'q'),
        ],
      },
      {
        index: 3,
        sectionLabel: 'Turnaround',
        events: [
          ev('r52-3-0', 0, 'q', 67, 3, 0, { finger: 0, chordSymbol: 'G' }),
          ev('r52-3-1', 1, '8', 69, 3, 2, { finger: 2 }),
          ev('r52-3-2', 1.5, '8', 71, 2, 0, { finger: 0 }),
          ev('r52-3-3', 2, 'h', 67, 3, 0, { finger: 0 }),
        ],
      },
    ],
  },

  'r6-2-fifth-position-lead': {
    id: 'r6-2-fifth-position-lead',
    title: 'Fifth-Position Lead',
    subtitle: 'Module R6.2 • Pos. V (Frets 5–8) • Zero Open Strings',
    moduleId: 'R6',
    bpmDefault: 82,
    bpmTarget: 100,
    timeSignature: [4, 4],
    keySignature: 'Am',
    allowPeekFret: true,
    measures: [
      {
        index: 0,
        positionMarker: 'Pos. V',
        events: [
          ev('r62-0-0', 0, 'q', 69, 4, 7, { finger: 3 }), // A4
          ev('r62-0-1', 1, 'q', 72, 3, 5, { finger: 1 }), // C5
          ev('r62-0-2', 2, '8', 74, 3, 7, { finger: 3 }), // D5
          ev('r62-0-3', 2.5, '8', 76, 2, 5, { finger: 1 }), // E5
          ev('r62-0-4', 3, 'q', 79, 2, 8, { finger: 4 }), // G5
        ],
      },
      {
        index: 1,
        events: [
          ev('r62-1-0', 0, 'q.', 81, 1, 5, { finger: 1 }), // A5 (1st ledger line above!)
          ev('r62-1-1', 1.5, '8', 79, 2, 8, { finger: 4 }),
          ev('r62-1-2', 2, 'h', 76, 2, 5, { finger: 1 }),
        ],
      },
      {
        index: 2,
        events: [
          ev('r62-2-0', 0, '8', 74, 3, 7, { finger: 3 }),
          ev('r62-2-1', 0.5, '8', 72, 3, 5, { finger: 1 }),
          ev('r62-2-2', 1, 'q', 69, 4, 7, { finger: 3 }),
          ev('r62-2-3', 2, 'q', 67, 4, 5, { finger: 1 }), // G4
          ev('r62-2-4', 3, 'q', 64, 5, 7, { finger: 3 }), // E4
        ],
      },
      {
        index: 3,
        events: [
          ev('r62-3-0', 0, 'h', 69, 4, 7, { finger: 3 }),
          ev('r62-3-1', 2, 'h', 69, 4, 7, { finger: 3 }),
        ],
      },
    ],
  },

  'r8-1-neon-overdrive': {
    id: 'r8-1-neon-overdrive',
    title: 'Neon Overdrive (Capstone Piece)',
    subtitle: 'Module R8.1 • 80s/90s Rock Lead & Rhythm • Key of E Minor • Pure Sheet Music',
    moduleId: 'R8',
    bpmDefault: 96,
    bpmTarget: 108,
    timeSignature: [4, 4],
    keySignature: 'Em',
    allowPeekFret: false,
    isCapstone: true,
    measures: [
      {
        index: 0,
        sectionLabel: 'A: Main Riff',
        dynamic: 'f',
        events: [
          ev('r81-0-0', 0, 'q', 52, 6, 0, { finger: 0, chordSymbol: 'Em' }),
          ev('r81-0-1', 1, '8', 55, 6, 3, { finger: 3 }),
          ev('r81-0-2', 1.5, '8', 57, 5, 0, { finger: 0 }),
          ev('r81-0-3', 2, 'q', 59, 5, 2, { finger: 2 }),
          ev('r81-0-4', 3, '8', 62, 4, 0, { finger: 0 }),
          ev('r81-0-5', 3.5, '8', 64, 4, 2, { finger: 2 }),
        ],
      },
      {
        index: 1,
        events: [
          ev('r81-1-0', 0, 'q.', 67, 3, 0, { finger: 0, chordSymbol: 'G' }),
          ev('r81-1-1', 1.5, '8', 66, 4, 4, { finger: 4 }), // F#4
          ev('r81-1-2', 2, 'h', 64, 4, 2, { finger: 2, chordSymbol: 'D' }),
        ],
      },
      {
        index: 2,
        sectionLabel: 'B: Chorus Groove',
        events: [
          slash('r81-2-0', 0, 'q', 'Em'),
          slash('r81-2-1', 1, 'q'),
          slash('r81-2-2', 2, 'q', 'C'),
          slash('r81-2-3', 3, 'q'),
        ],
      },
      {
        index: 3,
        events: [
          slash('r81-3-0', 0, 'q', 'G'),
          slash('r81-3-1', 1, 'q'),
          slash('r81-3-2', 2, 'q', 'D'),
          slash('r81-3-3', 3, 'q'),
        ],
      },
      {
        index: 4,
        sectionLabel: 'C: Lead Solo',
        positionMarker: 'Pos. V',
        dynamic: 'f',
        events: [
          ev('r81-4-0', 0, 'q', 76, 2, 5, { finger: 1, chordSymbol: 'Em' }), // E5
          ev('r81-4-1', 1, '8', 79, 2, 8, { finger: 4 }), // G5
          ev('r81-4-2', 1.5, '8', 81, 1, 5, { finger: 1 }), // A5
          ev('r81-4-3', 2, 'q', 83, 1, 7, { finger: 3 }), // B5
          ev('r81-4-4', 3, 'q', 79, 2, 8, { finger: 4 }), // G5
        ],
      },
      {
        index: 5,
        events: [
          ev('r81-5-0', 0, 'q.', 78, 2, 7, { finger: 3, chordSymbol: 'D' }), // F#5
          ev('r81-5-1', 1.5, '8', 76, 2, 5, { finger: 1 }), // E5
          ev('r81-5-2', 2, 'q', 74, 3, 7, { finger: 3 }), // D5
          ev('r81-5-3', 3, 'q', 71, 3, 4, { finger: 1 }), // B4
        ],
      },
      {
        index: 6,
        sectionLabel: 'Outro',
        events: [
          ev('r81-6-0', 0, '8', 64, 4, 2, { finger: 2, chordSymbol: 'C' }),
          ev('r81-6-1', 0.5, '8', 67, 3, 0, { finger: 0 }),
          ev('r81-6-2', 1, 'q', 71, 2, 0, { finger: 0 }),
          ev('r81-6-3', 2, 'q', 66, 4, 4, { finger: 4, chordSymbol: 'D' }),
          ev('r81-6-4', 3, 'q', 62, 4, 0, { finger: 0 }),
        ],
      },
      {
        index: 7,
        events: [
          ev('r81-7-0', 0, 'w', 64, 4, 2, { finger: 2, chordSymbol: 'Em' }),
        ],
      },
    ] as ScoreMeasure[],
  },
};

export const SCORE_LIST: PlayableScore[] = Object.values(PLAYABLE_SCORES);

// Core domain types for ReadMusic (instrument-agnostic, Guitar EADGBE first)

export type TrackId = 'theory' | 'reading' | 'integrated';
export type InputMode = 'mic' | 'touch';
export type PracticeMode = 'wait' | 'tempo';
export type NotationTheme = 'paper' | 'dark';
export type MasteryStatus = 'not_started' | 'in_progress' | 'proficient' | 'mastered';

export type PitchClass =
  | 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E'
  | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B';

export interface ScientificPitch {
  midi: number;          // Sounding MIDI (Low E2 = 40, High E4 = 64)
  writtenMidi: number;   // Staff MIDI (Guitar 8vb = midi + 12)
  name: PitchClass;
  octave: number;
  writtenOctave: number;
  frequencyHz: number;
}

export interface FretPosition {
  stringNumber: number;  // 1 = high E (①), 6 = low E (⑥)
  fret: number;          // 0..22
  finger?: 0 | 1 | 2 | 3 | 4;
}

export interface InstrumentString {
  stringNumber: number;  // 6 down to 1
  openMidi: number;      // Sounding MIDI
  label: string;         // e.g. 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'
  wound: boolean;
}

export interface InstrumentProfile {
  id: string;
  displayName: string;
  tuningName: string;
  clef: 'treble-8vb' | 'treble' | 'bass' | 'grand';
  transpositionSemitones: number;
  strings: InstrumentString[];
  fretCount: number;
}

export type ScaleId =
  | 'major'
  | 'natural_minor'
  | 'minor_pentatonic'
  | 'major_pentatonic'
  | 'blues'
  | 'dorian'
  | 'mixolydian'
  | 'lydian'
  | 'phrygian'
  | 'harmonic_minor';

export interface ScaleDefinition {
  id: ScaleId;
  name: string;
  formula: string;
  semitones: number[];
  degreeLabels: string[];
  mood: string;
  guitarTip: string;
}

export interface IntervalDefinition {
  semitones: number;
  shortName: string;
  name: string;
  rockCue: string;
}

export type NoteDuration = 'w' | 'h' | 'h.' | 'q' | 'q.' | '8' | '16';

export type Articulation =
  | 'slur-start'
  | 'slur-end'
  | 'slide-up'
  | 'slide-down'
  | 'bend-half'
  | 'bend-full'
  | 'palm-mute'
  | 'staccato'
  | 'accent'
  | 'let-ring';

export interface ScorePitch {
  writtenMidi: number;
  accidental?: '#' | 'b' | 'n';
  voice?: 1 | 2;
  hint?: FretPosition;
  tieToNext?: boolean;
  articulations?: Articulation[];
}

export interface ScoreNoteEvent {
  id: string;
  beatOffset: number;
  duration: NoteDuration;
  isRest?: boolean;
  isSlash?: boolean;
  chordSymbol?: string;
  pitches: ScorePitch[];
}

export interface ScoreMeasure {
  index: number;
  sectionLabel?: string;
  positionMarker?: string;
  repeatStart?: boolean;
  repeatEnd?: boolean;
  dynamic?: 'p' | 'mp' | 'mf' | 'f';
  events: ScoreNoteEvent[];
}

export type KeySignatureId = 'C' | 'G' | 'D' | 'A' | 'E' | 'F' | 'Bb' | 'Am' | 'Em' | 'Bm' | 'Dm';

export interface PlayableScore {
  id: string;
  title: string;
  subtitle: string;
  moduleId: string;
  bpmDefault: number;
  bpmTarget: number;
  timeSignature: [number, number];
  keySignature: KeySignatureId;
  allowPeekFret: boolean;
  isCapstone?: boolean;
  measures: ScoreMeasure[];
}

export interface SongBreakdown {
  id: string;
  title: string;
  artist: string;
  decade: '80s' | '90s' | '00s';
  year: number;
  key: string;
  scaleOrMode: string;
  scaleId: ScaleId;
  rootPitchClass: number; // 0 = C, 4 = E, etc.
  progressionRoman: string[];
  progressionChords: string[];
  conceptTags: string[];
  moduleId: string;
  listeningCue: string;
  guitarInsight: string;
  spotifyQuery: string;
  youtubeQuery: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  hint?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  audioPreviewMidis?: number[];
}

export interface CurriculumLesson {
  id: string;
  moduleId: string;
  number: string; // e.g. 'T1.1', 'R1.2'
  title: string;
  durationMin: number;
  summary: string;
  keyTakeaways: string[];
  guitarTip: string;
  relatedScaleId?: ScaleId;
  relatedRootPc?: number;
  scoreId?: string;
  songIds?: string[];
  quiz?: QuizQuestion[];
}

export interface CurriculumModule {
  id: string;
  track: 'theory' | 'reading';
  code: string; // 'T1'..'T8', 'R1'..'R8'
  title: string;
  subtitle: string;
  goal: string;
  isFree: boolean;
  integratedStage: number;
  synergyNote: string;
  lessons: CurriculumLesson[];
  testOutQuiz: QuizQuestion[];
}

export interface LessonProgress {
  lessonId: string;
  status: MasteryStatus;
  bestPitchAccuracy: number;
  bestTimingAccuracy: number;
  bestBpm: number;
  testedOut?: boolean;
  updatedAt: number;
}

export interface PracticeSessionLog {
  id: string;
  scoreId: string;
  title: string;
  mode: PracticeMode;
  bpm: number;
  pitchAccuracy: number;
  timingAccuracy: number;
  durationSec: number;
  timestamp: number;
}

export interface DetectedPitch {
  frequencyHz: number;
  midi: number;
  cents: number;
  clarity: number;
  rms: number;
  isOnset: boolean;
  timestampMs: number;
}

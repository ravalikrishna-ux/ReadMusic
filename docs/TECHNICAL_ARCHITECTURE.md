# ReadMusic — Technical Architecture & Engineering Plan

> **Stack**: React Native (Expo SDK 52+) + TypeScript (Strict Mode)
> **Targets**: Native iOS (Swift/Metal/AVAudioEngine), Native Android (Kotlin/Oboe), Web Preview (WebAudio API + SVG)
> **Storage**: Offline-first on-device (`expo-sqlite` + `react-native-mmkv`), zero mandatory backend or user accounts.
> **Monetization**: Apple StoreKit 2 + Google Play Billing (via `react-native-purchases` / `expo-iap` with local receipt validation & offline entitlement cache).

---

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        UI & Presentation Layer                          │
│  Expo Router (Tabs + Modal Stack) • Portrait Studio + Landscape Stand   │
│  ┌──────────────┐ ┌──────────────────┐ ┌──────────────┐ ┌────────────┐  │
│  │ Course Tree  │ │ Sheet Music View │ │ Interactive  │ │ Song Card  │  │
│  │ & Studio Hub │ │ (SVG / Skia)     │ │ Fretboard    │ │ & Analysis │  │
│  └──────┬───────┘ └────────┬─────────┘ └──────┬───────┘ └──────┬─────┘  │
└─────────┼──────────────────┼──────────────────┼────────────────┼────────┘
          ▼                  ▼                  ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Core Music Engine (Pure TypeScript)                  │
│  • InstrumentProfile (Guitar EADGBE; extensible to Bass/Piano)          │
│  • MusicTheoryEngine (Intervals, Scales, Modes, CAGED, Key Signatures)  │
│  • NotationLayoutEngine (Measures, Beams, Ledger Lines, Stem Voices)    │
│  • SightReadingGenerator (Seeded procedural 4/8/16-bar score builder)   │
│  • EvaluationEngine (Wait Mode matcher + Tempo Mode pitch/timing grade) │
└─────────┬──────────────────────────────────────────────┬────────────────┘
          ▼                                              ▼
┌───────────────────────────────┐      ┌──────────────────────────────────┐
│  Audio & Pitch Detection Hub  │      │   Offline Persistence & IAP      │
│  • Native Pitch DSP Module    │      │   • SQLite: Progress, Mastery,   │
│    (YIN / MPM via Expo Module │      │     BPM History, Drill Metrics   │
│     in Swift/C++ & Kotlin/C++)│      │   • MMKV: Preferences, Mic Calib,│
│  • Web Fallback: AudioWorklet │      │     Entitlement Cache            │
│  • Plucked Guitar Synth &     │      │   • Static Bundled Curriculum    │
│    Sample-Accurate Metronome  │      │     JSON/TS Packs (100% Offline) │
└───────────────────────────────┘      └──────────────────────────────────┘
```

---

## 2. Instrument-Agnostic Domain Model

Designed so Guitar (`standard-eadgbe`) ships first, and future $4.99 packs (`bass-eadg`, `piano-88`, `ukulele-gcea`) plug straight into the same curriculum, notation, and evaluation engines.

```ts
// Core pitch & fretboard primitives
export type PitchClass = 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B';

export interface ScientificPitch {
  midi: number;              // Sounding MIDI note (e.g., Low E2 = 40, High E4 = 64)
  writtenMidi: number;       // Written MIDI on staff (Guitar 8vb = midi + 12)
  name: PitchClass;
  octave: number;
  frequencyHz: number;
}

export interface FretPosition {
  stringIndex: number;       // 1 = high E (①), 6 = low E (⑥)
  fret: number;              // 0 = open, 1..22
  finger?: 0 | 1 | 2 | 3 | 4;
}

export interface InstrumentProfile {
  id: 'guitar-standard-eadgbe' | string;
  displayName: string;
  clef: 'treble-8vb' | 'treble' | 'bass' | 'grand';
  transpositionSemitones: number; // +12 for guitar treble-8vb
  strings: Array<{
    stringNumber: number;    // 6 down to 1
    openMidi: number;        // [40, 45, 50, 55, 59, 64]
    label: string;
  }>;
  fretCount: number;         // 15–22
}
```

### Notation & Score Schema
Compact, human-authorable, deterministic JSON/TypeScript score representation that powers both curated etudes/capstone songs AND the Procedural Sight-Reading Generator:

```ts
export type NoteDuration = 'w' | 'h' | 'h.' | 'q' | 'q.' | '8' | '8.' | '16' | '8t';
export type Articulation = 'slur-start' | 'slur-end' | 'slide-up' | 'slide-down' | 'bend-half' | 'bend-full' | 'palm-mute' | 'staccato' | 'accent' | 'let-ring';

export interface ScoreNoteEvent {
  id: string;
  beatOffset: number;          // In quarter-note beats from measure start
  duration: NoteDuration;
  isRest?: boolean;
  isSlash?: boolean;           // Rhythm/slash notation mode
  chordSymbol?: string;        // e.g. "Em7", "Dsus4", "A7"
  pitches: Array<{
    writtenMidi: number;       // Staff position
    accidental?: '#' | 'b' | 'n';
    voice: 1 | 2;              // 1 = stems up (melody), 2 = stems down (bass)
    hint?: FretPosition;       // Used for Peek Fret & circled string markings
    tieToNext?: boolean;
    articulations?: Articulation[];
  }>;
}

export interface ScoreMeasure {
  index: number;
  timeSignature?: [number, number]; // e.g. [4, 4], [3, 4], [6, 8]
  keySignature?: string;            // e.g. 'C', 'G', 'D', 'A', 'F', 'Dm'
  positionMarker?: string;          // e.g. 'Pos. V'
  repeatStart?: boolean;
  repeatEnd?: boolean;
  volta?: 1 | 2;
  navigation?: 'D.S. al Coda' | 'To Coda' | 'Coda' | 'Fine';
  events: ScoreNoteEvent[];
}

export interface PlayableScore {
  id: string;
  title: string;
  subtitle?: string;
  bpmDefault: number;
  bpmTarget: number;
  timeSignature: [number, number];
  keySignature: string;
  allowPeekFret: boolean;
  measures: ScoreMeasure[];
}
```

---

## 3. Real-Time Guitar Pitch Detection & Audio Engine

Reliable guitar pitch detection is a make-or-break feature for a paid $4.99 app. Guitar audio is uniquely tricky due to **strong 2nd/3rd harmonics** (octave errors on low E/A strings), **sharp pick transients**, and **decaying tails**.

### 3.1 DSP Algorithm Pipeline (YIN / McLeod Pitch Method)
1. **Capture**: 44.1 kHz / 48 kHz mono PCM, `2048`-sample ring buffer (~46ms window) with `512`-sample hop (~11.6ms update rate) — fast enough for 16th notes at 120 BPM while long enough to resolve low `E2` (82.41 Hz, period = 535 samples @ 44.1 kHz).
2. **Pre-Processing**:
   - Band-pass filter `70 Hz – 1400 Hz` (removes HVAC rumble & pick-scrape hiss).
   - Adaptive **RMS Noise Gate** calibrated during setup + **Onset Detector** (spectral flux / energy delta) to distinguish a freshly plucked note from the ringing tail of the previous note (critical for repeated same-pitch notes like `E4 – E4 – E4`!).
3. **Fundamental Estimation**:
   - **McLeod Pitch Method (MPM)** / **YIN** normalized difference function with parabolic interpolation for sub-cent precision.
   - **Octave Error Suppression**: Penalize octave jumps lacking harmonic energy at `f0` and bias slightly toward expected guitar register (`E2–E5`).
4. **Confidence & Median Smoothing**:
   - Require clarity/confidence `≥ 0.82` across 2 consecutive frames (~23ms) before emitting a `DetectedNoteEvent`.
5. **Implementation Path**:
   - **Native iOS / Android**: Custom **Expo Module** (`modules/guitar-pitch-detector`) wrapping a shared **C++17 YIN/MPM core** fed by `AVAudioEngine` (iOS) and `Oboe` / `AudioRecord` (Android). Zero JS bridge serialization per audio sample—only lightweight `{ midi, cents, clarity, isOnset, timestampMs }` events cross to JS!
   - **Web Prototype / Preview**: Browser `AudioContext` + `AudioWorkletNode` / `AnalyserNode` running the exact same TypeScript YIN/MPM algorithm so the web prototype works live with a laptop mic too!

### 3.2 Synthesis & Metronome Playback
- **Plucked Guitar Playback**: Lightweight Karplus-Strong physical modeling or bundled compact multi-sampled clean acoustic/electric wavetables (<4 MB total for all notes, 100% offline).
- **Sample-Accurate Metronome**: Scheduled lookahead clock (`AudioContext` clock on web; native audio callback scheduler on iOS/Android) so visual playhead and audio click never drift even on long 64-bar capstone songs.

---

## 4. Music Notation Engraving & Interactive Fretboard Rendering

### 4.1 Sheet Music Renderer
- **Engraved-Paper SVG / Skia Renderer**:
  - Uses crisp vector glyphs (SMuFL-compatible paths for Treble Clef, Sharp/Flat/Natural, Rests, Slurs, Ties, Beamed stems, Dotted notes, Slash noteheads, Circled string numerals `①–⑥`, and Ledger Lines).
  - **Reflow-Aware**: Automatically lays out 2 measures/system in Portrait and 4 measures/system in Landscape Music Stand Mode.
  - **Live Performance Overlays**:
    - Smooth playhead cursor synchronized to audio clock (Tempo Mode) or locked to active event (Wait Mode).
    - Per-note color state (`neutral ink` → `active amber` → `hit emerald` / `miss coral`).
    - Tap-to-select **A-B Measure Loop** brackets directly on measure headers.

### 4.2 Interactive Fretboard Component
- Scales cleanly for both **Theory exploration** (showing scale degree pills `1`, `b3`, `4`, `5`, `b7`, root diamonds, CAGED color tints) and **Reading Touch Mode** (tapping exact string + fret to play notes without a guitar).
- Supports **Left-Handed Mirror Mode** in Settings (single boolean prop flips nut/fret horizontal direction).

---

## 5. Evaluation Engine (Wait Mode vs. Tempo Mode)

| Mode | Evaluation Logic | Feedback |
|---|---|---|
| **Wait Mode** | Checks `detectedMidi === targetSoundingMidi` (within ±35 cents). For repeated notes, requires a fresh onset OR brief silence/fret release. | Pauses cursor; displays pitch delta arrow (`↑ 2 frets` / `↓ 1 fret`) + optional `Peek Fret`. |
| **Tempo Mode** | Matches detected onsets inside a configurable timing window (`±160ms` in R1–R2, tightening to `±110ms` in R6–R8) around each beat timestamp. | Live note coloring + post-run breakdown: **Pitch Accuracy %**, **Timing Accuracy %**, **Average Timing Bias** (*"Slightly rushing by 28ms"*), and **Weakest Notes** list. |
| **Polyphonic / Chord Check** | In v1: verifies bass + top melody notes or strums via touch/chromagram spectral bin matching (comparing FFT energy at target chord pitch classes vs. non-chord bins) for reliable strum verification on phone mics! | Green chord flash on beat hits; detailed rhythm accuracy report. |

---

## 6. Offline Storage & Data Schema (SQLite + MMKV)

Zero cloud servers required. All progress stays fast and private on-device:

- **SQLite Tables (`readmusic.db`)**:
  - `lesson_progress(lesson_id PRIMARY KEY, status, best_pitch_acc, best_timing_acc, best_bpm, tested_out, updated_at)`
  - `practice_sessions(id, started_at, duration_sec, mode, score_id, bpm, pitch_acc, timing_acc)`
  - `note_accuracy_stats(written_midi, string_index, attempts, hits, avg_response_ms)` *(powers smart Practice Review & Sight-Reading comfort metrics)*
  - `capstone_runs(score_id, bpm, pitch_acc, timing_acc, completed_at)`
- **MMKV Keys (Instant Synchronous Reads)**:
  - `user.selectedTrack`: `'theory' | 'reading' | 'integrated'`
  - `user.inputMode`: `'mic' | 'touch'`
  - `user.leftHanded`: `boolean`
  - `user.notationTheme`: `'paper' | 'dark'`
  - `entitlement.guitarFullUnlocked`: `boolean` *(verified via StoreKit 2 / Google Play Billing)*

---

## 7. Target Repository Structure

```text
ReadMusic/
├── docs/
│   ├── PRODUCT_SPEC.md              # Product vision, flows, monetization, UX
│   ├── CURRICULUM_TREE.md           # Full T1–T8, R1–R8, & Integrated course trees
│   └── TECHNICAL_ARCHITECTURE.md    # Mobile stack, DSP pitch engine, schemas
├── src/
│   ├── core/
│   │   ├── music/                   # Pitch math, intervals, scales, modes, CAGED
│   │   ├── notation/                # Score schema, measure layout, SightReadingGenerator
│   │   ├── audio/                   # YIN/MPM pitch detector + Karplus-Strong synth + Metronome
│   │   └── evaluation/              # Wait Mode & Tempo Mode scoring engine
│   ├── data/
│   │   ├── instruments.ts           # Guitar EADGBE profile (+ future instrument types)
│   │   ├── curriculum/              # Complete T1–T8, R1–R8, & Integrated definitions
│   │   ├── songs/                   # 80s/90s/00s analytical song breakdowns
│   │   └── scores/                  # Playable etudes & full Capstone sheet music pieces
│   ├── components/
│   │   ├── StaffNotation.tsx        # Engraved-paper SVG notation renderer + playhead + A-B loop
│   │   ├── InteractiveFretboard.tsx # Multi-mode touch fretboard + scale/triad/hint overlay
│   │   ├── PracticePlayer.tsx       # Wait/Tempo/Procedural player + Landscape Music Stand
│   │   └── SongBreakdownCard.tsx    # 80s/90s/00s analysis card + streaming deep links
│   ├── screens/                     # Onboarding, Studio Home, Course Tree, Lesson, Sight-Read Lab, Reference
│   └── store/                       # Offline progress, entitlement, settings state
└── app/                             # Expo Router entrypoints (iOS, Android, Web)
```

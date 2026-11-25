# ReadMusic — Guitar Music Theory & Sight-Reading Studio

> **Native iOS & Android (React Native / Expo + TypeScript) • Standard Guitar Tuning (`E A D G B E`)**
> Built for self-taught guitarists who already play and want genuine musical literacy — zero cartoon gamification, zero subscriptions, 100% offline-first.

## Documentation & Blueprints
- [Product Spec & User Journeys](docs/PRODUCT_SPEC.md)
- [Full Course Trees (T1–T8, R1–R8 & Integrated Path)](docs/CURRICULUM_TREE.md)
- [Technical Architecture & Pitch DSP Plan](docs/TECHNICAL_ARCHITECTURE.md)

## Implemented Features
- **3-Path Curriculum**: Choose **Music Theory (`T1–T8`)**, **Reading Standard Notation (`R1–R8`)**, or the **16-Stage Integrated Path** — with an optional 2-minute Diagnostic Calibration and Module `Test-Out` quizzes.
- **Engraved-Paper SVG Standard Notation (`src/components/StaffNotation.tsx`)**: Treble clef (`8vb`) with ledger lines (`E3`–`E6`), key signatures, time signatures, beamed/flagged rhythms, slash-chord charts, live playhead, A–B measure loop selection, and **strictly no TAB** (optional authentic `Peek Fret` circled-string hints in Practice Mode; locked OFF in Capstones).
- **Dual-Input Practice Player (`src/components/PracticePlayer.tsx`)**:
  - **Wait Mode** (pauses until target pitch is played) & **Tempo Mode** (adjustable BPM + metronome + A–B measure looping + audio preview)
  - **Live Guitar Microphone Pitch Detection** powered by a pure TypeScript **YIN fundamental frequency estimator** (`src/core/audio/yinPitchDetector.ts`) + **Interactive On-Screen Fretboard** (`src/components/InteractiveFretboard.tsx`) with warm plucked-guitar synthesis and Left-Handed mirror support.
  - **Music Stand Mode** toggle expanding notation to 4 measures per system.
- **Procedural Sight-Reading Generator (`src/core/notation/sightReadingGenerator.ts`)**: Generates fresh unseen 4- or 8-bar sight-reading passages constrained by neck position (`Open ①–③`, `Full Open`, `Pos. II`, `Pos. V`, `Pos. VII`), key signature, and rhythm tier.
- **21 Iconic 80s / 90s / 00s Rock & Pop Analytical Song Breakdowns (`src/data/songs.ts`)** with Roman-numeral chord strips, listening cues, scale audio previews, and Spotify/YouTube deep-links.
- **Built-in Standard Guitar Chromatic Tuner** (`src/components/GuitarTunerModal.tsx`) + **$4.99 One-Time Full Unlock Flow** (Module 1 of both tracks free).

## Quick Start

```bash
npm install
npm run typecheck   # TypeScript strict verification
npm test            # Vitest unit tests (pitch math, staff steps, YIN DSP, procedural generator)
npm run web         # Launch interactive Web preview
npm run ios         # Run on iOS Simulator / Expo Go
npm run android     # Run on Android Emulator / Expo Go
```

# ReadMusic — Product Specification & User Journey Blueprint

> **Working Title**: ReadMusic (Guitar Edition — Standard Tuning `E A D G B E`)
> **Target Platforms**: Native iOS & Android (React Native / Expo + TypeScript, with Web preview)
> **Pricing Model**: Free download (Module 1 of both tracks unlocked) → **$4.99 one-time purchase** for the complete Guitar curriculum. Future instruments (Bass, Piano, Ukulele) sold as modular $4.99 packs.
> **Architecture**: Offline-first, zero mandatory login, native real-time guitar microphone pitch detection + interactive on-screen fretboard/quiz mode.

---

## 1. Product Vision & Positioning

### 1.1 The Gap in the Market
Millions of guitarists learned to play via YouTube tutorials, chord charts, and guitar TAB. They can already fret barre chords, strum songs in time, and play pentatonic boxes—yet they hit a hard ceiling:
- They memorize shapes without knowing **why** a progression works or **what notes** they are playing.
- They cannot read **standard music notation**, locking them out of lead sheets, session charts, piano/vocal books, classical/fingerstyle scores, and communicating fluently with other musicians.
- Existing music apps either talk down to them with cartoonish gamification (hearts, streaks, XP mascots designed for absolute beginners) or charge $15–$25/month subscriptions for video libraries with shallow practice tools.

### 1.2 Core Value Proposition ($4.99 One-Time)
**ReadMusic** is an editorial-grade, self-paced conservatory and practice studio built specifically for **self-taught guitarists** who want real musical literacy without fluff or subscription fatigue.

Users choose their own path:
1. **Music Theory Track** — Learn intervals, fretboard geography, major/minor/pentatonic/blues scales, CAGED triads, 7th chords, modes, rhythm, and ear training—anchored in **analytical breakdowns of iconic 80s, 90s, and 00s rock & pop songs** plus playable "in-the-style-of" riffs and etudes.
2. **Reading Music Track** — Master standard treble-clef guitar notation (8vb, standard tuning) from open-string single notes all the way through neck positions (`Pos. I`, `II`, `V`, `VII`, `IX/XII`), syncopated rhythms, slash-chord rhythm charts, rock/pop articulations, polyphonic chord-melody, and **full multi-section songs played purely from sheet music**.
3. **Integrated Track (Both)** — An interleaved curriculum where Theory concepts unlock immediately before their Reading Music counterparts (e.g., studying Key Signatures in Theory right before sight-reading in G Major and D Major).

### 1.3 Anti-Gamification Philosophy
This app respects the adult self-taught musician:
- **No lives/hearts, no guilt-inducing streaks, no XP loot boxes, no cartoon mascots.**
- Progress is measured in **Musician Metrics**:
  - **Module Mastery** (`Not Started` → `In Progress` → `Proficient ≥80%` → `Mastered ≥95% at Target BPM`)
  - **Sight-Reading Comfort Range** (e.g., *"Fluent in Open & 5th Position up to 105 BPM, Keys of C, G, D, Am, Em"*)
  - **Fretboard Recall Speed** (median response time per string/position)
  - **Practice Log** (quiet session history: minutes practiced, BPM improvements, completed pieces)

---

## 2. Target Persona

**"Alex" — The Capable Self-Taught Guitarist**
- **Experience**: 1–10+ years playing acoustic or electric guitar. Knows open chords, power chords, barre chords, and Position 1 minor pentatonic. Uses Ultimate Guitar / Songsterr TAB.
- **Frustrations**:
  - *"I know how to play the solo from TAB, but I couldn't tell you why those notes fit over the chords."*
  - *"I can play fast, so beginner apps that force me to spend 3 weeks strumming whole notes on open E drive me crazy—unless it's actually teaching me how to read the staff."*
  - *"I practice at home with my guitar on a stand, AND I want to drill note reading or theory on the couch/train without my guitar."*
- **Willingness to Pay**: Strongly prefers a transparent **$4.99 one-time unlock** after testing Module 1 with their real guitar over another $12.99/month subscription.

---

## 3. Aesthetic, Visual Direction & Screen Ergonomics

### 3.1 Clean Editorial / Studio Aesthetic
- **Chrome & Navigation**: Minimalist dark studio palette (matte charcoal `#111317`, elevated slate `#1A1D24`, muted hairline dividers `#2A2F3A`, warm brass/amber accent `#D9A441` for active cursor/highlights, emerald `#3FB978` for accurate pitch/mastery, coral `#E05A5A` for pitch/timing miss).
- **Sheet Music Canvas ("Engraved Paper")**: High-contrast warm ivory parchment (`#F9F6EE`) with crisp ink-black SMuFL music engraving (`#161618`) and subtle staff measure numbers—reducing eye strain and faithfully preparing the eye for real printed sheet music and PDFs. (Optional dark-sheet toggle in Settings for dimly lit stages/rooms.)
- **Typography**: Editorial serif (`Newsreader` / `Georgia`) for lesson titles and song analysis headers; crisp geometric sans (`Inter` / system UI) for controls; tabular monospace (`JetBrains Mono`) for BPM, Hz tuner readout, chord formulas, and fret/interval labels.

### 3.2 Portrait vs. Landscape ("Music Stand Mode")
| Context | Orientation | Layout & Ergonomics |
|---|---|---|
| **Course Map, Theory Lessons, Song Breakdowns, Quizzes, Ear Training** | **Portrait** (default) | Clean single-column reading & interactive fretboard docked at bottom half for one-handed thumb use. |
| **Sight-Reading Drills, Multi-Measure Etudes, Full Sheet Music Songs** | **Landscape "Music Stand Mode"** (auto-prompted / one-tap lock) | Maximizes horizontal width so **4+ full measures per system** render cleanly at readable engraving size. Compact floating transport bar at top (BPM, Wait/Tempo toggle, A-B Loop, Mic Input meter, Peek Fret toggle). Designed to rest on a desk, knee, or music stand hands-free. |

---

## 4. Dual-Input Practice Engine & Modes

Every exercise seamlessly supports **two input methods**, switchable at any time via a top-bar pill (`Mic: Guitar` | `Touch: Fretboard`):

### 4.1 Input Mode A: Live Guitar Microphone (Hands-Free)
- Uses low-latency native DSP pitch detection (YIN / McLeod Pitch Method) listening directly to acoustic guitar or amplified electric guitar (or USB/Lightning audio interface).
- Includes a **built-in chromatic tuner & calibration check** on first mic launch (`E2 A2 D3 G3 B3 E4` standard tuning verification + ambient noise floor calibration).
- **Hands-Free Flow**: Count-in click (`1 - 2 - 3 - 4`), auto-advancing cursor, instant visual feedback on note heads (green = on pitch & in time, amber = slightly rushed/dragged or sharp/flat, red = wrong pitch), and automatic loop restart without touching the screen.

### 4.2 Input Mode B: Interactive On-Screen Fretboard & Theory Controls (Guitar-Free)
- Full 12-to-15 fret zoomable interactive guitar neck rendered with realistic fret markers, open-string nut buttons, and synthesized acoustic/clean-electric plucked guitar audio.
- Supports:
  - **Sight-Reading Touch Mode**: Tap the exact string + fret matching the highlighted staff note (respecting active position rules, e.g., Pos. V).
  - **Scale / Triad / Chord Builder**: Tap fretboard degrees to construct scales, inversions, or chord voicings.
  - **Rhythm Tap Pad**: Tap rhythms accurately against the metronome when away from the guitar.
  - **Ear Training / Song Analysis Cards**: Audio playback + multiple-choice or fretboard-response prompts.

### 4.3 Three Practice Player Modes (Reading & Play-Along Exercises)
1. **Wait Mode** *(Learning & Decoding)*:
   - Playhead locks on the current note/chord and waits indefinitely until the guitarist plays the correct pitch.
   - Displays subtle real-time pitch indicator ("Playing F#3 — target is G3, 1 fret higher").
   - Ideal for first pass through a new neck position, key signature, or full song.
2. **Tempo Mode** *(Fluency & Real-Time Performance)*:
   - Live metronome + optional backing track / count-in.
   - **Adjustable Tempo Slider**: `40%` to `120%` of target BPM (e.g., practice a 100 BPM piece at 60 BPM first).
   - **A-B Measure Loop**: Tap any start measure and end measure to isolate difficult 2–4 bar passages on repeat (with optional "Auto-Increment +5 BPM after 2 clean loops").
   - Evaluates both **Pitch Accuracy** and **Rhythmic Timing Window** (strictness scales gently from early modules to capstone).
3. **Procedural Sight-Reading Generator** *(True Reading Without Memorization)*:
   - Available inside every Reading Music module and as a dedicated top-level **Sight-Read Lab**.
   - Procedurally generates brand-new, musically idiomatic 4-, 8-, or 16-bar sight-reading passages constrained by:
     - **Neck Position** (Open, Pos. II, Pos. V, Pos. VII, Mixed)
     - **Key Signature** (C/Am, G/Em, D/Bm, A/F#m, F/Dm, Bb/Gm)
     - **Rhythm Palette** (Quarter/Half → Eighth notes → Dotted/Ties → 16th syncopation → Triplets)
     - **Texture** (Single-line melody, Rhythm/Slash chart, Two-voice bass+melody)
   - Ensures users build genuine real-time reading reflexes rather than muscle-memorizing static exercises.

---

## 5. TAB Policy & Reading Pedagogy ("The No-Crutch Bridge")

Self-taught guitarists immediately default to reading TAB if TAB is visible alongside a staff. Therefore:
- **Standard Notation Only in Reading Exercises**: TAB is **strictly hidden** on the Reading Music track.
- **Authentic Guitar Editorial Markings**: Like real published guitar sheet music, lessons teach and use:
  - Circled string indicators (`①`–`⑥`)
  - Left-hand finger numbers (`1`–`4`, `0` for open)
  - Roman numeral neck position brackets (`Pos. V`, `Pos. VII`)
- **"Peek Fret" Helper**:
  - In **Practice / Wait Mode** during Modules 1–4, a subtle `Peek Fret` button reveals the target string/fret briefly on a mini neck diagram if the user gets stuck.
  - Using `Peek Fret` is logged gently (no penalty in Practice), **automatically disabled** in **Mastery Benchmarks**, **Test-Out Quizzes**, and **Capstone Full-Song Sight-Reading**.

---

## 6. 80s / 90s / 00s Rock & Pop Song Integration (Licensing-Safe Strategy)

To keep the app sustainably priced at **$4.99 one-time** without per-copy print royalties or label sync fees:
1. **Real-Song Analytical Breakdowns ("In the Wild")**:
   - Every Theory module includes **2–4 curated iconic 80s, 90s, and 00s rock/pop song breakdowns** (e.g., *"Sweet Child O' Mine" — D Mixolydian motif*, *"Smells Like Teen Spirit" — F minor power-chord bIII/bVI movement*, *"Mr. Brightside" — D major arpeggiated chord tones*, *"Creep" — borrowed minor iv & secondary dominant III*).
   - Each card displays: Key, Scale/Mode, Roman-numeral chord progression, Structural listening timestamp cues (e.g., *"Listen at 0:00–0:24 for the bVII chord pull"*), Guitar-specific neck insight, and **one-tap deep-links** to open the official recording in Spotify, Apple Music, or YouTube.
2. **Original "In-the-Style-Of" Playable Etudes & Riffs**:
   - Paired directly beside each real-song breakdown is a **100% original, custom-composed playable riff/etude** engineered in that exact era's sonic DNA (e.g., *"80s Arena Mixolydian Hook"*, *"90s Seattle Grunge Drop-Energy Riff"*, *"00s Indie Arpeggio Drive"*) with full notation, fretboard diagrams, and backing playback.
3. **Full Sheet Music Capstone Pieces**:
   - The Reading Music track culminates in **4 full multi-section original & public-domain arrangements** (Rock/Pop Lead, Acoustic Fingerstyle, Rhythm/Slash Session Chart, and Full Multi-Section Rock Ballad) built to be played start-to-finish strictly from sheet music.

---

## 7. Complete End-to-End User Flows & Journeys

### 7.1 First-Launch & Onboarding Flow (Under 90 Seconds)
No account wall. No credit card prompt. The user lands straight into value.

```
[Launch App]
    │
    ▼
[1. Welcome & Positioning]
    "Built for guitarists who already play — ready to master theory, sight-reading, or both."
    CTA: "Choose Your Path"
    │
    ▼
[2. Track Selection (Always Changeable Later)]
    ┌───────────────────┬───────────────────┬──────────────────────────┐
    │   Music Theory    │   Reading Music   │  Integrated (Recommended)│
    │ Scales, chords,   │ Standard notation │ Interleaved Theory +     │
    │ 80s/90s/00s songs │ → full sheet music│ Reading milestones       │
    └───────────────────┴───────────────────┴──────────────────────────┘
    │
    ▼
[3. Practice Setup]
    "How are you practicing right now?"
    • "With my guitar (enable Mic + quick 6-string tuning check)"
    • "On-screen fretboard for now (switch to Mic anytime)"
    │
    ▼
[4. Optional 2-Minute Skill Calibration]  ──(Skip → Start at Module 1)──┐
    5–7 practical questions tailored to chosen track:                   │
    • Q1: Fretboard note lookup (e.g., "Find C# on the A string")       │
    • Q2: Scale/Chord familiarity (Pentatonic, Major, Triads, Modes)    │
    • Q3: Staff note recognition (Identify 3 treble-clef pitches)       │
    • Q4: Rhythm reading (Tap or match dotted-quarter / eighth groove)  │
    • Q5: Neck position reading (Can you read in 5th position?)         │
    │                                                                   │
    ▼                                                                   ▼
[5. Personalized Course Map] ◄──────────────────────────────────────────┘
    • Shows full course tree with recommended starting node highlighted
    • Familiar early modules marked "Suggested Test-Out" (1-tap 90s quiz to mark Mastered)
    • Module 1 of BOTH tracks clearly badged "Free Trial — Full Access"
    • Primary CTA: "Start Lesson 1.1"
```

### 7.2 Anatomy of a Theory Lesson Flow
1. **Concept Brief (60–90 sec read)**: Concise, guitar-first explanation (no academic jargon walls) with interactive audio/fretboard diagram embedded inline.
2. **Fretboard Mapping ("See It & Hear It")**: Playable interactive neck showing root notes, intervals, and scale/chord shapes across strings—user taps or plays on their guitar to hear interval tension against a drone root.
3. **"In the Wild" (80s / 90s / 00s Song Breakdown)**: 1–2 iconic tracks illustrating the concept in real music, with Roman-numeral strip, listening cues, and Spotify/Apple Music/YouTube deep-link.
4. **Hands-On Application Drill**:
   - Play an original "in-the-style-of" riff (Mic or On-Screen Fretboard), OR
   - Construct the scale/triad/progression on the fretboard, OR
   - Ear-training identification drill (hear interval/chord quality/scale flavor → identify).
5. **Lesson Summary & Mastery Check**: 3–5 concise recall/play prompts. Passing ≥80% marks lesson **Proficient**; ≥95% marks **Mastered**.

### 7.3 Anatomy of a Reading Music Lesson Flow
1. **Notation Focus (30–60 sec)**: Introduces a tight, bite-sized increment (e.g., *"3 new notes on the B string: B4, C5, D5"* or *"Eighth-note off-beat syncopation"*). Shows exact staff placement vs. neck position diagram (no TAB).
2. **Note-Location Warmup (Wait Mode)**: 8–12 single notes or short 2-bar motifs. Cursor waits until the guitarist plays the right pitch on Mic or Touch Fretboard. `Peek Fret` available if stuck.
3. **Musical Etude (Tempo Mode — Music Stand Landscape)**:
   - Prompts rotation to Landscape Music Stand Mode.
   - 8–16 bar original musical piece applying the lesson's exact notes + rhythms.
   - User can preview audio first, dial BPM down to 60%, set A-B loops on tricky bars, then perform at target BPM.
4. **Fresh Sight-Read Check (Procedural 4-Bar Unseen Passage)**:
   - Generates a brand-new 4-bar passage using only the unlocked note/rhythm vocabulary.
   - `Peek Fret` disabled. Evaluates true sight-reading transfer.
5. **Session Recap**: Displays Pitch Accuracy %, Timing Accuracy %, BPM achieved, and weakest notes/rhythms (which auto-feed the optional Daily 5-Minute Review).

### 7.4 The "Test-Out" Flow (Respecting Experienced Self-Taught Players)
Because self-taught players often know chunks of theory or basic notes already:
- Every Module header on an unlocked tier has a **`Test Out`** action.
- Clicking `Test Out` launches a focused **2–3 minute practical assessment** (e.g., 8 fretboard/theory questions + 1 short sight-reading passage at target BPM with `Peek Fret` disabled).
- Scoring **≥85%** immediately marks all lessons in that module as **Mastered (Tested Out)** while keeping every lesson browsable for reference anytime.

### 7.5 Paywall Moment & Conversion Journey ($4.99 One-Time)
- **Zero nagging during Module 1**: Users experience the complete app—live mic pitch detection, interactive fretboard, Music Stand Mode, 80s/90s/00s breakdowns, and Module 1 Mastery Benchmark—without a single paywall modal.
- **Natural Value Gate**: When completing Module 1 (or tapping any Module 2–8 card), a clean, respectful **Full Course Unlock Sheet** appears:
  - Headline: *"Unlock the Complete Guitar Curriculum — $4.99 once. Yours forever."*
  - Clear checklist: All 8 Theory Modules (36 lessons + 40+ 80s/90s/00s breakdowns), All 8 Reading Modules (38 lessons + 4 full sheet music capstone songs), Unlimited Procedural Sight-Reading Generator, 100% Offline Forever, No Subscription.
  - Buttons: `Unlock Everything — $4.99` | `Restore Purchase` | `Keep Practicing Module 1`

### 7.6 Ongoing Practice & Retention Loop (Non-Gamified)
When returning to the app on Day 2+:
- **Home ("Studio Desk")** opens cleanly to:
  1. **Continue Card**: Exact next lesson or in-progress capstone piece (`Resume Module 3.2: Fifth Position Minor Pentatonic` or `Continue Etude: 75% → Target 95 BPM`).
  2. **Quick 5-Min Drills** (optional utility pills): `Fretboard Note Sprint` | `Fresh 8-Bar Sight-Read` | `Interval Ear Check` | `Tuner`.
  3. **Track Switcher**: Seamless toggle between `Integrated`, `Music Theory`, and `Reading Music` views (progress stays 100% unified underneath).

---

## 8. Information Architecture (5-Tab Studio Navigation)

| Tab | Purpose | Key Screens |
|---|---|---|
| **1. Home (Studio)** | Resume active lesson, view Musician Metrics, launch Quick 5-Min Drills or Tuner | Studio Dashboard, Quick Tuner Modal, Practice History |
| **2. Course Tree** | Full interactive map of Integrated / Theory / Reading curricula | Track Switcher, Module Accordion/Tree, Test-Out Modal, Lesson Detail |
| **3. Sight-Read Lab** | Dedicated endless sight-reading & repertoire practice bench | Procedural Sight-Reading Generator, Full Song Repertoire Library, Music Stand Player |
| **4. Reference** | Always-on guitar studio pocket handbook (works offline) | Interactive Fretboard Note/Scale Explorer, Chord/Triad Voicing Finder, 80s/90s/00s Song Index, Notation Glossary |
| **5. Settings** | Instrument setup, audio & display preferences, purchases | Mic Sensitivity & Calibration, Notation Theme (Paper/Dark), Left-Handed Fretboard Flip, Purchase & Restore, Instrument Packs (Guitar / Coming Soon: Bass, Piano) |

---

## 9. Multi-Instrument Expansion Roadmap

While v1 launches exclusively for **Guitar (Standard Tuning `E A D G B E`)**, all core systems are built on an `InstrumentProfile` abstraction:
- **v1.0**: Guitar — Standard Tuning (`$4.99`)
- **v1.5 (Free Update for Guitar Owners)**: Alternate tuning theory notes (Drop D, Eb Standard — common in 90s grunge/metal)
- **v2.0 ($4.99 Pack)**: Bass Guitar (Bass Clef, 4-string `E1 A1 D2 G2`)
- **v2.5 ($4.99 Pack)**: Piano / Keys (Grand Staff — Treble + Bass Clef)

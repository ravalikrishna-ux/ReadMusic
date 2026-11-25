import { CurriculumLesson, CurriculumModule, QuizQuestion } from '../core/music/types';

export interface DiagnosticQuestion {
  id: string;
  area: 'fretboard' | 'theory' | 'reading' | 'rhythm' | 'positions';
  prompt: string;
  options: string[];
  correctIndex: number;
}

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'diag-1',
    area: 'fretboard',
    prompt: 'On the 5th (A) string in standard tuning, which fret produces the note C?',
    options: ['Fret 2', 'Fret 3', 'Fret 5', 'Fret 8'],
    correctIndex: 1,
  },
  {
    id: 'diag-2',
    area: 'theory',
    prompt: 'Which scale degree distinguishes Natural Minor from the Minor Pentatonic scale in riffs like "Seven Nation Army"?',
    options: ['The ♭6 (e.g., C in E Minor)', 'The Major 3rd', 'The ♯4 tritone', 'The Perfect 5th'],
    correctIndex: 0,
  },
  {
    id: 'diag-3',
    area: 'reading',
    prompt: 'In standard guitar treble clef (8vb), where is the open 3rd string (G) written?',
    options: [
      'Bottom line (1st line)',
      'Second line (where the treble clef curls)',
      'Middle line (3rd line)',
      'Two ledger lines below the staff',
    ],
    correctIndex: 1,
  },
  {
    id: 'diag-4',
    area: 'rhythm',
    prompt: 'In 4/4 time, how many beats does a dotted quarter note receive?',
    options: ['1 beat', '1.5 beats', '2 beats', '3 beats'],
    correctIndex: 1,
  },
  {
    id: 'diag-5',
    area: 'positions',
    prompt: 'If a score marks "Pos. V" over written C5 (3rd space), where do you fret it?',
    options: [
      '2nd string, fret 1',
      '3rd string, fret 5',
      '1st string, fret 8',
      '5th string, fret 3',
    ],
    correctIndex: 1,
  },
];

export const CURRICULUM_MODULES: CurriculumModule[] = [
  // =========================================================================
  // TRACK A: MUSIC THEORY FOR GUITARISTS (T1 - T8)
  // =========================================================================
  {
    id: 'T1',
    track: 'theory',
    code: 'T1',
    title: 'Fretboard Geography & The Musical Alphabet',
    subtitle: 'Eliminate fretboard blindness across all 6 strings',
    goal: 'Locate any natural or accidental note up to fret 12 using chromatic rules and guitar octave shapes.',
    isFree: true,
    integratedStage: 1,
    synergyNote: 'Learn where note names live on the neck before reading them on the treble staff.',
    lessons: [
      {
        id: 'T1.1',
        moduleId: 'T1',
        number: 'T1.1',
        title: 'The 12-Note Chromatic Clock',
        durationMin: 6,
        summary:
          'Every fret on the guitar moves up by exactly one half step (semitone). Two pairs of natural notes sit right next to each other with no sharp or flat between them: B–C and E–F.',
        keyTakeaways: [
          '1 fret = half step (semitone); 2 frets = whole step (tone).',
          'Remember "Big Cats Eat Fish": B→C and E→F are 1 fret apart; every other natural pair is 2 frets apart.',
          'Enharmonic notes (like F♯ and G♭) share the exact same fret — context and key signature decide the spelling.',
        ],
        guitarTip: 'Walk up the low E string saying each natural note aloud: Open E → F (1) → G (3) → A (5) → B (7) → C (8) → D (10) → E (12).',
        relatedScaleId: 'major',
        relatedRootPc: 0,
        quiz: [
          {
            id: 't1-1-q1',
            prompt: 'Which two natural note pairs are only 1 fret (a half step) apart?',
            options: ['A–B and C–D', 'B–C and E–F', 'C–D and F–G', 'D–E and G–A'],
            correctIndex: 1,
            explanation: 'B–C and E–F are natural half steps (1 fret apart). Every other adjacent natural letter pair is 2 frets apart.',
          },
          {
            id: 't1-1-q2',
            prompt: 'Starting on B (fret 7 of the low E string), what note is 1 fret higher at fret 8?',
            options: ['B♯ / D♭', 'C', 'C♯', 'A♯'],
            correctIndex: 1,
            explanation: 'Because B→C is a natural half step, fret 8 on the low E string is C.',
          },
        ],
      },
      {
        id: 'T1.2',
        moduleId: 'T1',
        number: 'T1.2',
        title: 'Owning the Low E & A Strings',
        durationMin: 7,
        summary:
          'Nearly every barre chord, power chord, and movable scale box you already play is anchored to a root on the 6th (E) or 5th (A) string. Memorizing frets 3, 5, 7, 9, and 12 unlocks instant chord navigation.',
        keyTakeaways: [
          '6th string inlay anchors: G (3), A (5), B (7), C♯/D♭ (9), E (12).',
          '5th string inlay anchors: C (3), D (5), E (7), F♯/G♭ (9), A (12).',
          'Once you know 6th string notes, you automatically know the 1st (high E) string too — identical fret names two octaves higher!',
        ],
        guitarTip: 'When a chart says "B5 → G5 → D5 → A5", spot frets 7→3 on string ⑥ and frets 5→0 on string ⑤ without hesitation.',
        relatedScaleId: 'major',
        relatedRootPc: 4,
        quiz: [
          {
            id: 't1-2-q1',
            prompt: 'Which fret on the 5th (A) string gives you the note E?',
            options: ['Fret 5', 'Fret 7', 'Fret 9', 'Fret 10'],
            correctIndex: 1,
            explanation: 'Open A (0) → B (2) → C (3) → D (5) → E (7).',
          },
        ],
      },
      {
        id: 'T1.3',
        moduleId: 'T1',
        number: 'T1.3',
        title: 'Octave Shapes & The B-String Warp',
        durationMin: 8,
        summary:
          'You do not need to rote-memorize all 72 frets. Use guitar octave shapes from the E and A strings to find any note on strings ①–④ in under a second — accounting for the +1 fret G-to-B tuning shift.',
        keyTakeaways: [
          'From string ⑥ or ⑤: skip one string and move UP 2 frets to hit the octave on string ④ or ③.',
          'From string ④ or ③: because G→B is tuned a major 3rd (not a 4th), skip one string and move UP 3 frets to hit the octave on string ② or ①.',
          'Classic 90s alt-rock octave leads (like "Cherub Rock") slide this exact two-finger shape horizontally.',
        ],
        guitarTip: 'Mute the skipped string in the middle with the underside of your index finger so you can strum octave shapes aggressively.',
        songIds: ['cherub-rock'],
        relatedScaleId: 'major',
        relatedRootPc: 4,
      },
      {
        id: 'T1.4',
        moduleId: 'T1',
        number: 'T1.4',
        title: 'Standard Tuning Physics & 8vb Clef',
        durationMin: 5,
        summary:
          'Standard tuning (E2–A2–D3–G3–B3–E4) stacks Perfect 4ths between adjacent strings except for the Major 3rd between G and B — a clever ergonomic compromise that makes 6-string chords playable.',
        keyTakeaways: [
          'Low E2 vibrates at 82.41 Hz; high open E4 vibrates at 329.63 Hz (two octaves up).',
          'Because guitar sits right across the boundary of Bass and Treble clefs, all guitar notation uses Treble Clef (8vb) sounding 1 octave lower than written.',
        ],
        guitarTip: 'Verify your 5th-fret tuning check: fret 5 on ⑥=A, ⑤=D, ④=G, fret 4 on ③=B, fret 5 on ②=E.',
        songIds: ['cherub-rock'],
      },
    ],
    testOutQuiz: [
      {
        id: 't1-to-1',
        prompt: 'What note is at fret 7 on the 5th (A) string?',
        options: ['D', 'E', 'F', 'F♯'],
        correctIndex: 1,
        explanation: 'Fret 7 on the A string is E.',
      },
      {
        id: 't1-to-2',
        prompt: 'To find the octave of a note on the 4th (D) string on the 2nd (B) string, how many frets up do you shift?',
        options: ['2 frets up', '3 frets up', '4 frets up', 'Same fret'],
        correctIndex: 1,
        explanation: 'Crossing the G–B major-third tuning boundary shifts octave shapes 1 extra fret higher (+3 frets total).',
      },
      {
        id: 't1-to-3',
        prompt: 'Which pair of adjacent strings in standard tuning is tuned a Major 3rd apart instead of a Perfect 4th?',
        options: ['E and A', 'D and G', 'G and B', 'B and High E'],
        correctIndex: 2,
        explanation: 'G3 to B3 is 4 semitones (Major 3rd); all other adjacent pairs are 5 semitones (Perfect 4th).',
      },
    ],
  },

  {
    id: 'T2',
    track: 'theory',
    code: 'T2',
    title: 'Intervals — The DNA of Riffs, Chords & Melodies',
    subtitle: 'See and hear every interval as fretboard geometry',
    goal: 'Recognize and build every interval (m2 to P8) on the neck and by ear.',
    isFree: false,
    integratedStage: 4,
    synergyNote: 'Hear and visualize the exact intervals you have begun reading on the staff.',
    lessons: [
      {
        id: 'T2.1',
        moduleId: 'T2',
        number: 'T2.1',
        title: 'Perfect 5ths & Power Chords',
        durationMin: 7,
        summary: 'Why root + 5th (7 semitones) stays crystal clear under heavy overdrive, and how power-chord roots drive 90s grunge.',
        keyTakeaways: [
          'A Perfect 5th sits 1 string higher and 2 frets up (on strings ⑥→⑤, ⑤→④, ④→③).',
          'Omitting the 3rd keeps distortion free of muddy intermodulation harmonics.',
        ],
        guitarTip: 'Flip a power chord upside down (play the 5th in the bass on the same fret) for a heavier 4th-interval "Smoke on the Water" crunch.',
        songIds: ['smells-like-teen-spirit'],
        relatedScaleId: 'natural_minor',
        relatedRootPc: 5,
      },
      {
        id: 'T2.2',
        moduleId: 'T2',
        number: 'T2.2',
        title: 'Major vs. Minor 3rds & Twin-Guitar Harmony',
        durationMin: 8,
        summary: 'One single fret separates bright Major (4 semitones) from dark Minor (3 semitones).',
        keyTakeaways: [
          'Major 3rd = 4 frets on one string, or 1 string up & 1 fret back.',
          'Minor 3rd = 3 frets on one string, or 1 string up & 2 frets back.',
        ],
        guitarTip: 'Try playing a melody on the G string while harmonizing diatonic 3rds on the B string like 80s twin-lead rock.',
        songIds: ['the-trooper'],
        relatedScaleId: 'natural_minor',
        relatedRootPc: 4,
      },
      {
        id: 'T2.3',
        moduleId: 'T2',
        number: 'T2.3',
        title: '2nds, 4ths, Tritones & The Add9 Stretch',
        durationMin: 8,
        summary: 'Unlock shimmering 80s clean arpeggios (Root–5th–9th) and gritty ♭5 rock tension.',
        keyTakeaways: [
          'The 9th is just the Major 2nd one octave higher — stacking Root–5th–9th creates Andy Summers\' signature Police shimmer.',
          'The ♭5 tritone (6 frets) splits the octave in half and creates instant rock/blues urgency.',
        ],
        guitarTip: 'Keep your thumb centered behind the neck to relax your hand during 4-fret add9 stretches.',
        songIds: ['every-breath-you-take'],
        relatedScaleId: 'major',
        relatedRootPc: 8,
      },
    ],
    testOutQuiz: [
      {
        id: 't2-to-1',
        prompt: 'How many semitones (frets) is a Perfect 5th?',
        options: ['5 semitones', '6 semitones', '7 semitones', '8 semitones'],
        correctIndex: 2,
        explanation: 'A Perfect 5th is 7 semitones (e.g., E to B).',
      },
      {
        id: 't2-to-2',
        prompt: 'What interval sits directly above the 5th in Andy Summers\' "Every Breath You Take" arpeggio shape?',
        options: ['Minor 6th', 'Major 9th (2nd up an octave)', 'Tritone', 'Minor 3rd'],
        correctIndex: 1,
        explanation: 'Stacking Root – 5th – 9th gives the signature shimmering add9 voicings.',
      },
    ],
  },

  {
    id: 'T3',
    track: 'theory',
    code: 'T3',
    title: 'The Major Scale & Key Signatures',
    subtitle: 'Master the W-W-H-W-W-W-H ruler & Circle of Fifths',
    goal: 'Construct major scales in any key, decode key signatures instantly, and connect boxes horizontally.',
    isFree: false,
    integratedStage: 5,
    synergyNote: 'Master the Circle of Fifths right before reading sharp & flat key signatures in R4.',
    lessons: [
      {
        id: 'T3.1',
        moduleId: 'T3',
        number: 'T3.1',
        title: 'The Major Scale Formula & Scale Degrees',
        durationMin: 8,
        summary: 'Every scale, chord, and mode is measured against the Major Scale: Whole – Whole – Half – Whole – Whole – Whole – Half.',
        keyTakeaways: [
          'Half steps fall between degrees 3–4 and 7–1 (creating the magnetic pull of the leading tone 7→1).',
          'Thinking in numbers (1–7) lets you play any melody in any key immediately.',
        ],
        guitarTip: 'Play a 1-string Major scale along the G string to literally see the W-W-H-W-W-W-H spacing before memorizing vertical boxes.',
        songIds: ['dont-stop-believin', 'all-the-small-things'],
        relatedScaleId: 'major',
        relatedRootPc: 4,
      },
      {
        id: 'T3.2',
        moduleId: 'T3',
        number: 'T3.2',
        title: 'Key Signatures & The Circle of Fifths',
        durationMin: 9,
        summary: 'Stop guessing sharps and flats. Moving clockwise by 5ths adds one sharp each step (C=0, G=1♯, D=2♯, A=3♯, E=4♯).',
        keyTakeaways: [
          'Order of sharps: F♯ – C♯ – G♯ – D♯ – A♯ – E♯ – B♯.',
          'Quick trick for sharp keys: go 1 half-step UP from the last sharp to name the Major key (e.g., last sharp C♯ → D Major).',
          'Quick trick for flat keys: the second-to-last flat IS the Major key (and 1 flat is always F Major).',
        ],
        guitarTip: 'Guitar loves sharp keys (G, D, A, E) because open strings match their tonic, 4th, and 5th chords.',
        songIds: ['mr-brightside'],
        relatedScaleId: 'major',
        relatedRootPc: 2,
      },
    ],
    testOutQuiz: [
      {
        id: 't3-to-1',
        prompt: 'Which Major key has 2 sharps (F♯ and C♯)?',
        options: ['G Major', 'D Major', 'A Major', 'E Major'],
        correctIndex: 1,
        explanation: 'A half step above the last sharp (C♯) is D Major.',
      },
      {
        id: 't3-to-2',
        prompt: 'Between which scale degrees do the two half steps occur in every Major scale?',
        options: ['2–3 and 5–6', '3–4 and 7–1', '1–2 and 4–5', '4–5 and 6–7'],
        correctIndex: 1,
        explanation: 'W-W-H-W-W-W-H places half steps at 3–4 and 7–1.',
      },
    ],
  },

  {
    id: 'T4',
    track: 'theory',
    code: 'T4',
    title: 'Natural Minor, Pentatonic & Blues Scales',
    subtitle: 'Connect all 5 boxes and decode 80s/90s/00s rock soloing',
    goal: 'Unify relative Major/Minor, escape Pentatonic Box 1, and target chord tones expressively.',
    isFree: false,
    integratedStage: 8,
    synergyNote: 'Connect the relative minor keys from R4 straight to iconic rock riffs and solos.',
    lessons: [
      {
        id: 'T4.1',
        moduleId: 'T4',
        number: 'T4.1',
        title: 'Relative Major & Natural Minor (Aeolian)',
        durationMin: 8,
        summary: 'Natural Minor starts on the 6th degree of its relative Major — identical notes, totally different tonal gravity (1 2 ♭3 4 5 ♭6 ♭7).',
        keyTakeaways: [
          'C Major ↔ A Minor (0 sharps); G Major ↔ E Minor (1♯); D Major ↔ B Minor (2♯).',
          'Adding the ♭6 to minor pentatonic gives riffs like "Seven Nation Army" their unmistakable dramatic tension.',
        ],
        guitarTip: 'Find any key\'s relative minor instantly on guitar: drop 3 frets down the same string from the Major root!',
        songIds: ['seven-nation-army'],
        relatedScaleId: 'natural_minor',
        relatedRootPc: 4,
      },
      {
        id: 'T4.2',
        moduleId: 'T4',
        number: 'T4.2',
        title: 'Minor & Major Pentatonic — Breaking Out of Box 1',
        durationMin: 9,
        summary: 'Minor Pentatonic (1 ♭3 4 5 ♭7) and Major Pentatonic (1 2 3 5 6) share the exact same 5 neck shapes — only the root anchor shifts.',
        keyTakeaways: [
          'AC/DC\'s "Back in Black" turns open E Minor Pentatonic into razor-sharp rhythmic phrasing.',
          'Oasis ("Don\'t Look Back in Anger") & John Mayer ("Slow Dancing") unlock warm vocal phrasing by targeting Major Pentatonic roots.',
        ],
        guitarTip: 'Practice sliding horizontally along the G and B strings between Box 1 and Box 2 to break vertical box habits.',
        songIds: ['back-in-black', 'dont-look-back-in-anger', 'slow-dancing-burning-room'],
        relatedScaleId: 'minor_pentatonic',
        relatedRootPc: 4,
      },
    ],
    testOutQuiz: [
      {
        id: 't4-to-1',
        prompt: 'What is the relative minor of G Major (and how many frets below G is it)?',
        options: ['D Minor (5 frets below)', 'E Minor (3 frets below)', 'A Minor (2 frets above)', 'B Minor (4 frets above)'],
        correctIndex: 1,
        explanation: 'E Minor is 3 semitones (3 frets) below G Major and shares its 1♯ (F♯) key signature.',
      },
    ],
  },

  {
    id: 'T5',
    track: 'theory',
    code: 'T5',
    title: 'Triads, Inversions & The CAGED System',
    subtitle: 'Play chord progressions and lead lines anywhere on the neck',
    goal: 'Voice-lead Major/Minor triads across top string sets and map CAGED chord landmarks.',
    isFree: false,
    integratedStage: 11,
    synergyNote: 'CAGED upper-neck shapes become your sight-reading anchors for 5th & 7th position in R6.',
    lessons: [
      {
        id: 'T5.1',
        moduleId: 'T5',
        number: 'T5.1',
        title: 'Upper-Neck Triads & Inversions',
        durationMin: 9,
        summary: 'Three-note chords (1–3–5) in Root, 1st, and 2nd inversions let rhythm guitarists stay in one tight 4-fret zone and cut cleanly through a band mix.',
        keyTakeaways: [
          'Root position has 1 in the bass; 1st inversion puts the 3rd on bottom; 2nd inversion puts the 5th on bottom.',
          'Johnny Marr ("This Charming Man") and John Frusciante ("Under the Bridge") build iconic guitar parts from compact top-string triads.',
        ],
        guitarTip: 'Take I–V–vi–IV in G (G–D–Em–C) and voice-lead all four chords strictly on strings ①–②–③ between frets 7 and 10.',
        songIds: ['under-the-bridge', 'this-charming-man'],
        relatedScaleId: 'major',
        relatedRootPc: 4,
      },
    ],
    testOutQuiz: [
      {
        id: 't5-to-1',
        prompt: 'Which chord tone is the lowest sounding note in a 1st-inversion triad?',
        options: ['The Root (1)', 'The 3rd (3 or ♭3)', 'The 5th (5)', 'The 7th'],
        correctIndex: 1,
        explanation: '1st inversion places the 3rd in the bass (e.g., C/E).',
      },
    ],
  },

  {
    id: 'T6',
    track: 'theory',
    code: 'T6',
    title: 'Diatonic Harmony & 80s/90s/00s Progressions',
    subtitle: 'Roman numerals, 7th chords & borrowed emotional chords',
    goal: 'Harmonize keys, read Nashville Numbers, and decode borrowed chords like Creep\'s minor iv.',
    isFree: false,
    integratedStage: 13,
    synergyNote: 'Recognizing stacked harmony makes reading polyphonic scores in R7 dramatically faster.',
    lessons: [
      {
        id: 'T6.1',
        moduleId: 'T6',
        number: 'T6.1',
        title: 'Harmonizing Major & Minor + Borrowed Chords',
        durationMin: 10,
        summary: 'Major keys yield I – ii – iii – IV – V – vi – vii°; Natural Minor yields i – ii° – ♭III – iv – v – ♭VI – ♭VII. Borrowing the minor iv or major III creates unforgettable 90s/00s emotional shifts.',
        keyTakeaways: [
          'Journey ("Don\'t Stop Believin\'") uses I–V–vi–IV; Linkin Park ("Numb") rotates the exact same wheel to i–♭VI–♭III–♭VII.',
          'Radiohead\'s "Creep" (G – B – C – Cm) uses secondary dominant III and borrowed minor iv for chromatic inner-voice motion.',
          'Incubus ("Drive") elevates minor rock with lush Em9 and Cmaj7 voicings.',
        ],
        guitarTip: 'Whenever you learn a new song, write its chords as Roman numerals so you immediately recognize the pattern in future songs.',
        songIds: ['creep', 'drive-incubus', 'numb-linkin-park'],
        relatedScaleId: 'natural_minor',
        relatedRootPc: 4,
      },
    ],
    testOutQuiz: [
      {
        id: 't6-to-1',
        prompt: 'In the key of G Major, what Roman numeral function is the Cm chord in Radiohead\'s "Creep"?',
        options: ['Diatonic IV', 'Borrowed minor iv (modal interchange)', 'Diatonic vi', 'Dominant V7'],
        correctIndex: 1,
        explanation: 'In G Major, C is diatonic IV; turning it into C minor borrows iv from parallel G Minor.',
      },
    ],
  },

  {
    id: 'T7',
    track: 'theory',
    code: 'T7',
    title: 'Rhythm, Meter & Groove Architecture',
    subtitle: '16th-note grids, anticipated syncopation & 6/8–12/8 shuffles',
    goal: 'Internalize straight, syncopated, and compound rock/pop grooves with pendulum strumming.',
    isFree: false,
    integratedStage: 9,
    synergyNote: 'Internalize 16th & 6/8 groove feel right before reading rhythm/slash charts in R5.',
    lessons: [
      {
        id: 'T7.1',
        moduleId: 'T7',
        number: 'T7.1',
        title: 'Syncopation, 16th Grids & 12/8 Compound Time',
        durationMin: 8,
        summary: 'Great guitar tone is 50% right-hand pocket. Understand how 16th-note subdivisions and 6/8–12/8 compound shuffles define 80s/90s/00s grooves.',
        keyTakeaways: [
          'Keep your strumming hand moving on every 8th or 16th subdivision even over rests — it is your physical metronome.',
          'Tears for Fears ("Everybody Wants to Rule the World") grooves on a rolling 12/8 triplet shuffle.',
        ],
        guitarTip: 'Accenting the "& of 4" (anticipating beat 1 of the next bar) immediately turns stiff strumming into authentic rock propulsion.',
        songIds: ['everybody-wants-rule-world'],
      },
    ],
    testOutQuiz: [
      {
        id: 't7-to-1',
        prompt: 'How many eighth-note subdivisions are grouped into each main beat in compound 6/8 or 12/8 meter?',
        options: ['2 eighth notes per beat', '3 eighth notes per beat', '4 eighth notes per beat', '5 eighth notes per beat'],
        correctIndex: 1,
        explanation: 'Compound meters (6/8, 9/8, 12/8) group eighth notes in threes per main beat.',
      },
    ],
  },

  {
    id: 'T8',
    track: 'theory',
    code: 'T8',
    title: 'Modes & Improvisational Synthesis',
    subtitle: 'Parallel modal colors: Mixolydian, Dorian, Lydian & Phrygian',
    goal: 'Hear and apply Mixolydian and Dorian colors immediately over 80s/90s/00s progressions.',
    isFree: false,
    integratedStage: 15,
    synergyNote: 'Synthesize full harmonic fluency before your final Capstone Sight-Reading pieces in R8.',
    lessons: [
      {
        id: 'T8.1',
        moduleId: 'T8',
        number: 'T8.1',
        title: 'Mixolydian (♭7) & Dorian (♮6) — The Rock Modes',
        durationMin: 10,
        summary: 'Forget confusing parent-scale math. Hear modes in parallel against a single root: Mixolydian is Major with a ♭7; Dorian is Natural Minor with a bright natural 6th.',
        keyTakeaways: [
          'Mixolydian (1 2 3 4 5 6 ♭7): drives "Sweet Child O\' Mine" (D–C–G) and Coldplay\'s "Clocks" (Eb–Bbm–Fm).',
          'Dorian (1 2 ♭3 4 5 6 ♭7): powers minor songs with a MAJOR IV chord like "Wicked Game" (Bm–A–E) and "Boulevard of Broken Dreams" (Fm–Ab–Eb–Bb).',
        ],
        guitarTip: 'Play an open E drone and switch back and forth between G♯ (Mixolydian/Major) and C♯ (Dorian natural 6) to feel the modal shift physically.',
        songIds: ['sweet-child-o-mine', 'clocks-coldplay', 'wicked-game', 'boulevard-broken-dreams'],
        relatedScaleId: 'mixolydian',
        relatedRootPc: 2,
      },
    ],
    testOutQuiz: [
      {
        id: 't8-to-1',
        prompt: 'Which single note transforms Natural Minor (Aeolian) into Dorian mode?',
        options: ['Lowering the 2nd (♭2)', 'Raising the 6th to a natural 6th (♮6)', 'Raising the 3rd to a Major 3rd', 'Lowering the 5th (♭5)'],
        correctIndex: 1,
        explanation: 'Dorian has a natural 6th (creating the characteristic bright major IV chord in a minor key).',
      },
    ],
  },

  // =========================================================================
  // TRACK B: READING STANDARD NOTATION FOR GUITAR (R1 - R8)
  // =========================================================================
  {
    id: 'R1',
    track: 'reading',
    code: 'R1',
    title: 'Treble Staff & Open-Position Treble Strings (①–③)',
    subtitle: 'Read strings 1–3 cleanly without TAB — whole, half & quarter notes',
    goal: 'Sight-read G4 through G5 in Open Position with zero TAB at 80+ BPM.',
    isFree: true,
    integratedStage: 2,
    synergyNote: 'Connect the fretboard note names from T1 directly to treble staff lines and spaces.',
    lessons: [
      {
        id: 'R1.1',
        moduleId: 'R1',
        number: 'R1.1',
        title: 'How Guitar Notation Works (Treble Clef 8vb)',
        durationMin: 6,
        summary: 'Standard guitar sheet music lives on the 5-line Treble Staff (lines E–G–B–D–F, spaces F–A–C–E). TAB is hidden here on purpose — authentic string circles (①–⑥) and optional Peek Fret hints guide you cleanly.',
        keyTakeaways: [
          'Open string ③ = G4 (2nd line, where the treble clef curls).',
          'Open string ② = B4 (middle / 3rd line).',
          'Open string ① = E5 (top / 4th space).',
        ],
        guitarTip: 'Anchor your eyes on those three open-string landmarks first (G4 line 2, B4 line 3, E5 space 4) rather than reciting mnemonics from the bottom line every time.',
        quiz: [
          {
            id: 'r1-1-q1',
            prompt: 'Which open guitar string sits on the top (4th) space of the treble staff?',
            options: ['3rd string (G)', '2nd string (B)', '1st string (High E)', '4th string (D)'],
            correctIndex: 2,
            explanation: 'Written E5 (4th space) is the open 1st string (high E).',
          },
        ],
      },
      {
        id: 'R1.2',
        moduleId: 'R1',
        number: 'R1.2',
        title: 'First String (①): E5 – F5 – G5',
        durationMin: 8,
        summary: 'Master your first three staff notes on the high E string: Open E5 (4th space), Fret 1 F5 (top line), Fret 3 G5 (space above staff) in Wait Mode and Tempo Mode.',
        keyTakeaways: [
          'E5 = open ①, F5 = 1st finger fret 1, G5 = 3rd finger fret 3.',
          'Read contour direction (step up, step down, repeat) instead of spelling every letter individually.',
        ],
        guitarTip: 'Keep your index finger hovering over fret 1 and ring finger over fret 3 so your eyes never need to look down at the fretboard.',
        scoreId: 'r1-2-high-e-horizon',
      },
      {
        id: 'R1.3',
        moduleId: 'R1',
        number: 'R1.3',
        title: 'Second String (②): B4 – C5 – D5',
        durationMin: 9,
        summary: 'Add middle-line B4 (open ②), 3rd-space C5 (fret 1), and 4th-line D5 (fret 3) to cross cleanly between strings ① and ②.',
        keyTakeaways: [
          'B4 = open ②, C5 = fret 1, D5 = fret 3.',
          'Notice D5 (4th line) steps straight up to open E5 (4th space) — smooth string crossing!',
        ],
        guitarTip: 'Practice in Wait Mode first with Peek Fret if needed, then switch to Tempo Mode at 74 BPM.',
        scoreId: 'r1-3-two-string-ballad',
      },
      {
        id: 'R1.4',
        moduleId: 'R1',
        number: 'R1.4',
        title: 'Third String (③): G4 – A4 & 3/4 Waltz Time',
        durationMin: 9,
        summary: 'Complete the treble strings with 2nd-line G4 (open ③) and 2nd-space A4 (fret 2), introducing 3/4 time and dotted half notes (3 beats).',
        keyTakeaways: [
          'G4 = open ③, A4 = 2nd finger fret 2.',
          'A dot after any note adds half of its original value (half note 2 + 1 = 3 beats).',
        ],
        guitarTip: 'Count "ONE – two – three" softly while rotating to Music Stand Mode for full 4-measure width.',
        scoreId: 'r1-4-acoustic-waltz',
      },
    ],
    testOutQuiz: [
      {
        id: 'r1-to-1',
        prompt: 'Which fret on string ② plays written C5 (3rd space of the treble staff)?',
        options: ['Open', 'Fret 1', 'Fret 2', 'Fret 3'],
        correctIndex: 1,
        explanation: 'Open B4 (0) → C5 (fret 1) → D5 (fret 3).',
      },
      {
        id: 'r1-to-2',
        prompt: 'Where is written G5 (1st string, fret 3) placed on the treble staff?',
        options: ['2nd line', 'Top line (5th line)', 'Space sitting directly on top of the 5th line', '1st ledger line above'],
        correctIndex: 2,
        explanation: 'Top line is F5, so G5 rests in the space directly above the top line.',
      },
    ],
  },

  {
    id: 'R2',
    track: 'reading',
    code: 'R2',
    title: 'Bass Strings, Ledger Lines & Full Open Position',
    subtitle: 'Conquer low guitar ledger lines across strings ④, ⑤ & ⑥',
    goal: 'Read all 6 open-position strings (E3 through G5) fluently without counting ledger lines.',
    isFree: false,
    integratedStage: 3,
    synergyNote: 'Complete all 6 strings in Open Position right before digging into intervals in T2.',
    lessons: [
      {
        id: 'R2.1',
        moduleId: 'R2',
        number: 'R2.1',
        title: 'Low Ledger Landmarks: D4, Middle C4, A3 & Low E3',
        durationMin: 10,
        summary: 'Memorize three visual bass anchors so you never count ledger lines one-by-one: 1st line below = C4 (⑤ f3), 2nd line below = A3 (open ⑤), space under 3rd line = E3 (open ⑥).',
        keyTakeaways: [
          'String ④: D4 (space under staff), E4 (bottom line, f2), F4 (1st space, f3).',
          'String ⑤: A3 (2nd ledger line below, open), B3 (f2), C4 (1st ledger line below, f3).',
          'String ⑥: E3 (under 3rd ledger line, open), F3 (3rd ledger line, f1), G3 (f3).',
        ],
        guitarTip: 'Play the Open-Position Folk Rock etude in Wait Mode first to lock those three bass landmarks into eye-hand memory.',
        scoreId: 'r2-4-open-folk-rock',
      },
    ],
    testOutQuiz: [
      {
        id: 'r2-to-1',
        prompt: 'Which open guitar string is written on the 2nd ledger line below the treble staff?',
        options: ['6th string (E)', '5th string (A)', '4th string (D)', '3rd string (G)'],
        correctIndex: 1,
        explanation: '1st ledger line below = C4; 2nd ledger line below = A3 (open 5th string).',
      },
    ],
  },

  {
    id: 'R3',
    track: 'reading',
    code: 'R3',
    title: 'Rhythmic Literacy — Eighth Notes, Dotted Rhythms & Syncopation',
    subtitle: 'Read rock & pop phrasing accurately instead of guessing by ear',
    goal: 'Sight-read beamed eighth notes, dotted-quarter grooves, and off-beat ties cleanly.',
    isFree: false,
    integratedStage: 6,
    synergyNote: 'Pair steady down-up alternate picking with beamed 8th and dotted-quarter notation.',
    lessons: [
      {
        id: 'R3.1',
        moduleId: 'R3',
        number: 'R3.1',
        title: 'Beamed Eighths & Dotted-Quarter Syncopation',
        durationMin: 10,
        summary: 'Eighth notes split every beat in two ("1 & 2 &"). Dotted-quarter + eighth ("1 – 2 &") is the single most common vocal and guitar phrasing rhythm in 80s/90s/00s rock.',
        keyTakeaways: [
          'Downpick on numbered beats (1, 2, 3, 4); uppick on the "&" off-beats.',
          'Feel beat 2 silently inside a dotted quarter note so your "& of 2" lands right in the pocket.',
        ],
        guitarTip: 'Loop measures 1–2 at 70% BPM in Tempo Mode until the dotted-quarter bounce feels automatic.',
        scoreId: 'r3-2-90s-anthem-hook',
      },
    ],
    testOutQuiz: [
      {
        id: 'r3-to-1',
        prompt: 'If a dotted quarter note starts on beat 1 of 4/4, on which subdivision does the following eighth note land?',
        options: ['Beat 2', 'The "&" of beat 2', 'Beat 3', 'The "&" of beat 1'],
        correctIndex: 1,
        explanation: 'Beat 1 + half of beat 2 = 1.5 beats, placing the eighth note squarely on the "& of 2".',
      },
    ],
  },

  {
    id: 'R4',
    track: 'reading',
    code: 'R4',
    title: 'Accidentals & Key Signatures on the Staff',
    subtitle: 'Sight-read fluently in G, D, A, Em, Bm & F/Dm',
    goal: 'Automatically apply key-signature sharps/flats and in-bar accidentals while sight-reading.',
    isFree: false,
    integratedStage: 7,
    synergyNote: 'Applies your T3 Circle of Fifths knowledge straight into live G/D/A/F sight-reading.',
    lessons: [
      {
        id: 'R4.1',
        moduleId: 'R4',
        number: 'R4.1',
        title: 'Reading in G Major / E Minor (1♯: F♯)',
        durationMin: 9,
        summary: 'When a sharp sits on the top F line right after the clef, EVERY F in every octave becomes F♯ automatically (string ① fret 2, string ④ fret 4, string ⑥ fret 2).',
        keyTakeaways: [
          'Before starting any piece, scan the key signature and touch the altered frets once on your neck.',
          'In-bar accidentals (♯, ♭, ♮) last until the next bar line.',
        ],
        guitarTip: 'Notice how bright and resonant G Major feels on guitar — open G, B, D, and E all sit natively in the key.',
        scoreId: 'r4-2-britpop-in-g',
      },
    ],
    testOutQuiz: [
      {
        id: 'r4-to-1',
        prompt: 'In the key of G Major (1♯), which fret on the 1st string plays the F line note?',
        options: ['Fret 1 (F natural)', 'Fret 2 (F♯)', 'Fret 3 (G)', 'Open'],
        correctIndex: 1,
        explanation: 'The 1♯ key signature raises every F to F♯ (1st string, fret 2).',
      },
    ],
  },

  {
    id: 'R5',
    track: 'reading',
    code: 'R5',
    title: 'Rhythm Charts, Chord Symbols & Slash Notation',
    subtitle: 'Read real gig, session & band charts seamlessly',
    goal: 'Switch fluidly between notated lead riffs, slash-chord rhythm bars, and chart roadmaps.',
    isFree: false,
    integratedStage: 10,
    synergyNote: 'Combines T7 rhythm subdivisions with real-world band & studio slash charts.',
    lessons: [
      {
        id: 'R5.1',
        moduleId: 'R5',
        number: 'R5.1',
        title: 'Hybrid Riff + Slash-Chord Session Charts',
        durationMin: 10,
        summary: 'Working guitarists rarely see every strum written out note-for-note. Real band charts combine single-line intro/turnaround hooks with chord-symbol slash measures.',
        keyTakeaways: [
          'Four diagonal slashes mean "keep time / comp rhythmically on the named chord for 4 beats."',
          'Watch measure headers for section labels ("Intro Riff", "Verse Groove") so you pivot cleanly on beat 1.',
        ],
        guitarTip: 'Keep your picking hand moving cleanly through the transition from bar 1\'s riff straight into bar 2\'s G major downstrum.',
        scoreId: 'r5-2-studio-band-chart',
      },
    ],
    testOutQuiz: [
      {
        id: 'r5-to-1',
        prompt: 'What do diagonal slash marks inside a measure with a chord symbol above mean on a guitar chart?',
        options: [
          'Rest silently for the measure',
          'Comp / strum the indicated chord rhythmically in time',
          'Slide up 12 frets',
          'Play harmonics only',
        ],
        correctIndex: 1,
        explanation: 'Slash notation directs the guitarist to comp/strum the specified chord across those beats.',
      },
    ],
  },

  {
    id: 'R6',
    track: 'reading',
    code: 'R6',
    title: 'Reading Up the Neck — Positions II, V, VII & Upper Ledger Lines',
    subtitle: 'Solve guitar\'s multi-position reading challenge once and for all',
    goal: 'Sight-read comfortably in Fifth and Seventh Positions up to high ledger lines (A5–E6).',
    isFree: false,
    integratedStage: 12,
    synergyNote: 'Uses your T5 CAGED shapes to make Fifth & Seventh position reading feel effortless.',
    lessons: [
      {
        id: 'R6.1',
        moduleId: 'R6',
        number: 'R6.1',
        title: 'Fifth Position Mastery (Pos. V, Frets 5–8)',
        durationMin: 11,
        summary: 'Fifth Position (index finger on fret 5) is the most versatile sight-reading zone on the guitar — covering A Minor / C Major smoothly with zero open strings and consistent 1-finger-per-fret economy.',
        keyTakeaways: [
          'Pos. V anchors: ⑤ f7 = E4, ④ f7 = A4, ③ f5 = C5, ② f5 = E5, ① f5 = A5 (1st ledger line above staff!).',
          'Watch for Roman numeral position brackets ("Pos. V") above the first measure of a shift.',
        ],
        guitarTip: 'Keep finger 1 strictly assigned to fret 5, finger 2 to fret 6, finger 3 to fret 7, and pinky (4) to fret 8.',
        scoreId: 'r6-2-fifth-position-lead',
      },
    ],
    testOutQuiz: [
      {
        id: 'r6-to-1',
        prompt: 'In Fifth Position (Pos. V), which string and fret plays written A5 (1st ledger line above the treble staff)?',
        options: ['1st string, fret 5', '2nd string, fret 8', '3rd string, fret 7', '1st string, fret 8'],
        correctIndex: 0,
        explanation: 'Fret 5 on the 1st (high E) string sounds A4, written A5 on the first ledger line above the treble staff.',
      },
    ],
  },

  {
    id: 'R7',
    track: 'reading',
    code: 'R7',
    title: 'Articulations, Dynamics & Polyphonic Guitar Notation',
    subtitle: 'Read bends, slurs, stacked triads & two-voice fingerstyle',
    goal: 'Interpret expressive rock/acoustic notation and independent bass+melody stems.',
    isFree: false,
    integratedStage: 14,
    synergyNote: 'Applies T6 harmony directly to reading stacked chord-melody and two-voice scores.',
    lessons: [
      {
        id: 'R7.1',
        moduleId: 'R7',
        number: 'R7.1',
        title: 'Articulations, Stacked Intervals & Two-Voice Stems',
        durationMin: 10,
        summary: 'Learn how hammer-ons/pull-offs appear as curved slurs, bends as directional arrows, and fingerstyle bass + melody lines split into stems-down (thumb) and stems-up (fingers).',
        keyTakeaways: [
          'Curved line between SAME pitch = Tie (hold duration); curved line between DIFFERENT pitches = Slur (hammer-on / pull-off).',
          'Read stacked chords bottom-up by visual interval shape (line-line-line = close root-position triad!).',
        ],
        guitarTip: 'In two-voice pieces, isolate the stems-down bass line by itself first before layering the stems-up melody.',
      },
    ],
    testOutQuiz: [
      {
        id: 'r7-to-1',
        prompt: 'What does a curved arc connecting two DIFFERENT written pitches indicate for a guitarist?',
        options: ['A tie (hold without re-picking)', 'A slur (hammer-on or pull-off)', 'Staccato mute', 'Repeat measure'],
        correctIndex: 1,
        explanation: 'A curved arc between different pitches is a slur — executed on guitar as a hammer-on or pull-off.',
      },
    ],
  },

  {
    id: 'R8',
    track: 'reading',
    code: 'R8',
    title: 'Full-Song Capstone Repertoire (Pure Sheet Music)',
    subtitle: 'Play complete multi-section songs strictly from standard notation',
    goal: 'Perform multi-section rock, acoustic, session-chart, and fingerstyle pieces in Music Stand Mode with Peek Fret OFF.',
    isFree: false,
    integratedStage: 16,
    synergyNote: 'The graduation milestone uniting every reading and theory skill across the entire app.',
    lessons: [
      {
        id: 'R8.1',
        moduleId: 'R8',
        number: 'R8.1',
        title: 'Capstone Piece #1: "Neon Overdrive" (E Minor Rock)',
        durationMin: 15,
        summary: 'A complete multi-section 80s/90s rock arrangement combining an open-position low-string riff, slash-chord chorus groove, and a Fifth-Position lead solo — played 100% from standard sheet music.',
        keyTakeaways: [
          'Key of E Minor (1♯: F♯). Watch the position jump from Open Position into Pos. V at Section C ("Lead Solo").',
          'Peek Fret is disabled on Capstone pieces — use Wait Mode and A–B Measure Looping to polish tricky bars before your Tempo Mode run.',
        ],
        guitarTip: 'Rotate to Landscape Music Stand Mode, start at 80% BPM, and isolate measures 5–6 with the A–B loop before playing straight through.',
        scoreId: 'r8-1-neon-overdrive',
      },
    ],
    testOutQuiz: [],
  },
];

export function getModulesForTrack(track: 'theory' | 'reading' | 'integrated'): CurriculumModule[] {
  if (track === 'theory') {
    return CURRICULUM_MODULES.filter((m) => m.track === 'theory');
  }
  if (track === 'reading') {
    return CURRICULUM_MODULES.filter((m) => m.track === 'reading');
  }
  return [...CURRICULUM_MODULES].sort((a, b) => a.integratedStage - b.integratedStage);
}

export function findLessonById(lessonId: string): { module: CurriculumModule; lesson: CurriculumLesson } | null {
  for (const mod of CURRICULUM_MODULES) {
    const lesson = mod.lessons.find((l) => l.id === lessonId);
    if (lesson) return { module: mod, lesson };
  }
  return null;
}

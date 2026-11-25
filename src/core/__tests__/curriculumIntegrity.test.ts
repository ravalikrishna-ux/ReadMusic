import { describe, expect, it } from 'vitest';
import {
  DURATION_BEATS,
  getMidiAtFret,
  KEY_SIGNATURES,
  SCALES,
  writtenToSoundingMidi,
} from '../music/guitarEngine';
import { KeySignatureId } from '../music/types';
import {
  generateSightReadingScore,
  PositionPreset,
  RhythmLevel,
} from '../notation/sightReadingGenerator';
import {
  CURRICULUM_MODULES,
  DIAGNOSTIC_QUESTIONS,
  getModulesForTrack,
} from '../../data/curriculum';
import { PLAYABLE_SCORES, SCORE_LIST } from '../../data/scores';
import { SONG_BREAKDOWNS } from '../../data/songs';

describe('Curriculum, Scores & Songs Musical Integrity', () => {
  it('ensures Integrated track contains all 16 stages (1..16) with Theory T1-T8 and Reading R1-R8', () => {
    const integrated = getModulesForTrack('integrated');
    const theory = getModulesForTrack('theory');
    const reading = getModulesForTrack('reading');

    expect(theory).toHaveLength(8);
    expect(reading).toHaveLength(8);
    expect(integrated).toHaveLength(16);
    expect(integrated.map((m) => m.integratedStage)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
    ]);

    // Module 1 of both tracks must be free; Modules 2-8 gated behind $4.99 unlock
    expect(theory[0].isFree).toBe(true);
    expect(reading[0].isFree).toBe(true);
    for (const m of [...theory.slice(1), ...reading.slice(1)]) {
      expect(m.isFree).toBe(false);
    }
  });

  it('verifies every lesson scoreId, songId, scaleId, and quiz answer index is valid', () => {
    const songIds = new Set(SONG_BREAKDOWNS.map((s) => s.id));

    for (const mod of CURRICULUM_MODULES) {
      for (const q of mod.testOutQuiz) {
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.options.length);
      }

      for (const lesson of mod.lessons) {
        if (lesson.scoreId) {
          expect(PLAYABLE_SCORES[lesson.scoreId], `Missing score ${lesson.scoreId}`).toBeDefined();
        }
        if (lesson.songIds) {
          for (const sid of lesson.songIds) {
            expect(songIds.has(sid), `Missing song ${sid}`).toBe(true);
          }
        }
        if (lesson.relatedScaleId) {
          expect(SCALES[lesson.relatedScaleId]).toBeDefined();
        }
        if (lesson.quiz) {
          for (const q of lesson.quiz) {
            expect(q.correctIndex).toBeGreaterThanOrEqual(0);
            expect(q.correctIndex).toBeLessThan(q.options.length);
          }
        }
      }
    }

    for (const dq of DIAGNOSTIC_QUESTIONS) {
      expect(dq.correctIndex).toBeGreaterThanOrEqual(0);
      expect(dq.correctIndex).toBeLessThan(dq.options.length);
    }
  });

  it('audits every handcrafted score: bar beat sums, beatOffsets, and exact fret-to-writtenMidi accuracy', () => {
    for (const score of SCORE_LIST) {
      expect(KEY_SIGNATURES[score.keySignature]).toBeDefined();
      const expectedBarBeats = score.timeSignature[0];

      for (const measure of score.measures) {
        let cumulative = 0;
        for (const ev of measure.events) {
          expect(
            ev.beatOffset,
            `${score.id} m${measure.index + 1} ${ev.id} beatOffset mismatch`
          ).toBeCloseTo(cumulative, 5);
          cumulative += DURATION_BEATS[ev.duration];

          if (!ev.isRest && !ev.isSlash) {
            for (const p of ev.pitches) {
              if (p.hint) {
                const fretMidi = getMidiAtFret(p.hint.stringNumber, p.hint.fret);
                const expectedSounding = writtenToSoundingMidi(p.writtenMidi);
                expect(
                  fretMidi,
                  `${score.id} ${ev.id}: string ${p.hint.stringNumber} fret ${p.hint.fret} gives MIDI ${fretMidi}, expected ${expectedSounding} (written ${p.writtenMidi})`
                ).toBe(expectedSounding);
              }
            }
          }
        }

        expect(
          cumulative,
          `${score.id} m${measure.index + 1} total beats`
        ).toBeCloseTo(expectedBarBeats, 5);
      }
    }
  });

  it('verifies every 80s/90s/00s song breakdown has matching Roman numeral and chord arrays', () => {
    const decades = new Set(SONG_BREAKDOWNS.map((s) => s.decade));
    expect(decades.has('80s')).toBe(true);
    expect(decades.has('90s')).toBe(true);
    expect(decades.has('00s')).toBe(true);

    for (const song of SONG_BREAKDOWNS) {
      expect(song.progressionRoman.length).toBeGreaterThan(0);
      expect(song.progressionChords.length).toBe(song.progressionRoman.length);
      expect(SCALES[song.scaleId]).toBeDefined();
    }
  });

  it('stress-tests Procedural Sight-Reading Generator across all positions, keys, and rhythm tiers', () => {
    const positions: PositionPreset[] = ['open-treble', 'open-full', 'pos-2', 'pos-5', 'pos-7'];
    const keys: KeySignatureId[] = ['C', 'G', 'D', 'A', 'F', 'Am', 'Em', 'Dm'];
    const rhythms: RhythmLevel[] = ['basic', 'eighths', 'syncopated', 'sixteenths'];

    for (const position of positions) {
      for (const keySignature of keys) {
        const rhythmLevel = rhythms[(positions.indexOf(position) + keys.indexOf(keySignature)) % rhythms.length];
        const score = generateSightReadingScore({
          position,
          keySignature,
          rhythmLevel,
          measureCount: 4,
          seed: 777,
        });

        expect(score.measures).toHaveLength(4);
        for (const m of score.measures) {
          const sum = m.events.reduce((acc, ev) => acc + DURATION_BEATS[ev.duration], 0);
          expect(sum).toBeCloseTo(4, 5);
          for (const ev of m.events) {
            if (!ev.isRest && ev.pitches[0]?.hint) {
              const { stringNumber, fret } = ev.pitches[0].hint;
              expect(getMidiAtFret(stringNumber, fret)).toBe(
                writtenToSoundingMidi(ev.pitches[0].writtenMidi)
              );
            }
          }
        }
      }
    }
  });
});

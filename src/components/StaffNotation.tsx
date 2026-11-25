import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Rect, Text as SvgText } from 'react-native-svg';
import {
  formatCircledString,
  KEY_SIGNATURES,
  writtenMidiToStaffStep,
} from '../core/music/guitarEngine';
import { NotationTheme, PlayableScore, ScoreMeasure, ScoreNoteEvent } from '../core/music/types';
import { palette, radius } from '../theme/tokens';

export type EventEvalState = 'idle' | 'active' | 'hit' | 'miss';

interface StaffNotationProps {
  score: PlayableScore;
  theme: NotationTheme;
  activeEventId?: string | null;
  eventStates?: Record<string, EventEvalState>;
  measuresPerSystem?: number;
  showPeekFret?: boolean;
  loopRange?: [number, number] | null;
  onMeasurePress?: (measureIndex: number) => void;
  onNotePress?: (event: ScoreNoteEvent) => void;
}

const LINE_SPACING = 10; // Distance between adjacent staff lines
const HALF_STEP_Y = LINE_SPACING / 2; // 5px per diatonic step
const SYSTEM_HEIGHT = 136;
const TOP_LINE_Y = 48; // F5 (step 8)
const BOTTOM_LINE_Y = TOP_LINE_Y + LINE_SPACING * 4; // E4 (step 0) = 88

function stepToY(step: number): number {
  return BOTTOM_LINE_Y - step * HALF_STEP_Y;
}

// Standard Treble Clef key-signature accidental staff steps
const SHARP_STEPS = [8, 5, 9, 6]; // F5, C5, G5, D5
const FLAT_STEPS = [4, 7, 3]; // B4, E5, A4

export const StaffNotation: React.FC<StaffNotationProps> = ({
  score,
  theme,
  activeEventId,
  eventStates = {},
  measuresPerSystem = 2,
  showPeekFret = false,
  loopRange = null,
  onMeasurePress,
  onNotePress,
}) => {
  const isPaper = theme === 'paper';
  const bg = isPaper ? palette.paperBg : palette.darkSheetBg;
  const ink = isPaper ? palette.paperInk : palette.darkSheetInk;
  const mutedInk = isPaper ? palette.paperInkMuted : palette.textSecondary;
  const staffLineColor = isPaper ? palette.paperStaffLine : palette.darkSheetStaffLine;

  const keyInfo = KEY_SIGNATURES[score.keySignature];
  const systems: ScoreMeasure[][] = [];
  for (let i = 0; i < score.measures.length; i += measuresPerSystem) {
    systems.push(score.measures.slice(i, i + measuresPerSystem));
  }

  const clefWidth = 56 + Math.abs(keyInfo.accidentals) * 11 + 26;
  const measureWidth = measuresPerSystem >= 4 ? 195 : 235;
  const svgWidth = clefWidth + measuresPerSystem * measureWidth + 18;

  const peekAllowed = showPeekFret && score.allowPeekFret;

  return (
    <View
      style={[
        styles.sheetCard,
        {
          backgroundColor: bg,
          borderColor: isPaper ? palette.paperBorder : palette.borderHairline,
        },
      ]}
    >
      {/* Engraved sheet header */}
      <View style={styles.sheetHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sheetTitle, { color: ink }]}>{score.title}</Text>
          <Text style={[styles.sheetSubtitle, { color: mutedInk }]}>
            {score.subtitle} • {keyInfo.label} • {score.timeSignature[0]}/{score.timeSignature[1]}
          </Text>
        </View>
        <View style={styles.badgeRow}>
          {score.isCapstone && (
            <View style={[styles.tagPill, { backgroundColor: palette.accentBrassMuted }]}>
              <Text style={[styles.tagText, { color: palette.accentBrass }]}>CAPSTONE</Text>
            </View>
          )}
          <View
            style={[
              styles.tagPill,
              {
                backgroundColor: isPaper ? 'rgba(23,24,27,0.07)' : 'rgba(255,255,255,0.08)',
              },
            ]}
          >
            <Text style={[styles.tagText, { color: mutedInk }]}>TREBLE 8vb • NO TAB</Text>
          </View>
        </View>
      </View>

      {/* Loop bar controls hint */}
      {onMeasurePress && (
        <View style={styles.loopStrip}>
          <Text style={[styles.loopHint, { color: mutedInk }]}>
            {loopRange
              ? `A–B Loop active: Bars ${loopRange[0] + 1}–${loopRange[1] + 1} (tap a bar # to change)`
              : 'Tip: Tap bar numbers below to set an A–B practice loop'}
          </Text>
          <View style={styles.measureChips}>
            {score.measures.map((m) => {
              const inLoop =
                loopRange !== null && m.index >= loopRange[0] && m.index <= loopRange[1];
              return (
                <Pressable
                  key={m.index}
                  onPress={() => onMeasurePress(m.index)}
                  style={[
                    styles.measureChip,
                    {
                      borderColor: inLoop ? palette.accentBrass : palette.borderHairline,
                      backgroundColor: inLoop ? palette.accentBrassMuted : 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.measureChipText,
                      { color: inLoop ? palette.accentBrass : mutedInk },
                    ]}
                  >
                    m.{m.index + 1}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {systems.map((sysMeasures, sysIdx) => (
            <Svg
              key={`sys-${sysIdx}`}
              width={svgWidth}
              height={SYSTEM_HEIGHT}
              viewBox={`0 0 ${svgWidth} ${SYSTEM_HEIGHT}`}
            >
              {/* 5 horizontal staff lines */}
              {[0, 1, 2, 3, 4].map((lineIdx) => {
                const y = TOP_LINE_Y + lineIdx * LINE_SPACING;
                return (
                  <Line
                    key={`line-${lineIdx}`}
                    x1={10}
                    y1={y}
                    x2={svgWidth - 10}
                    y2={y}
                    stroke={staffLineColor}
                    strokeWidth={1}
                  />
                );
              })}

              {/* Opening barline */}
              <Line
                x1={10}
                y1={TOP_LINE_Y}
                x2={10}
                y2={BOTTOM_LINE_Y}
                stroke={ink}
                strokeWidth={1.6}
              />

              {/* Treble Clef glyph + 8vb subscript */}
              <SvgText
                x={16}
                y={BOTTOM_LINE_Y - 1}
                fontSize={44}
                fill={ink}
                fontFamily="Georgia"
              >
                𝄞
              </SvgText>
              <SvgText
                x={27}
                y={BOTTOM_LINE_Y + 13}
                fontSize={9}
                fontWeight="700"
                fill={mutedInk}
                fontFamily="Georgia"
              >
                8
              </SvgText>

              {/* Key Signature */}
              {keyInfo.accidentals > 0 &&
                SHARP_STEPS.slice(0, keyInfo.accidentals).map((step, i) => (
                  <SvgText
                    key={`sharp-${i}`}
                    x={48 + i * 11}
                    y={stepToY(step) + 4}
                    fontSize={14}
                    fontWeight="700"
                    fill={ink}
                  >
                    ♯
                  </SvgText>
                ))}
              {keyInfo.accidentals < 0 &&
                FLAT_STEPS.slice(0, Math.abs(keyInfo.accidentals)).map((step, i) => (
                  <SvgText
                    key={`flat-${i}`}
                    x={48 + i * 11}
                    y={stepToY(step) + 4}
                    fontSize={15}
                    fontWeight="700"
                    fill={ink}
                  >
                    ♭
                  </SvgText>
                ))}

              {/* Time Signature on System 0 */}
              {sysIdx === 0 && (
                <G>
                  <SvgText
                    x={clefWidth - 22}
                    y={TOP_LINE_Y + 17}
                    fontSize={18}
                    fontWeight="700"
                    fill={ink}
                    fontFamily="Georgia"
                  >
                    {score.timeSignature[0]}
                  </SvgText>
                  <SvgText
                    x={clefWidth - 22}
                    y={TOP_LINE_Y + 37}
                    fontSize={18}
                    fontWeight="700"
                    fill={ink}
                    fontFamily="Georgia"
                  >
                    {score.timeSignature[1]}
                  </SvgText>
                </G>
              )}

              {/* Render Measures */}
              {sysMeasures.map((measure, mPos) => {
                const xStart = clefWidth + mPos * measureWidth;
                const xEnd = xStart + measureWidth;
                const beatsInBar = score.timeSignature[0];
                const isLastMeasure = measure.index === score.measures.length - 1;
                const inLoop =
                  loopRange !== null &&
                  measure.index >= loopRange[0] &&
                  measure.index <= loopRange[1];

                return (
                  <G key={`m-${measure.index}`}>
                    {/* Subtle A-B loop highlight */}
                    {inLoop && (
                      <Rect
                        x={xStart + 1}
                        y={TOP_LINE_Y - 12}
                        width={measureWidth - 2}
                        height={LINE_SPACING * 4 + 24}
                        fill="rgba(217, 164, 65, 0.11)"
                        rx={3}
                      />
                    )}

                    {/* Measure number */}
                    <SvgText
                      x={xStart + 4}
                      y={16}
                      fontSize={9}
                      fill={inLoop ? palette.accentBrass : mutedInk}
                      fontWeight={inLoop ? '700' : '500'}
                    >
                      {measure.index + 1}
                    </SvgText>

                    {/* Section label or Position marker */}
                    {(measure.sectionLabel || measure.positionMarker) && (
                      <SvgText
                        x={xStart + 22}
                        y={16}
                        fontSize={10}
                        fontWeight="700"
                        fill={measure.positionMarker ? palette.accentBrass : ink}
                      >
                        {[measure.sectionLabel, measure.positionMarker].filter(Boolean).join(' • ')}
                      </SvgText>
                    )}

                    {/* Dynamic marking */}
                    {measure.dynamic && (
                      <SvgText
                        x={xStart + 10}
                        y={BOTTOM_LINE_Y + 34}
                        fontSize={13}
                        fontStyle="italic"
                        fontWeight="700"
                        fill={ink}
                        fontFamily="Georgia"
                      >
                        {measure.dynamic}
                      </SvgText>
                    )}

                    {/* Events inside measure */}
                    {measure.events.map((ev) => {
                      const usableW = measureWidth - 36;
                      const cx = xStart + 20 + (ev.beatOffset / beatsInBar) * usableW;
                      const isActive = ev.id === activeEventId;
                      const evalState: EventEvalState = isActive
                        ? 'active'
                        : eventStates[ev.id] ?? 'idle';

                      const noteColor =
                        evalState === 'active'
                          ? palette.accentBrass
                          : evalState === 'hit'
                            ? palette.successEmerald
                            : evalState === 'miss'
                              ? palette.errorCoral
                              : ink;

                      // Chord symbol above staff
                      const chordEl = ev.chordSymbol ? (
                        <SvgText
                          x={cx - 8}
                          y={30}
                          fontSize={11}
                          fontWeight="700"
                          fill={ink}
                        >
                          {ev.chordSymbol}
                        </SvgText>
                      ) : null;

                      if (ev.isRest) {
                        return (
                          <G key={ev.id}>
                            {chordEl}
                            {ev.duration === 'h' || ev.duration === 'w' ? (
                              <Rect
                                x={cx - 6}
                                y={
                                  ev.duration === 'w'
                                    ? TOP_LINE_Y + LINE_SPACING
                                    : TOP_LINE_Y + LINE_SPACING * 2 - 4
                                }
                                width={12}
                                height={4}
                                fill={mutedInk}
                              />
                            ) : (
                              <SvgText
                                x={cx - 4}
                                y={TOP_LINE_Y + 26}
                                fontSize={18}
                                fill={mutedInk}
                              >
                                𝄽
                              </SvgText>
                            )}
                          </G>
                        );
                      }

                      if (ev.isSlash) {
                        return (
                          <G key={ev.id} onPress={() => onNotePress?.(ev)}>
                            {chordEl}
                            {isActive && (
                              <Rect
                                x={cx - 10}
                                y={TOP_LINE_Y - 4}
                                width={20}
                                height={LINE_SPACING * 4 + 8}
                                fill="rgba(217, 164, 65, 0.22)"
                                rx={4}
                              />
                            )}
                            <Line
                              x1={cx - 5}
                              y1={TOP_LINE_Y + 27}
                              x2={cx + 5}
                              y2={TOP_LINE_Y + 13}
                              stroke={noteColor}
                              strokeWidth={3.2}
                              strokeLinecap="round"
                            />
                          </G>
                        );
                      }

                      const primary = ev.pitches[0];
                      if (!primary) return null;

                      const { step } = writtenMidiToStaffStep(
                        primary.writtenMidi,
                        keyInfo.preferFlats
                      );
                      const cy = stepToY(step);
                      const isHollow =
                        ev.duration === 'w' || ev.duration === 'h' || ev.duration === 'h.';
                      const hasStem = ev.duration !== 'w';
                      const isDotted = ev.duration === 'h.' || ev.duration === 'q.';
                      const isEighth = ev.duration === '8';
                      const isSixteenth = ev.duration === '16';
                      const stemDown = step >= 4; // B4 and above: stems point down
                      const stemX = stemDown ? cx - 5.2 : cx + 5.2;
                      const stemY2 = stemDown ? cy + 28 : cy - 28;

                      // Calculate needed ledger lines (even steps below 0 or above 8)
                      const ledgerSteps: number[] = [];
                      if (step <= -2) {
                        for (let s = -2; s >= step; s -= 2) ledgerSteps.push(s);
                      } else if (step >= 10) {
                        for (let s = 10; s <= step; s += 2) ledgerSteps.push(s);
                      }

                      return (
                        <G key={ev.id} onPress={() => onNotePress?.(ev)}>
                          {chordEl}

                          {/* Active playhead halo */}
                          {isActive && (
                            <Rect
                              x={cx - 12}
                              y={TOP_LINE_Y - 8}
                              width={24}
                              height={LINE_SPACING * 4 + 16}
                              fill="rgba(217, 164, 65, 0.2)"
                              rx={4}
                            />
                          )}

                          {/* Ledger lines */}
                          {ledgerSteps.map((ls) => (
                            <Line
                              key={`led-${ls}`}
                              x1={cx - 10}
                              y1={stepToY(ls)}
                              x2={cx + 10}
                              y2={stepToY(ls)}
                              stroke={staffLineColor}
                              strokeWidth={1.1}
                            />
                          ))}

                          {/* Explicit accidental if specified */}
                          {primary.accidental && (
                            <SvgText
                              x={cx - 15}
                              y={cy + 4}
                              fontSize={13}
                              fontWeight="700"
                              fill={noteColor}
                            >
                              {primary.accidental === '#'
                                ? '♯'
                                : primary.accidental === 'b'
                                  ? '♭'
                                  : '♮'}
                            </SvgText>
                          )}

                          {/* Notehead ellipse */}
                          <Ellipse
                            cx={cx}
                            cy={cy}
                            rx={5.8}
                            ry={4.3}
                            rotation={-18}
                            origin={`${cx}, ${cy}`}
                            fill={isHollow ? bg : noteColor}
                            stroke={noteColor}
                            strokeWidth={isHollow ? 1.8 : 1.1}
                          />

                          {/* Augmentation dot */}
                          {isDotted && (
                            <Circle cx={cx + 10} cy={cy - 1} r={1.8} fill={noteColor} />
                          )}

                          {/* Stem */}
                          {hasStem && (
                            <Line
                              x1={stemX}
                              y1={cy}
                              x2={stemX}
                              y2={stemY2}
                              stroke={noteColor}
                              strokeWidth={1.4}
                            />
                          )}

                          {/* Eighth / Sixteenth flag */}
                          {(isEighth || isSixteenth) && (
                            <G>
                              <Line
                                x1={stemX}
                                y1={stemY2}
                                x2={stemX + 8}
                                y2={stemDown ? stemY2 - 8 : stemY2 + 8}
                                stroke={noteColor}
                                strokeWidth={2.2}
                                strokeLinecap="round"
                              />
                              {isSixteenth && (
                                <Line
                                  x1={stemX}
                                  y1={stemDown ? stemY2 - 5 : stemY2 + 5}
                                  x2={stemX + 8}
                                  y2={stemDown ? stemY2 - 13 : stemY2 + 13}
                                  stroke={noteColor}
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                />
                              )}
                            </G>
                          )}

                          {/* Optional Peek Fret hint (NO TAB — authentic circled string + fret) */}
                          {peekAllowed && primary.hint && (
                            <SvgText
                              x={cx - 10}
                              y={SYSTEM_HEIGHT - 8}
                              fontSize={9}
                              fontWeight="600"
                              fill={isActive ? palette.accentBrass : mutedInk}
                            >
                              {`${formatCircledString(primary.hint.stringNumber)}f${primary.hint.fret}`}
                            </SvgText>
                          )}
                        </G>
                      );
                    })}

                    {/* Measure closing barline */}
                    <Line
                      x1={xEnd}
                      y1={TOP_LINE_Y}
                      x2={xEnd}
                      y2={BOTTOM_LINE_Y}
                      stroke={ink}
                      strokeWidth={isLastMeasure ? 2.8 : 1.1}
                    />
                    {isLastMeasure && (
                      <Line
                        x1={xEnd - 4}
                        y1={TOP_LINE_Y}
                        x2={xEnd - 4}
                        y2={BOTTOM_LINE_Y}
                        stroke={ink}
                        strokeWidth={1}
                      />
                    )}
                  </G>
                );
              })}
            </Svg>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  sheetSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  loopStrip: {
    marginBottom: 6,
    gap: 6,
  },
  loopHint: {
    fontSize: 11,
  },
  measureChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  measureChip: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  measureChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

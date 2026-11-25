import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Chip, Surface, Text } from 'react-native-paper';
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
  showLoopPicker?: boolean;
  loopRange?: [number, number] | null;
  onMeasurePress?: (measureIndex: number) => void;
  onNotePress?: (event: ScoreNoteEvent) => void;
}

const LINE_SPACING = 11;
const HALF_STEP_Y = LINE_SPACING / 2;
const SYSTEM_HEIGHT = 142;
const TOP_LINE_Y = 48;
const BOTTOM_LINE_Y = TOP_LINE_Y + LINE_SPACING * 4;

function stepToY(step: number): number {
  return BOTTOM_LINE_Y - step * HALF_STEP_Y;
}

const SHARP_STEPS = [8, 5, 9, 6];
const FLAT_STEPS = [4, 7, 3];

export const StaffNotation: React.FC<StaffNotationProps> = ({
  score,
  theme,
  activeEventId,
  eventStates = {},
  measuresPerSystem = 2,
  showPeekFret = false,
  showLoopPicker = false,
  loopRange = null,
  onMeasurePress,
  onNotePress,
}) => {
  const isPaper = theme === 'paper';
  const bg = isPaper ? palette.paperBg : palette.darkSheetBg;
  const ink = isPaper ? palette.paperInk : palette.darkSheetInk;
  const mutedInk = isPaper ? palette.paperInkMuted : '#9CA3AF';
  const staffLineColor = isPaper ? palette.paperStaffLine : palette.darkSheetStaffLine;

  const keyInfo = KEY_SIGNATURES[score.keySignature];
  const systems: ScoreMeasure[][] = [];
  for (let i = 0; i < score.measures.length; i += measuresPerSystem) {
    systems.push(score.measures.slice(i, i + measuresPerSystem));
  }

  const clefWidth = 58 + Math.abs(keyInfo.accidentals) * 11 + 26;
  const measureWidth = measuresPerSystem >= 4 ? 196 : 265;
  const svgWidth = clefWidth + measuresPerSystem * measureWidth + 16;
  const peekAllowed = showPeekFret && score.allowPeekFret;

  return (
    <Surface
      elevation={1}
      style={[
        styles.sheetCard,
        {
          backgroundColor: bg,
          borderColor: isPaper ? palette.paperBorder : '#2B3140',
        },
      ]}
    >
      <View style={styles.sheetHeader}>
        <Text variant="titleMedium" style={[styles.sheetTitle, { color: ink }]}>
          {score.title}
        </Text>
        <Text variant="labelMedium" style={{ color: mutedInk }}>
          {keyInfo.label} · {score.timeSignature[0]}/{score.timeSignature[1]}
          {score.isCapstone ? ' · Full Song' : ''}
        </Text>
      </View>

      {showLoopPicker && onMeasurePress && (
        <View style={styles.loopBar}>
          <Text variant="labelMedium" style={{ color: mutedInk }}>
            {loopRange ? `Looping bars ${loopRange[0] + 1}–${loopRange[1] + 1}` : 'Tap bars to loop:'}
          </Text>
          <View style={styles.measureChips}>
            {score.measures.map((m) => {
              const inLoop =
                loopRange !== null && m.index >= loopRange[0] && m.index <= loopRange[1];
              return (
                <Chip
                  key={m.index}
                  compact
                  showSelectedCheck={false}
                  selected={inLoop}
                  mode={inLoop ? 'flat' : 'outlined'}
                  onPress={() => onMeasurePress(m.index)}
                >
                  {m.index + 1}
                </Chip>
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
                    strokeWidth={1.1}
                  />
                );
              })}

              <Line x1={10} y1={TOP_LINE_Y} x2={10} y2={BOTTOM_LINE_Y} stroke={ink} strokeWidth={1.6} />

              <SvgText x={16} y={BOTTOM_LINE_Y - 1} fontSize={46} fill={ink} fontFamily="Georgia">
                𝄞
              </SvgText>

              {keyInfo.accidentals > 0 &&
                SHARP_STEPS.slice(0, keyInfo.accidentals).map((step, i) => (
                  <SvgText
                    key={`sharp-${i}`}
                    x={50 + i * 11}
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
                    x={50 + i * 11}
                    y={stepToY(step) + 4}
                    fontSize={15}
                    fontWeight="700"
                    fill={ink}
                  >
                    ♭
                  </SvgText>
                ))}

              {sysIdx === 0 && (
                <G>
                  <SvgText x={clefWidth - 22} y={TOP_LINE_Y + 18} fontSize={18} fontWeight="700" fill={ink} fontFamily="Georgia">
                    {score.timeSignature[0]}
                  </SvgText>
                  <SvgText x={clefWidth - 22} y={TOP_LINE_Y + 40} fontSize={18} fontWeight="700" fill={ink} fontFamily="Georgia">
                    {score.timeSignature[1]}
                  </SvgText>
                </G>
              )}

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
                    {inLoop && (
                      <Rect
                        x={xStart + 1}
                        y={TOP_LINE_Y - 12}
                        width={measureWidth - 2}
                        height={LINE_SPACING * 4 + 24}
                        fill="rgba(15, 107, 110, 0.09)"
                        rx={4}
                      />
                    )}

                    <SvgText
                      x={xStart + 5}
                      y={16}
                      fontSize={9}
                      fill={inLoop ? palette.primary : mutedInk}
                      fontWeight={inLoop ? '700' : '500'}
                    >
                      {measure.index + 1}
                    </SvgText>

                    {(measure.sectionLabel || measure.positionMarker) && (
                      <SvgText
                        x={xStart + 22}
                        y={16}
                        fontSize={10}
                        fontWeight="700"
                        fill={measure.positionMarker ? palette.primary : ink}
                      >
                        {[measure.sectionLabel, measure.positionMarker].filter(Boolean).join(' · ')}
                      </SvgText>
                    )}

                    {measure.events.map((ev) => {
                      const usableW = measureWidth - 38;
                      const cx = xStart + 22 + (ev.beatOffset / beatsInBar) * usableW;
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

                      const chordEl = ev.chordSymbol ? (
                        <SvgText x={cx - 8} y={32} fontSize={11} fontWeight="700" fill={ink}>
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
                              <SvgText x={cx - 4} y={TOP_LINE_Y + 28} fontSize={18} fill={mutedInk}>
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
                                x={cx - 11}
                                y={TOP_LINE_Y - 4}
                                width={22}
                                height={LINE_SPACING * 4 + 8}
                                fill="rgba(217, 119, 6, 0.16)"
                                rx={5}
                              />
                            )}
                            <Line
                              x1={cx - 5}
                              y1={TOP_LINE_Y + 29}
                              x2={cx + 5}
                              y2={TOP_LINE_Y + 14}
                              stroke={noteColor}
                              strokeWidth={3.4}
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
                      const stemDown = step >= 4;
                      const stemX = stemDown ? cx - 5.5 : cx + 5.5;
                      const stemY2 = stemDown ? cy + 30 : cy - 30;

                      const ledgerSteps: number[] = [];
                      if (step <= -2) {
                        for (let s = -2; s >= step; s -= 2) ledgerSteps.push(s);
                      } else if (step >= 10) {
                        for (let s = 10; s <= step; s += 2) ledgerSteps.push(s);
                      }

                      return (
                        <G key={ev.id} onPress={() => onNotePress?.(ev)}>
                          {chordEl}

                          {isActive && (
                            <Rect
                              x={cx - 13}
                              y={TOP_LINE_Y - 8}
                              width={26}
                              height={LINE_SPACING * 4 + 16}
                              fill="rgba(217, 119, 6, 0.16)"
                              rx={6}
                            />
                          )}

                          {ledgerSteps.map((ls) => (
                            <Line
                              key={`led-${ls}`}
                              x1={cx - 11}
                              y1={stepToY(ls)}
                              x2={cx + 11}
                              y2={stepToY(ls)}
                              stroke={staffLineColor}
                              strokeWidth={1.2}
                            />
                          ))}

                          {primary.accidental && (
                            <SvgText x={cx - 16} y={cy + 4} fontSize={13} fontWeight="700" fill={noteColor}>
                              {primary.accidental === '#' ? '♯' : primary.accidental === 'b' ? '♭' : '♮'}
                            </SvgText>
                          )}

                          <Ellipse
                            cx={cx}
                            cy={cy}
                            rx={6.2}
                            ry={4.6}
                            rotation={-18}
                            origin={`${cx}, ${cy}`}
                            fill={isHollow ? bg : noteColor}
                            stroke={noteColor}
                            strokeWidth={isHollow ? 1.9 : 1.1}
                          />

                          {isDotted && <Circle cx={cx + 10.5} cy={cy - 1} r={2} fill={noteColor} />}

                          {hasStem && (
                            <Line x1={stemX} y1={cy} x2={stemX} y2={stemY2} stroke={noteColor} strokeWidth={1.5} />
                          )}

                          {(isEighth || isSixteenth) && (
                            <G>
                              <Line
                                x1={stemX}
                                y1={stemY2}
                                x2={stemX + 8}
                                y2={stemDown ? stemY2 - 8 : stemY2 + 8}
                                stroke={noteColor}
                                strokeWidth={2.3}
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

                          {peekAllowed && primary.hint && (
                            <SvgText
                              x={cx - 10}
                              y={SYSTEM_HEIGHT - 8}
                              fontSize={10}
                              fontWeight="700"
                              fill={isActive ? palette.accentBrass : mutedInk}
                            >
                              {`${formatCircledString(primary.hint.stringNumber)}f${primary.hint.fret}`}
                            </SvgText>
                          )}
                        </G>
                      );
                    })}

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
    </Surface>
  );
};

const styles = StyleSheet.create({
  sheetCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 18,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  sheetTitle: {
    fontWeight: '700',
  },
  loopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  measureChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
});

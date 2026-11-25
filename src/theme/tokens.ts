// Clean, airy studio design tokens for ReadMusic
// Minimal dark chrome + crisp warm-ivory sheet paper, generous breathing room.

export const palette = {
  bgCanvas: '#0F1115',
  bgSurface: '#171A21',
  bgElevated: '#20242E',
  bgSubtle: '#13161C',
  borderHairline: '#262B36',
  borderStrong: '#363D4D',

  textPrimary: '#F5F3EE',
  textSecondary: '#A9B0BE',
  textMuted: '#737B8C',

  accentBrass: '#E2AC48',
  accentBrassMuted: 'rgba(226, 172, 72, 0.14)',
  accentBrassBorder: 'rgba(226, 172, 72, 0.40)',
  successEmerald: '#40C27E',
  successMuted: 'rgba(64, 194, 126, 0.15)',
  errorCoral: '#E66060',
  errorMuted: 'rgba(230, 96, 96, 0.15)',
  infoSteel: '#6EA0F5',
  infoMuted: 'rgba(110, 160, 245, 0.14)',

  // Engraved sheet music paper
  paperBg: '#FAF7F0',
  paperSurface: '#F2EDE1',
  paperBorder: '#E2DAC9',
  paperInk: '#17181B',
  paperInkMuted: '#68655E',
  paperStaffLine: '#38383C',

  // Dark stage sheet music
  darkSheetBg: '#161A22',
  darkSheetInk: '#F2EFE8',
  darkSheetStaffLine: '#5A6272',

  // Fretboard
  fretboardWood: '#211B17',
  fretboardNut: '#ECE6D6',
  fretWire: '#6B6A68',
  fretInlay: '#4B453E',
  stringWound: '#BE9F74',
  stringPlain: '#CFD4DC',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

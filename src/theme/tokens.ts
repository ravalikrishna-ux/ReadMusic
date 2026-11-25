// Editorial / Studio design tokens for ReadMusic
// Matte dark studio chrome + high-contrast warm ivory engraved-paper notation.

export const palette = {
  // Studio dark chrome
  bgCanvas: '#111317',
  bgSurface: '#181B21',
  bgElevated: '#20242D',
  bgSubtle: '#15181E',
  borderHairline: '#2A2F3A',
  borderStrong: '#3B4252',

  // Typography on dark
  textPrimary: '#F3F1EA',
  textSecondary: '#A8AFBE',
  textMuted: '#727A8A',

  // Functional accents (brass/studio gold, pitch emerald, error coral, muted steel)
  accentBrass: '#D9A441',
  accentBrassMuted: 'rgba(217, 164, 65, 0.16)',
  accentBrassBorder: 'rgba(217, 164, 65, 0.42)',
  successEmerald: '#3FB978',
  successMuted: 'rgba(63, 185, 120, 0.16)',
  errorCoral: '#E05A5A',
  errorMuted: 'rgba(224, 90, 90, 0.16)',
  infoSteel: '#689BF2',
  infoMuted: 'rgba(104, 155, 242, 0.15)',

  // Engraved sheet music paper (light)
  paperBg: '#F9F6EE',
  paperSurface: '#F1ECE0',
  paperBorder: '#DFD8C8',
  paperInk: '#17181B',
  paperInkMuted: '#5D5B55',
  paperStaffLine: '#3A3A3D',

  // Engraved sheet music (dark stage toggle)
  darkSheetBg: '#161920',
  darkSheetInk: '#F0EDE5',
  darkSheetStaffLine: '#5A6170',

  // Fretboard wood & hardware
  fretboardWood: '#221C18',
  fretboardNut: '#EAE4D3',
  fretWire: '#6B6A68',
  fretInlay: '#47423B',
  stringWound: '#B89B72',
  stringPlain: '#C7CCD4',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 40,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
} as const;

export const typography = {
  serif: 'Georgia',
  mono: 'monospace',
} as const;

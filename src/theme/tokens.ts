// Material Design 3 "Paper" Light Aesthetic Tokens for ReadMusic
// Crisp warm-paper surfaces, deep charcoal ink, and modern Studio Teal primary accent.

export const palette = {
  // Paper light surfaces
  bgCanvas: '#F7F6F2',
  bgSurface: '#FFFFFF',
  bgElevated: '#F1EFE9',
  bgSubtle: '#F4F2EC',
  borderHairline: '#E6E2D8',
  borderStrong: '#D3CEC2',

  // Crisp ink typography
  textPrimary: '#181A1F',
  textSecondary: '#555B66',
  textMuted: '#7F8694',

  // Primary Studio Teal (MD3) + Warm Amber active-note highlight
  primary: '#0F6B6E',
  primaryContainer: '#DCEFEB',
  onPrimaryContainer: '#094345',

  accentBrass: '#D97706', // Warm amber for active playhead & highlight notes
  accentBrassMuted: '#FEF3C7',
  accentBrassBorder: '#F59E0B',

  successEmerald: '#15803D',
  successMuted: '#DCFCE7',
  errorCoral: '#DC2626',
  errorMuted: '#FEE2E2',
  infoSteel: '#1D4ED8',
  infoMuted: '#DBEAFE',

  // Sheet music paper (default clean white paper)
  paperBg: '#FFFFFF',
  paperSurface: '#FAF9F6',
  paperBorder: '#E6E2D8',
  paperInk: '#16181D',
  paperInkMuted: '#686E7A',
  paperStaffLine: '#3D414A',

  // Optional dark stage sheet music toggle
  darkSheetBg: '#181C24',
  darkSheetInk: '#F3F1EA',
  darkSheetStaffLine: '#5E6676',

  // Fretboard satin rosewood & brass/nickel hardware
  fretboardWood: '#2D2520',
  fretboardNut: '#F4EFE3',
  fretWire: '#8A847C',
  fretInlay: '#635B52',
  stringWound: '#D0B082',
  stringPlain: '#DCE0E6',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

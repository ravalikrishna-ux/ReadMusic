import { MD3LightTheme, MD3Theme } from 'react-native-paper';
import { palette } from './tokens';

export const readMusicPaperTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 4,
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.primary,
    onPrimary: '#FFFFFF',
    primaryContainer: palette.primaryContainer,
    onPrimaryContainer: palette.onPrimaryContainer,
    secondary: '#3D5A63',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E7EFEF',
    onSecondaryContainer: '#183037',
    tertiary: palette.accentBrass,
    onTertiary: '#FFFFFF',
    tertiaryContainer: palette.accentBrassMuted,
    onTertiaryContainer: '#78350F',
    background: palette.bgCanvas,
    onBackground: palette.textPrimary,
    surface: palette.bgSurface,
    onSurface: palette.textPrimary,
    surfaceVariant: palette.bgElevated,
    onSurfaceVariant: palette.textSecondary,
    outline: palette.borderStrong,
    outlineVariant: palette.borderHairline,
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#FAF9F6',
      level3: '#F4F2EC',
      level4: '#EFECE5',
      level5: '#EAE6DD',
    },
  },
};

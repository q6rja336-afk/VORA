// VORA Design Tokens — sourced from color/DESIGN.md
export const colors = {
  // Surfaces
  surface: '#12131c',
  surfaceDim: '#12131c',
  surfaceBright: '#383842',
  surfaceContainerLowest: '#0d0e16',
  surfaceContainerLow: '#1a1b24',
  surfaceContainer: '#1e1f28',
  surfaceContainerHigh: '#292933',
  surfaceContainerHighest: '#34343e',
  // On-surface
  onSurface: '#e3e1ee',
  onSurfaceVariant: '#c5c5d8',
  inverseSurface: '#e3e1ee',
  inverseOnSurface: '#2f3039',
  // Outline
  outline: '#8f8fa1',
  outlineVariant: '#454655',
  // Primary
  surfaceTint: '#bdc2ff',
  primary: '#bdc2ff',
  onPrimary: '#00149f',
  primaryContainer: '#4f61ff',
  onPrimaryContainer: '#fefaff',
  inversePrimary: '#3648e8',
  // Secondary
  secondary: '#c7c5d3',
  onSecondary: '#302f3a',
  secondaryContainer: '#494854',
  onSecondaryContainer: '#b9b7c5',
  // Tertiary (accent warm)
  tertiary: '#ffb692',
  onTertiary: '#552000',
  tertiaryContainer: '#c25200',
  onTertiaryContainer: '#fffbff',
  // Error
  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
  // Background
  background: '#12131c',
  onBackground: '#e3e1ee',
  surfaceVariant: '#34343e',
} as const;

export const typography = {
  displayLg: { fontFamily: 'IBM Plex Sans Arabic', fontSize: '34px', fontWeight: '700', lineHeight: '1.2', letterSpacing: '-0.5px' },
  headlineMd: { fontFamily: 'IBM Plex Sans Arabic', fontSize: '24px', fontWeight: '700', lineHeight: '1.3', letterSpacing: '-0.3px' },
  titleSm:    { fontFamily: 'IBM Plex Sans Arabic', fontSize: '20px', fontWeight: '600', lineHeight: '1.4' },
  bodyMd:     { fontFamily: 'IBM Plex Sans Arabic', fontSize: '16px', fontWeight: '400', lineHeight: '1.6' },
  labelSm:    { fontFamily: 'Inter', fontSize: '13px', fontWeight: '500', lineHeight: '1.0' },
} as const;

export const spacing = {
  unit: '8px',
  marginMain: '24px',
  gutterGrid: '16px',
  stackSm: '12px',
  stackMd: '24px',
  stackLg: '40px',
} as const;

export const radius = {
  sm: '4px',
  DEFAULT: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
} as const;

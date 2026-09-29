export const palettes = {
  light: {
    background: '#F6F1E8',
    card: '#FFFDF8',
    ink: '#1C1917',
    muted: '#78716C',
    border: '#E7E0D4',
    forest: '#0F3D2E',
    leaf: '#2D6A4F',
    sage: '#D8EDE4',
    gold: '#C9A227',
    goldSoft: '#F4E7C3',
    danger: '#B42318',
    dangerSoft: '#FDE8E6',
    warning: '#B45309',
    warningSoft: '#FEF3C7',
    white: '#FFFFFF',
    onPrimary: '#FFFDF8',
    tabBar: '#FFFDF8',
    overlay: 'rgba(15, 61, 46, 0.45)',
  },
  dark: {
    background: '#121A16',
    card: '#1B2621',
    ink: '#F5F0E8',
    muted: '#A8A29E',
    border: '#2A3831',
    forest: '#7DCEA0',
    leaf: '#52B788',
    sage: '#1E3A2F',
    gold: '#E6C35C',
    goldSoft: '#3A3218',
    danger: '#F97066',
    dangerSoft: '#3A1D1B',
    warning: '#FBBF24',
    warningSoft: '#3A2E12',
    white: '#1B2621',
    onPrimary: '#FFFDF8',
    tabBar: '#15201B',
    overlay: 'rgba(0, 0, 0, 0.55)',
  },
} as const;

export type ThemeColors = (typeof palettes)[keyof typeof palettes];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

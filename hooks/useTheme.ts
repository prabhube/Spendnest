import { palettes, type ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/components/useColorScheme';

export function useTheme(): ThemeColors {
  const scheme = useColorScheme() ?? 'light';
  return palettes[scheme === 'dark' ? 'dark' : 'light'];
}

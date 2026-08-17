import { useColorScheme } from '@/hooks/use-color-scheme';

import { palettes, type Palette } from './tokens';

/**
 * The single reader of the system appearance. Screens ask for colors, never for
 * the scheme, so a component can never branch on `dark` and forget one of the
 * two themes.
 */
export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? palettes.dark : palettes.light;
}

/**
 * Needed only where a platform API takes an appearance rather than a color:
 * the status bar and the navigation theme.
 */
export function useIsDark(): boolean {
  return useColorScheme() === 'dark';
}

export type { Palette };

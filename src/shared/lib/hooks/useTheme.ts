/**
 * useTheme — React hook for theme tokens
 *
 * Reads from theme-bus via useSyncExternalStore for tear-free rendering.
 */

import { useSyncExternalStore } from 'react';
import type { ThemeName, ThemeTokens } from '@/src/shared/config/themes/types';
import { subscribe, getSnapshot, getThemeName } from '@/src/shared/lib/theme-bus';

/**
 * Returns the current resolved ThemeTokens object.
 * Re-renders only when the theme actually changes.
 */
export function useTheme(): ThemeTokens {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Returns just the current theme name ('light' | 'dark' | 'field' | 'custom').
 * Lighter than useTheme() when you only need the name.
 */
export function useThemeName(): ThemeName {
  return useSyncExternalStore(subscribe, getThemeName, getThemeName);
}

// Re-export imperative read for canvas/SVG/chart code
export { getThemeToken } from '@/src/shared/lib/theme-bus';

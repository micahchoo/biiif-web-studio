/**
 * Theme Event Bus
 *
 * Pub/sub store following the useSyncExternalStore contract.
 * Single source of truth for the active theme — both CSS vars
 * (set by ThemeRoot) and JS reads (via useTheme) go through here.
 */

import type { ThemeName, ThemeTokens } from '@/src/shared/config/themes/types';
import { resolveTheme } from '@/src/shared/config/themes';

type Listener = () => void;

let currentName: ThemeName = 'light';
let currentOverrides: Partial<ThemeTokens> | undefined;
let currentTokens: ThemeTokens = resolveTheme('light');

const listeners = new Set<Listener>();

function emitChange() {
  for (const fn of listeners) fn();
}

// ── useSyncExternalStore contract ──────────────────────────────────

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function getSnapshot(): ThemeTokens {
  return currentTokens;
}

export function getThemeName(): ThemeName {
  return currentName;
}

// ── Mutations ──────────────────────────────────────────────────────

export function setTheme(
  name: ThemeName,
  customOverrides?: Partial<ThemeTokens>,
): void {
  if (name === currentName && customOverrides === currentOverrides) return;
  currentName = name;
  currentOverrides = customOverrides;
  currentTokens = resolveTheme(name, customOverrides);
  emitChange();
}

/**
 * Imperative read for non-React contexts (canvas, SVG, chart renderers).
 */
export function getThemeToken<K extends keyof ThemeTokens>(key: K): ThemeTokens[K] {
  return currentTokens[key];
}

export const themeBus = {
  subscribe,
  getSnapshot,
  getThemeName,
  setTheme,
  getThemeToken,
} as const;

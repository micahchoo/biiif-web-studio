/**
 * Shared Library Providers
 *
 * Context providers and hooks that are used across multiple FSD layers.
 * Moved here from app/providers to fix FSD layering violations.
 */

export {
  AppModeProvider,
  useAppModeState,
  useAppModeActions,
  useAppMode,
} from './AppModeProvider';
export type {
  AppModeState,
  AppModeActions,
  AppModeProviderProps,
} from './AppModeProvider';

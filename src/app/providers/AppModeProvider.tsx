/**
 * Re-export from shared/lib/providers for backward compatibility.
 * Source of truth: @/src/shared/lib/providers/AppModeProvider
 */
export {
  AppModeProvider,
  useAppModeState,
  useAppModeActions,
  useAppMode,
} from '@/src/shared/lib/providers/AppModeProvider';
export type {
  AppModeState,
  AppModeActions,
  AppModeProviderProps,
} from '@/src/shared/lib/providers/AppModeProvider';
export { AppModeProvider as default } from '@/src/shared/lib/providers/AppModeProvider';

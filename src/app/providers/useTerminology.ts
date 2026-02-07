/**
 * Re-export from shared/lib/hooks for backward compatibility.
 * Source of truth: @/src/shared/lib/hooks/useTerminology
 */
export {
  useTerminology,
  useTerminologyWithLevel,
} from '@/src/shared/lib/hooks/useTerminology';
export type {
  UseTerminologyOptions,
  UseTerminologyReturn,
} from '@/src/shared/lib/hooks/useTerminology';
export { useTerminology as default } from '@/src/shared/lib/hooks/useTerminology';

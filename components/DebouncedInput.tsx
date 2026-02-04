/**
 * DebouncedInput - Re-export from shared molecules
 *
 * This component is now maintained in src/shared/ui/molecules/.
 * This file provides backward compatibility while migrating to atomic design.
 *
 * Note: The new DebouncedInput only provides the input component.
 * DebouncedTextarea has been deprecated in favor of using DebouncedInput
 * with appropriate configuration.
 *
 * MIGRATION NOTICE: Use import { DebouncedInput } from '@/src/shared/ui/molecules' in new code.
 *
 * @deprecated Import from '@/src/shared/ui/molecules' instead
 */

export {
  DebouncedInput,
  type DebouncedInputProps,
} from '@/src/shared/ui/molecules/DebouncedInput';

export { DebouncedInput as default } from '@/src/shared/ui/molecules/DebouncedInput';

/**
 * FilterInput - Re-export from shared molecules
 *
 * This component is now maintained in src/shared/ui/molecules/.
 * This file provides backward compatibility while migrating to atomic design.
 *
 * MIGRATION NOTICE: Use import { FilterInput } from '@/src/shared/ui/molecules' in new code.
 *
 * @deprecated Import from '@/src/shared/ui/molecules' instead
 */

export {
  FilterInput,
  type FilterInputProps,
} from '@/src/shared/ui/molecules/FilterInput';

export { FilterInput as default } from '@/src/shared/ui/molecules/FilterInput';

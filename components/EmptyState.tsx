/**
 * EmptyState - Re-export from shared molecules
 *
 * This component is now maintained in src/shared/ui/molecules/.
 * This file provides backward compatibility while migrating to atomic design.
 *
 * Note: The new EmptyState uses context-based styling instead of variant prop.
 * The 'variant' prop is replaced by internal useContextualStyles() consumption.
 *
 * MIGRATION NOTICE: Use import { EmptyState } from '@/src/shared/ui/molecules' in new code.
 *
 * @deprecated Import from '@/src/shared/ui/molecules' instead
 */

export {
  EmptyState,
  type EmptyStateProps,
  type EmptyStateAction,
} from '@/src/shared/ui/molecules/EmptyState';

export { EmptyState as default } from '@/src/shared/ui/molecules/EmptyState';

/**
 * SelectionToolbar - Re-export from shared molecules
 *
 * This component is now maintained in src/shared/ui/molecules/.
 * This file provides backward compatibility while migrating to atomic design.
 *
 * MIGRATION NOTICE: Use import { SelectionToolbar } from '@/src/shared/ui/molecules' in new code.
 *
 * @deprecated Import from '@/src/shared/ui/molecules' instead
 */

export {
  SelectionToolbar,
  type SelectionToolbarProps,
} from '@/src/shared/ui/molecules/SelectionToolbar';

export { SelectionToolbar as default } from '@/src/shared/ui/molecules/SelectionToolbar';

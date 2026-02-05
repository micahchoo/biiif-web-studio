/**
 * CollectionCardMenu Molecule
 *
 * Action menu dropdown for collection cards.
 * Provides rename, delete, and add sub-collection actions.
 *
 * ATOMIC DESIGN COMPLIANCE:
 * - Uses useState for menu open/close (UI state only)
 * - No domain logic - callbacks only
 * - Composes Button and Icon atoms
 *
 * IDEAL OUTCOME: Accessible action menu for collection operations
 * FAILURE PREVENTED: Missing actions, inaccessible menu
 *
 * @module shared/ui/molecules/CollectionCardMenu
 */

import React, { useState } from 'react';
import { Button, Icon } from '../atoms';
import { IconButton } from './IconButton';
import type { ContextualClassNames } from '@/hooks/useContextualStyles';

export interface CollectionCardMenuProps {
  /** Whether this is the root collection (affects available actions) */
  isRoot?: boolean;
  /** Called when rename is selected */
  onRename?: () => void;
  /** Called when delete is selected */
  onDelete?: () => void;
  /** Called when add sub-collection is selected */
  onAddSubCollection?: () => void;
  /** Contextual styles for theming */
  cx?: ContextualClassNames;
}

/**
 * CollectionCardMenu Component
 *
 * Dropdown menu with collection management actions.
 *
 * @example
 * <CollectionCardMenu
 *   isRoot={false}
 *   onRename={() => setIsEditing(true)}
 *   onDelete={() => handleDelete()}
 *   onAddSubCollection={() => handleAddSub()}
 * />
 */
export const CollectionCardMenu: React.FC<CollectionCardMenuProps> = ({
  isRoot = false,
  onRename,
  onDelete,
  onAddSubCollection,
  cx,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // No actions available
  if (!onDelete && !onAddSubCollection && !onRename) {
    return null;
  }

  const handleAction = (callback?: () => void) => {
    callback?.();
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <IconButton
        icon="more_vert"
        ariaLabel="Actions menu"
        onClick={() => setShowMenu(!showMenu)}
        variant="ghost"
        size="sm"
        className={`p-1 ${cx?.iconButton ?? 'text-slate-400 hover:text-slate-600'}`}
      />

      {showMenu && (
        <>
          {/* Backdrop to close menu on outside click */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
            aria-hidden="true"
          />
          {/* Menu dropdown */}
          <div
            className={`absolute right-0 top-full mt-1 w-48 border ${cx?.surface ?? 'bg-white border-slate-200'} rounded-lg shadow-lg z-20 py-1`}
            role="menu"
          >
            {onAddSubCollection && (
              <Button
                onClick={() => handleAction(onAddSubCollection)}
                variant="ghost"
                size="sm"
                className={`w-full px-4 py-2 text-left text-sm ${cx?.subtleText ?? 'text-slate-700'} hover:bg-slate-50 flex items-center gap-2 justify-start`}
                role="menuitem"
              >
                <Icon name="create_new_folder" className={cx?.textMuted ?? 'text-slate-400'} />
                Add sub-collection
              </Button>
            )}
            {!isRoot && onRename && (
              <Button
                onClick={() => handleAction(onRename)}
                variant="ghost"
                size="sm"
                className={`w-full px-4 py-2 text-left text-sm ${cx?.subtleText ?? 'text-slate-700'} hover:bg-slate-50 flex items-center gap-2 justify-start`}
                role="menuitem"
              >
                <Icon name="edit" className={cx?.textMuted ?? 'text-slate-400'} />
                Rename
              </Button>
            )}
            {!isRoot && onDelete && (
              <Button
                onClick={() => handleAction(onDelete)}
                variant="ghost"
                size="sm"
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 justify-start"
                role="menuitem"
              >
                <Icon name="delete" className="text-red-400" />
                Delete
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CollectionCardMenu;

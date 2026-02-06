/**
 * CollectionCardHeader Molecule
 *
 * Header section for collection cards.
 * Displays icon, name/editing form, counts, and action menu.
 *
 * ATOMIC DESIGN COMPLIANCE:
 * - Composes smaller molecules (EditForm, Menu)
 * - Props-driven, no context
 * - Delegates all actions to callbacks
 *
 * IDEAL OUTCOME: Consistent collection card header across the app
 * FAILURE PREVENTED: Inconsistent header layouts, missing actions
 *
 * @module shared/ui/molecules/CollectionCardHeader
 */

import React from 'react';
import { Icon } from '../atoms';
import { CollectionCardEditForm } from './CollectionCardEditForm';
import { CollectionCardMenu } from './CollectionCardMenu';
import type { ContextualClassNames } from '@/src/shared/lib/hooks/useContextualStyles';

export interface CollectionCardHeaderProps {
  /** Collection name */
  name: string;
  /** Number of manifests */
  manifestCount: number;
  /** Number of sub-collections */
  subCollectionCount?: number;
  /** Whether this is root collection */
  isRoot?: boolean;
  /** Whether currently editing */
  isEditing?: boolean;
  /** Called when edit is saved */
  onRename?: (newName: string) => void;
  /** Called when edit is cancelled */
  onEditCancel?: () => void;
  /** Called to start editing (if not controlled) */
  onEditStart?: () => void;
  /** Called when delete selected */
  onDelete?: () => void;
  /** Called when add sub-collection selected */
  onAddSubCollection?: () => void;
  /** Contextual styles */
  cx?: ContextualClassNames;
}

/**
 * CollectionCardHeader Component
 *
 * @example
 * <CollectionCardHeader
 *   name="My Collection"
 *   manifestCount={5}
 *   isEditing={isEditing}
 *   onRename={(name) => handleRename(name)}
 *   onEditCancel={() => setIsEditing(false)}
 * />
 */
export const CollectionCardHeader: React.FC<CollectionCardHeaderProps> = ({
  name,
  manifestCount,
  subCollectionCount = 0,
  isRoot = false,
  isEditing = false,
  onRename,
  onEditCancel,
  onEditStart,
  onDelete,
  onAddSubCollection,
  cx,
}) => {
  const handleNameClick = () => {
    if (!isRoot && onEditStart) {
      onEditStart();
    }
  };

  return (
    <div className="flex items-start gap-3 mb-3">
      {/* Icon */}
      <div
        className={`
          w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
          ${isRoot ? 'bg-amber-200' : 'bg-amber-100'}
        `}
      >
        <Icon name={isRoot ? 'folder_special' : 'folder'} className="text-xl text-amber-600" />
      </div>

      {/* Name and counts */}
      <div className="flex-1 min-w-0">
        {isEditing && onRename ? (
          <CollectionCardEditForm
            name={name}
            onSave={onRename}
            onCancel={onEditCancel || (() => {})}
          />
        ) : (
          <>
            <div
              className={`font-medium ${cx?.text ?? 'text-slate-800'} truncate ${!isRoot && onRename ? 'cursor-pointer hover:text-blue-600' : ''}`}
              onClick={handleNameClick}
              title={isRoot ? name : onRename ? 'Click to rename' : name}
            >
              {name}
              {isRoot && (
                <span className="ml-2 text-[10px] text-amber-600 font-bold">(ROOT)</span>
              )}
            </div>
            <div className={`flex items-center gap-2 text-[11px] ${cx?.textMuted ?? 'text-slate-500'}`}>
              <span>
                {manifestCount} {manifestCount === 1 ? 'manifest' : 'manifests'}
              </span>
              {subCollectionCount > 0 && (
                <>
                  <span className={cx?.label ?? 'text-slate-400'}>|</span>
                  <span>
                    {subCollectionCount} sub-{subCollectionCount === 1 ? 'collection' : 'collections'}
                  </span>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Actions menu */}
      <CollectionCardMenu
        isRoot={isRoot}
        onRename={onEditStart}
        onDelete={onDelete}
        onAddSubCollection={onAddSubCollection}
        cx={cx}
      />
    </div>
  );
};

export default CollectionCardHeader;

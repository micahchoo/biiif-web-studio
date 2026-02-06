/**
 * CollectionCard Molecule
 *
 * Card component for displaying IIIF collections with drag-drop support.
 * Used in staging and archive features.
 *
 * ATOMIC DESIGN COMPLIANCE:
 * - Zero context hooks - all data via props
 * - No domain imports - purely presentational
 * - Composes: CollectionCardHeader, CollectionCardDropOverlay
 * - Supports drag-drop target states
 *
 * IDEAL OUTCOME: Consistent collection representation across features
 * FAILURE PREVENTED: Inconsistent cards, broken drop interactions
 *
 * @module shared/ui/molecules/CollectionCard
 */

import React, { useCallback, useState } from 'react';
import { CollectionCardHeader } from './CollectionCardHeader';
import { CollectionCardDropOverlay } from './CollectionCardDropOverlay';
import type { ContextualClassNames } from '@/src/shared/lib/hooks/useContextualStyles';

export interface CollectionCardProps {
  /** Collection identifier */
  id: string;
  /** Collection name/label */
  name: string;
  /** Number of manifests in collection */
  manifestCount: number;
  /** Number of sub-collections */
  subCollectionCount?: number;
  /** Whether this is the root collection */
  isRoot?: boolean;
  /** Whether item is a drag target */
  isDragOver?: boolean;
  /** Whether item can accept drops */
  canDrop?: boolean;
  /** Whether user is editing the name */
  isEditing?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Called when name is edited */
  onRename?: (newName: string) => void;
  /** Called when collection is deleted */
  onDelete?: () => void;
  /** Called when sub-collection is added */
  onAddSubCollection?: () => void;
  /** Called when drop occurs */
  onDrop?: (e: React.DragEvent) => void;
  /** Called when drag enters */
  onDragEnter?: () => void;
  /** Called when drag leaves */
  onDragLeave?: () => void;
  /** Called when card is clicked */
  onClick?: () => void;
  /** Children for custom content (e.g., manifest list) */
  children?: React.ReactNode;
  cx?: ContextualClassNames;
  fieldMode?: boolean;
}

/**
 * CollectionCard Molecule
 *
 * Displays a collection with icon, name, counts, and drop zone.
 * Supports inline editing and drag-drop interactions.
 *
 * @example
 * <CollectionCard
 *   id="coll-1"
 *   name="My Collection"
 *   manifestCount={5}
 *   isDragOver={activeDropTarget === 'coll-1'}
 *   onDrop={handleDrop}
 *   onRename={handleRename}
 * />
 */
export const CollectionCard: React.FC<CollectionCardProps> = ({
  id,
  name,
  manifestCount,
  subCollectionCount = 0,
  isRoot = false,
  isDragOver = false,
  canDrop = true,
  isEditing: controlledIsEditing,
  className = '',
  onRename,
  onDelete,
  onAddSubCollection,
  onDrop,
  onDragEnter,
  onDragLeave,
  onClick,
  children,
  cx,
  fieldMode: _fieldMode,
}) => {
  // Internal editing state (for uncontrolled mode)
  const [isEditingInternal, setIsEditingInternal] = useState(false);
  const isEditing = controlledIsEditing ?? isEditingInternal;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onDrop?.(e);
    },
    [onDrop]
  );

  const handleEditStart = useCallback(() => {
    if (!isRoot && onRename) {
      setIsEditingInternal(true);
    }
  }, [isRoot, onRename]);

  const handleEditCancel = useCallback(() => {
    setIsEditingInternal(false);
  }, []);

  const handleRename = useCallback(
    (newName: string) => {
      onRename?.(newName);
      setIsEditingInternal(false);
    },
    [onRename]
  );

  return (
    <div
      data-collection-id={id}
      onDragOver={handleDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={handleDrop}
      onClick={onClick}
      className={`
        relative border-2 rounded-xl p-4 transition-all duration-200
        ${isDragOver && canDrop
          ? 'border-blue-400 bg-blue-50 shadow-lg scale-[1.02]'
          : isDragOver && !canDrop
          ? 'border-red-300 bg-red-50'
          : isRoot
          ? 'border-amber-300 bg-amber-50/50'
          : `${cx?.surface ?? 'bg-white border-slate-200'} hover:shadow-sm`
        }
        ${className}
      `}
    >
      {/* Drop indicator overlay */}
      <CollectionCardDropOverlay isDragOver={isDragOver} canDrop={canDrop} />

      {/* Header with icon, name, counts, and menu */}
      <CollectionCardHeader
        name={name}
        manifestCount={manifestCount}
        subCollectionCount={subCollectionCount}
        isRoot={isRoot}
        isEditing={isEditing}
        onRename={onRename ? handleRename : undefined}
        onEditCancel={handleEditCancel}
        onEditStart={handleEditStart}
        onDelete={onDelete}
        onAddSubCollection={onAddSubCollection}
        cx={cx}
      />

      {/* Custom content (e.g., manifest list) */}
      {children}
    </div>
  );
};

export default CollectionCard;

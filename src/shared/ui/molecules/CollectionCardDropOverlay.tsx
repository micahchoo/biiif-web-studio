/**
 * CollectionCardDropOverlay Molecule
 *
 * Visual feedback overlays for drag-drop operations on collection cards.
 * Shows "Drop to add" or "Cannot drop" states.
 *
 * ATOMIC DESIGN COMPLIANCE:
 * - Zero context hooks - all data via props
 * - Pure presentational component
 * - No business logic
 *
 * IDEAL OUTCOME: Clear visual feedback during drag-drop operations
 * FAILURE PREVENTED: Confusing drop interactions without visual cues
 *
 * @module shared/ui/molecules/CollectionCardDropOverlay
 */

import React from 'react';
import { Icon } from '../atoms';

export interface CollectionCardDropOverlayProps {
  /** Whether drag is currently over this card */
  isDragOver: boolean;
  /** Whether the drop is valid/can be accepted */
  canDrop: boolean;
}

/**
 * CollectionCardDropOverlay Component
 *
 * Renders drop zone visual feedback for collection cards.
 *
 * @example
 * <CollectionCardDropOverlay isDragOver={true} canDrop={true} />
 */
export const CollectionCardDropOverlay: React.FC<CollectionCardDropOverlayProps> = ({
  isDragOver,
  canDrop,
}) => {
  if (!isDragOver) return null;

  if (canDrop) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-blue-100/80 rounded-xl z-10 pointer-events-none">
        <div className="text-center">
          <Icon name="add_circle" className="text-4xl text-blue-500 mb-2" />
          <div className="text-sm font-bold text-blue-700">Drop to add</div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-red-100/80 rounded-xl z-10 pointer-events-none">
      <div className="text-center">
        <Icon name="block" className="text-4xl text-red-500 mb-2" />
        <div className="text-sm font-bold text-red-700">Cannot drop here</div>
      </div>
    </div>
  );
};

export default CollectionCardDropOverlay;

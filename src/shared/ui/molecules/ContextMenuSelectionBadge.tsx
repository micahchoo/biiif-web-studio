/**
 * ContextMenuSelectionBadge Molecule
 *
 * Badge displaying the count of selected items in a context menu.
 * Shown for multi-selection contexts.
 *
 * ATOMIC DESIGN COMPLIANCE:
 * - Props-driven, no internal state
 * - Pure presentational
 *
 * IDEAL OUTCOME: Clear indication of multi-selection state
 * FAILURE PREVENTED: User confusion about scope of actions
 *
 * @module shared/ui/molecules/ContextMenuSelectionBadge
 */

import React from 'react';
import type { ContextualClassNames } from '@/hooks/useContextualStyles';

export interface ContextMenuSelectionBadgeProps {
  /** Number of selected items */
  count: number;
  /** Contextual styles */
  cx?: ContextualClassNames;
}

/**
 * ContextMenuSelectionBadge Component
 *
 * @example
 * <ContextMenuSelectionBadge count={5} />
 */
export const ContextMenuSelectionBadge: React.FC<ContextMenuSelectionBadgeProps> = ({
  count,
  cx,
}) => {
  if (count <= 1) return null;

  return (
    <div className={`px-3 py-1.5 mb-2 mx-1 rounded-lg ${cx?.subtleBg ?? 'bg-slate-100'}`}>
      <span className={`text-xs font-bold ${cx?.textMuted ?? 'text-slate-500'}`}>
        {count} items selected
      </span>
    </div>
  );
};

export default ContextMenuSelectionBadge;

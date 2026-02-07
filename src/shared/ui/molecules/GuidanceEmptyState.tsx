/**
 * GuidanceEmptyState Molecule
 *
 * Empty state with optional action button and tips list.
 * Used for zero-state UI with contextual guidance.
 *
 * ATOMIC DESIGN COMPLIANCE:
 * - No local state
 * - No domain logic
 * - Props-only API
 * - Uses design tokens
 *
 * @module shared/ui/molecules/GuidanceEmptyState
 */

import React from 'react';
import { Button } from '@/src/shared/ui/atoms';
import { Icon } from '@/src/shared/ui/atoms/Icon';

export interface GuidanceEmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  tips?: string[];
}

export const GuidanceEmptyState: React.FC<GuidanceEmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  tips,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon name={icon} className="text-3xl text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-700 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6">{description}</p>

      {action && (
        <Button variant="ghost" size="bare"
          onClick={action.onClick}
          className="px-6 py-2.5 bg-iiif-blue text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          {action.label}
          <Icon name="arrow_forward" className="text-sm" />
        </Button>
      )}

      {tips && tips.length > 0 && (
        <div className="mt-8 text-left w-full max-w-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Quick tips</p>
          <ul className="space-y-1.5">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                <Icon name="check_circle" className="text-green-500 text-xs mt-0.5 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GuidanceEmptyState;

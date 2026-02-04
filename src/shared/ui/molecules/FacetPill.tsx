/**
 * FacetPill Molecule
 *
 * A toggleable filter pill for faceted search interfaces.
 * Composes Button atom with active/inactive states.
 *
 * ATOMIC DESIGN:
 * - Composes: Button atom
 * - Has local state: active/inactive
 * - No domain logic (search state managed by parent)
 *
 * IDEAL OUTCOME: Clear visual indication of active filters
 * FAILURE PREVENTED: Confusing filter state (active vs inactive)
 *
 * @example
 * <FacetPill
 *   label="Images"
 *   count={42}
 *   active={true}
 *   onToggle={() => setFilter('images')}
 * />
 */

import React from 'react';
import { Button } from '../atoms';
import type { ContextualClassNames } from '@/hooks/useContextualStyles';

export interface FacetPillProps {
  /** Display label for the facet */
  label: string;
  /** Optional count badge */
  count?: number;
  /** Whether this facet is currently active */
  active?: boolean;
  /** Called when pill is clicked */
  onToggle: () => void;
  /** Optional icon name */
  icon?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Contextual styles from template (required for theming) */
  cx: ContextualClassNames;
}

/**
 * FacetPill Component
 *
 * Toggleable filter pill with count badge.
 * Uses contextual styles for fieldMode-aware theming.
 */
export const FacetPill: React.FC<FacetPillProps> = ({
  label,
  count,
  active = false,
  onToggle,
  icon,
  disabled = false,
  size = 'md',
  cx,
}) => {

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 rounded-full font-medium
        transition-all duration-200 ease-in-out
        ${sizeClasses[size]}
        ${active
          ? `${cx.accent} text-white shadow-md`
          : `${cx.surface} ${cx.border} ${cx.text} hover:${cx.headerBg}`
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        border
      `}
      aria-pressed={active}
      role="switch"
    >
      {icon && (
        <span className="material-icons text-[1em]">{icon}</span>
      )}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`
            px-1.5 py-0.5 rounded-full text-xs font-semibold
            ${active
              ? 'bg-white/20 text-white'
              : `${cx.headerBg} ${cx.textMuted}`
            }
          `}
        >
          {count}
        </span>
      )}
    </button>
  );
};

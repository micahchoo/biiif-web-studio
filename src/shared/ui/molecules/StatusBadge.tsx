/**
 * StatusBadge Molecule
 *
 * Composes: Icon atom + text span
 *
 * Displays status indicators with consistent styling.
 * Used for item counts, validation states, and process status.
 *
 * IDEAL OUTCOME: Clear, scannable status indicators
 * FAILURE PREVENTED: Inconsistent status styling across views
 */

import React from 'react';
import { Icon } from '../atoms';
import type { ContextualClassNames } from '@/src/shared/lib/hooks/useContextualStyles';

export type StatusVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent';

export interface StatusBadgeProps {
  /** Status text */
  label: string;
  /** Optional icon name */
  icon?: string;
  /** Visual variant */
  variant?: StatusVariant;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Pulse animation for active states */
  pulse?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Contextual styles from template */
  cx?: ContextualClassNames;
  /** Current field mode */
  fieldMode?: boolean;
}

/**
 * StatusBadge Molecule
 *
 * @example
 * <StatusBadge
 *   label="12 selected"
 *   icon="check_circle"
 *   variant="accent"
 * />
 *
 * @example
 * <StatusBadge
 *   label="Processing..."
 *   icon="sync"
 *   variant="info"
 *   pulse
 * />
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  icon,
  variant = 'default',
  size = 'md',
  pulse = false,
  className = '',
  cx = {},
  fieldMode = false,
}) => {
  // Context is provided via props (no hook calls)

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
  };

  const variantClasses: Record<StatusVariant, string> = {
    default: `${cx.subtleBg} ${cx.subtleText}`,
    success: fieldMode
      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
      : 'bg-green-50 text-green-700 border border-green-200',
    warning: fieldMode
      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
      : 'bg-amber-50 text-amber-700 border border-amber-200',
    error: fieldMode
      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
      : 'bg-red-50 text-red-700 border border-red-200',
    info: fieldMode
      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      : 'bg-blue-50 text-blue-700 border border-blue-200',
    accent: cx.accentBadge,
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {icon && (
        <Icon
          name={icon}
          className={`${size === 'sm' ? 'text-xs' : 'text-sm'} ${pulse ? 'animate-spin' : ''}`}
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;

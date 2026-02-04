/**
 * ActionButton Molecule
 *
 * Composes: Button atom + Icon atom + text label
 *
 * A button with icon and text for prominent actions.
 * Supports loading state and variants for different action types.
 *
 * IDEAL OUTCOME: Clear, recognizable action buttons with visual feedback
 * FAILURE PREVENTED: Ambiguous actions without iconography
 */

import React from 'react';
import { Button, Icon } from '../atoms';
import type { ContextualClassNames } from '@/hooks/useContextualStyles';

export interface ActionButtonProps {
  /** Button text */
  label: string;
  /** Optional icon name */
  icon?: string;
  /** Click handler */
  onClick: () => void;
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Type attribute */
  type?: 'button' | 'submit' | 'reset';
  /** Contextual styles from template */
  cx?: ContextualClassNames;
  /** Current field mode */
  fieldMode?: boolean;
}

/**
 * ActionButton Molecule
 *
 * @example
 * <ActionButton
 *   label="Save Changes"
 *   icon="save"
 *   onClick={handleSave}
 *   variant="primary"
 * />
 *
 * @example
 * <ActionButton
 *   label="Delete"
 *   icon="delete"
 *   onClick={handleDelete}
 *   variant="danger"
 *   loading={isDeleting}
 * />
 */
export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
  cx = {},
  fieldMode = false,
}) => {
  // Context is provided via props (no hook calls)

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    primary: fieldMode
      ? 'bg-yellow-400 text-black hover:bg-yellow-300'
      : 'bg-iiif-blue text-white hover:bg-blue-600',
    secondary: fieldMode
      ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
      : 'bg-slate-200 text-slate-700 hover:bg-slate-300',
    danger: fieldMode
      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50'
      : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200',
    success: fieldMode
      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/50'
      : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200',
    ghost: fieldMode
      ? 'text-slate-300 hover:bg-slate-800'
      : 'text-slate-600 hover:bg-slate-100',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg transition-all
        focus:outline-none focus:ring-2 focus:ring-offset-1
        ${cx.focusRing}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {loading ? (
        <span className="animate-spin">
          <Icon name="sync" className="text-sm" aria-hidden="true" />
        </span>
      ) : icon ? (
        <Icon name={icon} className="text-sm" aria-hidden="true" />
      ) : null}
      <span>{label}</span>
    </button>
  );
};

export default ActionButton;

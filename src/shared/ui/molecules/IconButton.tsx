/**
 * IconButton Molecule
 *
 * Composes: Button atom + Icon atom
 *
 * A button that displays only an icon, with accessible labeling.
 * Used for compact actions in toolbars and headers.
 *
 * IDEAL OUTCOME: Accessible icon-only buttons with proper aria-labels
 * FAILURE PREVENTED: Icon buttons without screen reader support
 */

import React from 'react';
import { Button, Icon } from '../atoms';
import type { ContextualClassNames } from '@/hooks/useContextualStyles';

export interface IconButtonProps {
  /** Icon name from Material Icons */
  icon: string;
  /** Accessible label (required for screen readers) */
  ariaLabel: string;
  /** Click handler */
  onClick: () => void;
  /** Visual variant */
  variant?: 'default' | 'primary' | 'danger' | 'ghost';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Tooltip text (optional) */
  title?: string;
  /** Contextual styles from template */
  cx?: ContextualClassNames;
  /** Current field mode */
  fieldMode?: boolean;
}

const sizeClasses = {
  sm: { button: 'p-1', icon: 'text-sm' },
  md: { button: 'p-1.5', icon: 'text-base' },
  lg: { button: 'p-2', icon: 'text-lg' },
};

/**
 * IconButton Molecule
 *
 * @example
 * <IconButton
 *   icon="delete"
 *   ariaLabel="Delete item"
 *   onClick={handleDelete}
 *   variant="danger"
 * />
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  ariaLabel,
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
  className = '',
  title,
  cx = {},
  fieldMode = false,
}) => {
  // Context is provided via props (no hook calls)

  const sizeClass = sizeClasses[size];

  const variantClasses = {
    default: `${cx.iconButton} hover:bg-slate-100 dark:hover:bg-slate-800`,
    primary: `text-iiif-blue hover:bg-blue-50 dark:text-yellow-400 dark:hover:bg-yellow-400/10`,
    danger: `text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10`,
    ghost: `text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800`,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title || ariaLabel}
      className={`
        rounded-lg transition-all
        focus:outline-none focus:ring-2 focus:ring-offset-1
        ${cx.focusRing}
        ${sizeClass.button}
        ${variantClasses[variant]}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <Icon name={icon} className={sizeClass.icon} aria-hidden="true" />
    </button>
  );
};

export default IconButton;

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
import { Button } from '@/ui/primitives/Button';
import { Icon } from '../atoms';
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
  cx?: ContextualClassNames | {};
  /** Current field mode */
  fieldMode?: boolean;
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const sizePadding = {
  sm: '4px',
  md: '6px',
  lg: '8px',
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
  cx: _cx = {},
  fieldMode: _fieldMode = false,
}) => {
  // Map variant to Button atom variant
  const variantMap: Record<string, 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'> = {
    default: 'secondary',
    primary: 'primary',
    danger: 'danger',
    ghost: 'ghost',
  };

  // Map size to Button atom size
  const sizeMap: Record<string, 'sm' | 'base' | 'lg' | 'xl'> = {
    sm: 'sm',
    md: 'base',
    lg: 'lg',
  };

  // Custom style for circular icon button
  const customStyle: React.CSSProperties = {
    padding: sizePadding[size],
    minWidth: 'auto',
    borderRadius: '8px',
    aspectRatio: '1',
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title || ariaLabel}
      variant={variantMap[variant]}
      size={sizeMap[size]}
      minimal={variant === 'ghost'}
      style={customStyle}
      className={className}
    >
      <Icon name={icon} className={sizeClasses[size]} aria-hidden="true" />
    </Button>
  );
};

export default IconButton;

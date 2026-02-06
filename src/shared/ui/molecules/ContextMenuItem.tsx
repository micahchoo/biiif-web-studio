/**
 * ContextMenuItem Molecule
 *
 * Individual menu item for context menus.
 * Supports icons, keyboard shortcuts, variants, and disabled state.
 *
 * ATOMIC DESIGN COMPLIANCE:
 * - Props-driven, no internal state
 * - Composes Button and Icon atoms
 * - Pure presentational
 *
 * IDEAL OUTCOME: Consistent menu items across all context menus
 * FAILURE PREVENTED: Inconsistent styling, missing keyboard support
 *
 * @module shared/ui/molecules/ContextMenuItem
 */

import React, { useCallback } from 'react';
import { Button, Icon } from '../atoms';
import type { ContextualClassNames } from '@/src/shared/lib/hooks/useContextualStyles';

export interface ContextMenuItemProps {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Material icon name */
  icon?: string;
  /** Click handler */
  onClick: () => void;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Visual variant */
  variant?: 'default' | 'danger' | 'primary';
  /** Keyboard shortcut to display (e.g., "Ctrl+C") */
  shortcut?: string;
  /** Tooltip/description */
  description?: string;
  /** Contextual styles */
  cx?: ContextualClassNames;
}

/**
 * Get CSS classes for menu item based on variant and state
 */
export const getContextMenuItemClasses = (
  item: Pick<ContextMenuItemProps, 'disabled' | 'variant'>,
  cx?: ContextualClassNames
): string => {
  const baseClasses = 'w-full px-3 py-2 text-left text-sm flex items-center gap-3 transition-colors rounded-lg mx-1';

  if (item.disabled) {
    return `${baseClasses} opacity-40 cursor-not-allowed ${cx?.textMuted ?? 'text-slate-400'}`;
  }

  switch (item.variant) {
    case 'danger':
      return `${baseClasses} ${cx?.danger ?? 'text-red-600'} ${cx?.dangerHover ?? 'hover:bg-red-50'}`;
    case 'primary':
      return `${baseClasses} text-iiif-blue hover:bg-iiif-blue/10`;
    default:
      return `${baseClasses} ${cx?.subtleText ?? 'text-slate-700'} hover:${cx?.subtleBg ?? 'bg-slate-100'}`;
  }
};

/**
 * Get CSS classes for menu item icon
 */
export const getContextMenuIconClasses = (
  item: Pick<ContextMenuItemProps, 'disabled' | 'variant'>,
  cx?: ContextualClassNames
): string => {
  const baseClasses = 'text-lg';
  if (item.disabled) return `${baseClasses} ${cx?.label ?? 'text-slate-400'}`;

  switch (item.variant) {
    case 'danger':
      return `${baseClasses} ${cx?.danger ?? 'text-red-600'}`;
    case 'primary':
      return `${baseClasses} text-iiif-blue`;
    default:
      return `${baseClasses} ${cx?.textMuted ?? 'text-slate-500'}`;
  }
};

/**
 * ContextMenuItem Component
 *
 * @example
 * <ContextMenuItem
 *   id="delete"
 *   label="Delete"
 *   icon="delete"
 *   variant="danger"
 *   shortcut="Del"
 *   onClick={() => handleDelete()}
 * />
 */
export const ContextMenuItem: React.FC<ContextMenuItemProps> = ({
  id,
  label,
  icon,
  onClick,
  disabled = false,
  variant = 'default',
  shortcut,
  description,
  cx,
}) => {
  const handleClick = useCallback(() => {
    if (!disabled) {
      onClick();
    }
  }, [disabled, onClick]);

  const itemClasses = getContextMenuItemClasses({ disabled, variant }, cx);
  const iconClasses = getContextMenuIconClasses({ disabled, variant }, cx);

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      variant="ghost"
      size="sm"
      className={itemClasses}
      title={description}
      role="menuitem"
    >
      {icon && <Icon name={icon} className={iconClasses} />}
      <span className="flex-1">{label}</span>
      {shortcut && (
        <kbd className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${cx?.kbd ?? 'bg-slate-100 text-slate-500'}`}>
          {shortcut}
        </kbd>
      )}
    </Button>
  );
};

export default ContextMenuItem;

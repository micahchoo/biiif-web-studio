/**
 * MenuButton Molecule
 *
 * Composes: Button atom for menu items
 *
 * A styled button designed for dropdown menus and context menus.
 * Supports icons and descriptions like menu items.
 *
 * IDEAL OUTCOME: Consistent menu item styling with icon support
 * FAILURE PREVENTED: Inconsistent menu interactions
 */

import React from 'react';
import { Button } from '@/ui/primitives/Button';
import { Icon } from '../atoms';
import type { ContextualClassNames } from '@/src/shared/lib/hooks/useContextualStyles';

export interface MenuButtonProps {
  /** Click handler */
  onClick: () => void;
  /** Icon name */
  icon?: string;
  /** Primary label */
  label: string;
  /** Secondary description */
  description?: string;
  /** Whether item is highlighted/copied */
  highlighted?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Full width in container */
  fullWidth?: boolean;
  /** ARIA role */
  role?: string;
  /** Additional class name */
  className?: string;
  cx?: ContextualClassNames;
  fieldMode?: boolean;
}

/**
 * MenuButton Molecule
 *
 * @example
 * <MenuButton
 *   icon="content_copy"
 *   label="Copy Link"
 *   description="Share this view"
 *   onClick={handleCopy}
 * />
 */
export const MenuButton: React.FC<MenuButtonProps> = ({
  onClick,
  icon,
  label,
  description,
  highlighted = false,
  disabled = false,
  fullWidth = true,
  role = 'menuitem',
  className = '',
  cx,
  fieldMode: _fieldMode,
}) => {
  // Icon element for Button atom
  const iconElement = icon ? (
    <div
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
        highlighted
          ? 'bg-blue-500 text-white'
          : `${cx?.subtleBg ?? 'bg-slate-100'} ${cx?.textMuted ?? 'text-slate-500'}`
      }`}
    >
      <Icon name={icon} className="text-base" aria-hidden="true" />
    </div>
  ) : undefined;

  // Content with label and optional description
  const content = description ? (
    <div className="flex flex-col min-w-0 flex-1">
      <span className={`text-sm font-medium ${cx?.text ?? 'text-slate-800'}`}>{label}</span>
      <span className={`text-[10px] ${cx?.textMuted ?? 'text-slate-500'} whitespace-nowrap overflow-hidden text-ellipsis`}>
        {description}
      </span>
    </div>
  ) : (
    <span className={`text-sm font-medium ${cx?.text ?? 'text-slate-800'}`}>{label}</span>
  );

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="ghost"
      size="sm"
      fullWidth={fullWidth}
      icon={iconElement}
      // @ts-ignore - spread for aria attributes
      role={role}
      className={`justify-start p-2.5 gap-3 text-left bg-transparent ${className}`}
    >
      {content}
    </Button>
  );
};

export default MenuButton;

/**
 * BreadcrumbSiblingMenu Molecule
 *
 * Dropdown menu showing sibling items for breadcrumb navigation.
 *
 * ATOMIC DESIGN COMPLIANCE:
 * - No local state (controlled by parent)
 * - No domain logic
 * - Props-only API
 * - Uses design tokens
 *
 * @module shared/ui/molecules/BreadcrumbSiblingMenu
 */

import React from 'react';
import { Button, Icon } from '../atoms';
import type { BreadcrumbItem } from './breadcrumbTypes';

export interface BreadcrumbSiblingMenuProps {
  /** Current item ID (for highlighting) */
  currentItemId: string;
  /** Sibling items to display */
  siblings: BreadcrumbItem[];
  /** Called when a sibling is selected */
  onSelect: (sibling: BreadcrumbItem) => void;
  /** Field mode flag for dark theme */
  fieldMode?: boolean;
  /** Function to get icon for item type */
  getIconForType: (type?: string) => string;
}

export const BreadcrumbSiblingMenu: React.FC<BreadcrumbSiblingMenuProps> = ({
  currentItemId,
  siblings,
  onSelect,
  fieldMode = false,
  getIconForType,
}) => {
  return (
    <div
      className={`
        absolute top-full left-0 mt-1 min-w-[200px] max-h-[300px]
        rounded-xl shadow-xl border overflow-y-auto
        ${fieldMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}
        animate-in fade-in slide-in-from-top-2 z-50
      `}
      role="menu"
    >
      <div className={`px-3 py-2 text-xs font-medium ${fieldMode ? 'text-slate-500' : 'text-slate-500'}`}>
        Siblings
      </div>
      {siblings.map(sibling => (
        <Button variant="ghost" size="bare"
          key={sibling.id}
          onClick={() => onSelect(sibling)}
          className={`
            w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm
            transition-colors
            ${sibling.id === currentItemId
              ? (fieldMode ? 'bg-slate-700 text-white' : 'bg-blue-50 text-blue-700')
              : (fieldMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50')
            }
          `}
          role="menuitem"
          aria-current={sibling.id === currentItemId ? 'true' : undefined}
        >
          <Icon
            name={sibling.icon || getIconForType(sibling.type)}
            className="text-sm opacity-60"
          />
          <span className="flex-1 truncate">{sibling.label}</span>
          {sibling.childCount !== undefined && sibling.childCount > 0 && (
            <span
              className={`
                px-1.5 py-0.5 text-xs rounded-full
                ${fieldMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}
              `}
            >
              {sibling.childCount}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
};

export default BreadcrumbSiblingMenu;

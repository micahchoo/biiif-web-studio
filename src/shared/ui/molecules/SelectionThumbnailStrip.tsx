/**
 * SelectionThumbnailStrip Molecule
 *
 * Thumbnail preview strip for selected items.
 * Shows up to 5 thumbnails with overflow count.
 *
 * ATOMIC DESIGN COMPLIANCE:
 * - No local state
 * - No domain logic
 * - Props-only API
 * - Uses design tokens
 *
 * @module shared/ui/molecules/SelectionThumbnailStrip
 */

import React from 'react';
import { Button, Icon } from '../atoms';
import type { IIIFCanvas } from '@/src/shared/types';

export interface SelectionThumbnailStripProps {
  /** Selected canvas items */
  selectedItems: IIIFCanvas[];
  /** Max thumbnails to show */
  maxVisible?: number;
  /** Selection count */
  count: number;
  /** Item type label */
  itemLabel: string;
  /** Called to hide the strip */
  onHide: () => void;
  /** Field mode flag for dark theme */
  fieldMode?: boolean;
}

export const SelectionThumbnailStrip: React.FC<SelectionThumbnailStripProps> = ({
  selectedItems,
  maxVisible = 5,
  count,
  itemLabel,
  onHide,
  fieldMode = false,
}) => {
  const visibleThumbnails = selectedItems.slice(0, maxVisible);
  const remainingCount = Math.max(0, count - maxVisible);

  return (
    <div
      className={`
        flex items-center gap-2 p-3 border-b
        ${fieldMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}
      `}
    >
      <div className="flex items-center gap-1">
        {visibleThumbnails.map((item, idx) => (
          <div
            key={item.id}
            className={`
              w-10 h-10 rounded-lg overflow-hidden border-2
              ${fieldMode ? 'border-slate-600' : 'border-white shadow-sm'}
              ${idx === 0 ? 'ring-2 ring-blue-500' : ''}
            `}
            title={item.label?.en?.[0] || item.id}
          >
            {item.thumbnail?.[0]?.id ? (
              <img
                src={item.thumbnail[0].id}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${fieldMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                <Icon name="image" className="text-xs opacity-50" />
              </div>
            )}
          </div>
        ))}
        {remainingCount > 0 && (
          <div
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center text-xs font-medium
              ${fieldMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}
            `}
          >
            +{remainingCount}
          </div>
        )}
      </div>

      <div className={`h-8 w-px mx-2 ${fieldMode ? 'bg-slate-700' : 'bg-slate-200'}`} />

      {/* Selection count */}
      <div className="flex items-center gap-2">
        <Icon name="check_circle" className={`text-sm ${fieldMode ? 'text-green-400' : 'text-green-600'}`} />
        <span className={`font-medium ${fieldMode ? 'text-white' : 'text-slate-900'}`}>
          {count} {itemLabel}
        </span>
      </div>

      <Button variant="ghost" size="bare"
        onClick={onHide}
        className={`
          ml-auto p-1 rounded hover:bg-black/10 transition-colors
          ${fieldMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'}
        `}
        aria-label="Hide thumbnails"
      >
        <Icon name="expand_less" className="text-sm" />
      </Button>
    </div>
  );
};

export default SelectionThumbnailStrip;

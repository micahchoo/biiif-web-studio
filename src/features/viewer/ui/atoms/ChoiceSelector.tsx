/**
 * ChoiceSelector Atom
 *
 * Floating pill panel for selecting between IIIF Choice body options.
 * Anchored top-right of the viewer content area.
 * Supports keyboard shortcuts (1-9) for fast switching.
 *
 * @module features/viewer/ui/atoms/ChoiceSelector
 */

import React, { useEffect, useCallback } from 'react';
import { Icon } from '@/src/shared/ui/atoms';
import type { ChoiceItem } from '../../model';

export interface ChoiceSelectorProps {
  /** Available choice options */
  items: ChoiceItem[];
  /** Currently active index */
  activeIndex: number;
  /** Called when user selects a choice */
  onSelect: (index: number) => void;
  /** Field mode styling */
  fieldMode?: boolean;
}

export const ChoiceSelector: React.FC<ChoiceSelectorProps> = ({
  items,
  activeIndex,
  onSelect,
  fieldMode = false,
}) => {
  // Keyboard shortcut: 1-9 to switch choices
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= Math.min(items.length, 9)) {
      e.preventDefault();
      onSelect(num - 1);
    }
  }, [items.length, onSelect]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (items.length <= 1) return null;

  return (
    <div
      className={`absolute top-3 right-3 z-20 rounded-xl shadow-lg backdrop-blur-sm border ${
        fieldMode
          ? 'bg-slate-900/90 border-slate-700'
          : 'bg-white/90 border-slate-200'
      }`}
      role="radiogroup"
      aria-label="Image choice selection"
    >
      <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider border-b ${
        fieldMode
          ? 'text-slate-400 border-slate-700'
          : 'text-slate-500 border-slate-200'
      }`}>
        <Icon name="layers" className="text-sm mr-1 align-text-bottom" />
        Choice
      </div>
      <div className="py-1">
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={index}
              role="radio"
              aria-checked={isActive}
              onClick={() => onSelect(index)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
                isActive
                  ? fieldMode
                    ? 'bg-yellow-900/30 text-yellow-300'
                    : 'bg-blue-50 text-blue-700'
                  : fieldMode
                    ? 'text-slate-300 hover:bg-slate-800'
                    : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                isActive
                  ? fieldMode
                    ? 'border-yellow-400'
                    : 'border-blue-500'
                  : fieldMode
                    ? 'border-slate-600'
                    : 'border-slate-300'
              }`}>
                {isActive && (
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    fieldMode ? 'bg-yellow-400' : 'bg-blue-500'
                  }`} />
                )}
              </span>
              <span className="truncate flex-1 text-left">{item.label}</span>
              <span className={`text-[10px] tabular-nums ${
                fieldMode ? 'text-slate-600' : 'text-slate-400'
              }`}>
                {index + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ChoiceSelector;

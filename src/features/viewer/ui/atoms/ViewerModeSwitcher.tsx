/**
 * ViewerModeSwitcher Atom
 *
 * Segmented control for switching between viewing modes:
 * Individual, Continuous, and Book (paged).
 *
 * @module features/viewer/ui/atoms/ViewerModeSwitcher
 */

import React from 'react';
import { Icon } from '@/src/shared/ui/atoms';
import type { ViewingLayout } from '../../model';

export interface ViewerModeSwitcherProps {
  /** Current viewing mode */
  mode: ViewingLayout;
  /** Called when mode changes */
  onModeChange: (mode: ViewingLayout) => void;
  /** Which mode the manifest behavior suggests */
  defaultMode?: ViewingLayout;
  /** Field mode styling */
  fieldMode?: boolean;
}

const MODE_OPTIONS: Array<{
  value: ViewingLayout;
  icon: string;
  label: string;
  title: string;
}> = [
  { value: 'individuals', icon: 'view_carousel', label: 'Single', title: 'Individual pages' },
  { value: 'continuous', icon: 'view_day', label: 'Scroll', title: 'Continuous strip' },
  { value: 'paged', icon: 'menu_book', label: 'Book', title: 'Paged spread' },
];

export const ViewerModeSwitcher: React.FC<ViewerModeSwitcherProps> = ({
  mode,
  onModeChange,
  defaultMode,
  fieldMode = false,
}) => {
  return (
    <div
      className={`inline-flex rounded-lg border ${
        fieldMode
          ? 'border-slate-700 bg-slate-800'
          : 'border-slate-200 bg-slate-50'
      }`}
      role="radiogroup"
      aria-label="Viewer mode"
    >
      {MODE_OPTIONS.map(opt => {
        const isActive = mode === opt.value;
        const isDefault = defaultMode === opt.value;

        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={isActive}
            title={`${opt.title}${isDefault ? ' (manifest default)' : ''}`}
            onClick={() => onModeChange(opt.value)}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${
              isActive
                ? fieldMode
                  ? 'bg-yellow-900/40 text-yellow-300 border-yellow-700'
                  : 'bg-blue-50 text-blue-700'
                : fieldMode
                  ? 'text-slate-400 hover:bg-slate-700'
                  : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Icon name={opt.icon} className="text-sm" />
            <span>{opt.label}</span>
            {isDefault && !isActive && (
              <span className={`w-1.5 h-1.5 rounded-full ${
                fieldMode ? 'bg-yellow-600' : 'bg-blue-300'
              }`} title="Manifest default" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ViewerModeSwitcher;

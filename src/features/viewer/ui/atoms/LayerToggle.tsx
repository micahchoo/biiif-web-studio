/**
 * LayerToggle Atom
 *
 * Single row for toggling an annotation layer's visibility.
 * Shows checkbox, label, count, color dot, and eye icon.
 *
 * @module features/viewer/ui/atoms/LayerToggle
 */

import React from 'react';
import { Icon } from '@/src/shared/ui/atoms';
import { Button } from '@/ui/primitives/Button';

export interface LayerToggleProps {
  /** Layer identifier */
  id: string;
  /** Display label */
  label: string;
  /** Number of annotations in this layer */
  count: number;
  /** Assigned color */
  color: string;
  /** Whether this layer is visible */
  visible: boolean;
  /** Whether this layer has hidden behavior */
  hidden: boolean;
  /** Toggle callback */
  onToggle: (id: string) => void;
  /** Field mode styling */
  fieldMode?: boolean;
}

export const LayerToggle: React.FC<LayerToggleProps> = ({
  id,
  label,
  count,
  color,
  visible,
  hidden,
  onToggle,
  fieldMode = false,
}) => {
  return (
    <button
      onClick={() => onToggle(id)}
      className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
        visible
          ? fieldMode
            ? 'bg-slate-800 text-white'
            : 'bg-slate-50 text-slate-700'
          : fieldMode
            ? 'bg-transparent text-slate-500'
            : 'bg-transparent text-slate-400'
      } hover:bg-slate-100 ${fieldMode ? 'hover:bg-slate-800' : ''}`}
      role="checkbox"
      aria-checked={visible}
      aria-label={`Toggle ${label} layer`}
    >
      {/* Color dot */}
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: visible ? color : 'transparent', border: `2px solid ${color}` }}
      />

      {/* Label */}
      <span className="flex-1 text-left truncate">
        {label}
      </span>

      {/* Count */}
      <span className={`text-xs tabular-nums ${fieldMode ? 'text-slate-600' : 'text-slate-400'}`}>
        ({count})
      </span>

      {/* Hidden badge */}
      {hidden && (
        <Icon
          name="visibility_off"
          className={`text-xs ${fieldMode ? 'text-slate-600' : 'text-slate-400'}`}
          title="Hidden by default (behavior: hidden)"
        />
      )}

      {/* Visibility icon */}
      <Icon
        name={visible ? 'visibility' : 'visibility_off'}
        className={`text-sm ${
          visible
            ? fieldMode ? 'text-slate-300' : 'text-slate-500'
            : fieldMode ? 'text-slate-700' : 'text-slate-300'
        }`}
      />
    </button>
  );
};

export default LayerToggle;

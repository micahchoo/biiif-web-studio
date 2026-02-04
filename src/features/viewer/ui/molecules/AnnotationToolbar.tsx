/**
 * AnnotationToolbar Molecule
 *
 * Toolbar for the annotation tool with mode selection and controls.
 */

import React from 'react';
import { Icon } from '@/components/Icon';
import type { DrawingMode } from '../../model/annotation';

export interface AnnotationToolbarProps {
  currentMode: DrawingMode;
  existingCount: number;
  showExisting: boolean;
  onModeChange: (mode: DrawingMode) => void;
  onToggleExisting: () => void;
  onClose: () => void;
}

const MODES: { mode: DrawingMode; icon: string; label: string }[] = [
  { mode: 'polygon', icon: 'pentagon', label: 'Polygon' },
  { mode: 'rectangle', icon: 'crop_square', label: 'Rectangle' },
  { mode: 'freehand', icon: 'gesture', label: 'Freehand' },
  { mode: 'select', icon: 'pan_tool', label: 'Pan' },
];

export const AnnotationToolbar: React.FC<AnnotationToolbarProps> = ({
  currentMode,
  existingCount,
  showExisting,
  onModeChange,
  onToggleExisting,
  onClose,
}) => {
  return (
    <div className="h-12 bg-slate-900 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-white font-bold flex items-center gap-2 text-sm">
          <Icon name="pentagon" className="text-green-400" />
          Annotation Tool
        </h2>

        <div className="flex bg-white/5 border border-white/10 rounded p-0.5">
          {MODES.map((m) => (
            <button
              key={m.mode}
              onClick={() => onModeChange(m.mode)}
              className={`px-2 py-1 text-[10px] font-bold uppercase rounded flex items-center gap-1 ${
                currentMode === m.mode
                  ? 'bg-green-600 text-white'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              <Icon name={m.icon} className="text-xs" /> {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleExisting}
          className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
            showExisting ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/40'
          }`}
        >
          {existingCount} Existing
        </button>
        <button
          onClick={onClose}
          className="px-3 py-1 text-white/40 hover:text-white font-bold text-sm hover:bg-white/10 rounded"
        >
          Done
        </button>
      </div>
    </div>
  );
};

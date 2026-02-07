/**
 * AutoAdvanceToast Atom
 *
 * Countdown toast shown when auto-advance is about to move to next canvas.
 * Shows canvas label, countdown, and cancel button.
 *
 * @module features/viewer/ui/atoms/AutoAdvanceToast
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Button, Icon } from '@/src/shared/ui/atoms';

export interface AutoAdvanceToastProps {
  /** Label of the next canvas */
  nextLabel: string;
  /** Duration of countdown in seconds */
  duration?: number;
  /** Called when countdown completes */
  onAdvance: () => void;
  /** Called when user cancels auto-advance */
  onCancel: () => void;
  /** Field mode styling */
  fieldMode?: boolean;
}

export const AutoAdvanceToast: React.FC<AutoAdvanceToastProps> = ({
  nextLabel,
  duration = 3,
  onAdvance,
  onCancel,
  fieldMode = false,
}) => {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    if (remaining <= 0) {
      onAdvance();
      return;
    }

    const timer = setTimeout(() => {
      setRemaining(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [remaining, onAdvance]);

  return (
    <div className={`absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2.5 rounded-xl shadow-lg backdrop-blur-sm border animate-in slide-in-from-bottom-4 ${
      fieldMode
        ? 'bg-slate-900/95 border-slate-700'
        : 'bg-white/95 border-slate-200'
    }`}>
      <Icon
        name="skip_next"
        className={`text-lg ${fieldMode ? 'text-yellow-400' : 'text-blue-500'}`}
      />
      <div>
        <div className={`text-sm font-medium ${fieldMode ? 'text-white' : 'text-slate-700'}`}>
          Next: {nextLabel}
        </div>
        <div className={`text-xs ${fieldMode ? 'text-slate-400' : 'text-slate-500'}`}>
          in {remaining}s
        </div>
      </div>

      {/* Progress bar */}
      <div className={`w-16 h-1 rounded-full overflow-hidden ${
        fieldMode ? 'bg-slate-700' : 'bg-slate-200'
      }`}>
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            fieldMode ? 'bg-yellow-400' : 'bg-blue-500'
          }`}
          style={{ width: `${((duration - remaining) / duration) * 100}%` }}
        />
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
      >
        Cancel
      </Button>
    </div>
  );
};

export default AutoAdvanceToast;

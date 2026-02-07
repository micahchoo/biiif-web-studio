/**
 * TimeModeSelector Atom
 *
 * Radio group for selecting annotation timeMode: Trim, Scale, or Loop.
 * Shows in the Annotations tab when annotation targets time-based canvas.
 *
 * @see https://iiif.io/api/presentation/3.0/#timemode
 * @module features/metadata-edit/ui/atoms/TimeModeSelector
 */

import React from 'react';
import { Icon } from '@/src/shared/ui/atoms';
import { FormInput } from '@/src/shared/ui/molecules/FormInput';

export type TimeMode = 'trim' | 'scale' | 'loop';

export interface TimeModeSelectorProps {
  /** Current time mode */
  value: TimeMode;
  /** Called when mode changes */
  onChange: (mode: TimeMode) => void;
  /** Annotation time range for display */
  timeRange?: { start: number; end?: number };
  /** Canvas duration in seconds */
  canvasDuration?: number;
  /** Loop count (0 = infinite) */
  loopCount?: number;
  /** Called when loop count changes */
  onLoopCountChange?: (count: number) => void;
  /** Field mode styling */
  fieldMode?: boolean;
  /** Whether editing is disabled */
  disabled?: boolean;
}

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

export const TimeModeSelector: React.FC<TimeModeSelectorProps> = ({
  value,
  onChange,
  timeRange,
  canvasDuration,
  loopCount = 0,
  onLoopCountChange,
  fieldMode = false,
  disabled = false,
}) => {
  // Calculate playback rate for Scale mode
  const annotationDuration = timeRange
    ? (timeRange.end ?? timeRange.start) - timeRange.start
    : 0;
  const playbackRate = canvasDuration && annotationDuration > 0
    ? (canvasDuration / annotationDuration).toFixed(2)
    : '1.00';

  const options: Array<{ mode: TimeMode; icon: string; label: string; description: string }> = [
    {
      mode: 'trim',
      icon: 'content_cut',
      label: 'Trim',
      description: timeRange
        ? `${formatTime(timeRange.start)} to ${formatTime(timeRange.end ?? timeRange.start)}`
        : 'Play only the annotated segment',
    },
    {
      mode: 'scale',
      icon: 'speed',
      label: 'Scale',
      description: `Playback rate: ${playbackRate}x`,
    },
    {
      mode: 'loop',
      icon: 'repeat',
      label: 'Loop',
      description: loopCount === 0 ? 'Loop indefinitely' : `Loop ${loopCount} times`,
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Icon
          name="timer"
          className={`text-sm ${fieldMode ? 'text-slate-400' : 'text-slate-500'}`}
        />
        <span className={`text-xs font-semibold uppercase tracking-wider ${
          fieldMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Time Mode
        </span>
      </div>

      <div className="space-y-1" role="radiogroup" aria-label="Time mode selection">
        {options.map(opt => {
          const isActive = value === opt.mode;
          return (
            <button
              key={opt.mode}
              role="radio"
              aria-checked={isActive}
              disabled={disabled}
              onClick={() => onChange(opt.mode)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-colors ${
                isActive
                  ? fieldMode
                    ? 'border-yellow-700 bg-yellow-900/20 text-white'
                    : 'border-blue-300 bg-blue-50 text-blue-800'
                  : fieldMode
                    ? 'border-slate-700 bg-slate-800/30 text-slate-400 hover:bg-slate-800'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                isActive
                  ? fieldMode ? 'border-yellow-400' : 'border-blue-500'
                  : fieldMode ? 'border-slate-600' : 'border-slate-300'
              }`}>
                {isActive && (
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    fieldMode ? 'bg-yellow-400' : 'bg-blue-500'
                  }`} />
                )}
              </span>
              <Icon name={opt.icon} className="text-base" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{opt.label}</div>
                <div className={`text-xs ${
                  isActive
                    ? fieldMode ? 'text-yellow-400/60' : 'text-blue-500'
                    : fieldMode ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  {opt.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Loop count input (only shown when loop mode active) */}
      {value === 'loop' && onLoopCountChange && !disabled && (
        <div className="pl-9">
          <FormInput
            value={loopCount}
            onChange={(v) => onLoopCountChange(parseInt(v, 10) || 0)}
            type="number"
            label="Loop count (0 = infinite)"
            min={0}
            max={100}
            fieldMode={fieldMode}
          />
        </div>
      )}
    </div>
  );
};

export default TimeModeSelector;

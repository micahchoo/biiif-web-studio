/**
 * KeyboardShortcutsModal Molecule
 *
 * Modal displaying available keyboard shortcuts for the viewer.
 *
 * ATOMIC DESIGN COMPLIANCE:
 * - Receives cx and fieldMode via props
 * - No domain logic
 * - Pure presentation
 *
 * @module features/viewer/ui/molecules/KeyboardShortcutsModal
 */

import React from 'react';
import { Button, Icon } from '@/src/shared/ui/atoms';
import type { ContextualClassNames } from '@/src/shared/lib/hooks/useContextualStyles';

export interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cx: ContextualClassNames;
  fieldMode: boolean;
}

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{ keys: string[]; description: string }>;
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['W', '↑'], description: 'Pan up' },
      { keys: ['S', '↓'], description: 'Pan down' },
      { keys: ['A', '←'], description: 'Pan left' },
      { keys: ['D', '→'], description: 'Pan right' },
      { keys: ['0'], description: 'Reset view (home)' },
    ],
  },
  {
    title: 'Zoom',
    shortcuts: [
      { keys: ['+', '='], description: 'Zoom in' },
      { keys: ['-', '_'], description: 'Zoom out' },
      { keys: ['Double-click'], description: 'Zoom to point' },
      { keys: ['Scroll'], description: 'Zoom in/out' },
    ],
  },
  {
    title: 'Rotation & Flip',
    shortcuts: [
      { keys: ['R'], description: 'Rotate clockwise 90°' },
      { keys: ['Shift', 'R'], description: 'Rotate counter-clockwise 90°' },
      { keys: ['F'], description: 'Flip horizontally' },
    ],
  },
  {
    title: 'View Controls',
    shortcuts: [
      { keys: ['Esc'], description: 'Exit fullscreen' },
      { keys: ['N'], description: 'Toggle navigator' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
    ],
  },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  cx,
  fieldMode,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        className={`
          relative max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto
          rounded-xl shadow-2xl border
          ${fieldMode ? 'bg-stone-900 border-yellow-900/50' : 'bg-white border-slate-200'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`
            sticky top-0 flex items-center justify-between p-4 border-b
            ${fieldMode ? 'bg-stone-900 border-yellow-900/30' : 'bg-slate-50 border-slate-200'}
          `}
        >
          <div className="flex items-center gap-3">
            <Icon name="keyboard" className={fieldMode ? 'text-yellow-500' : 'text-blue-600'} />
            <h2
              id="shortcuts-title"
              className={`text-lg font-bold ${fieldMode ? 'text-yellow-100' : 'text-slate-900'}`}
            >
              Keyboard Shortcuts
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close shortcuts"
          >
            <Icon name="close" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h3
                className={`
                  text-sm font-semibold uppercase tracking-wide mb-3
                  ${fieldMode ? 'text-yellow-500' : 'text-slate-500'}
                `}
              >
                {group.title}
              </h3>
              <div className="grid gap-2">
                {group.shortcuts.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className={`
                      flex items-center justify-between py-2 px-3 rounded-lg
                      ${fieldMode ? 'bg-stone-800' : 'bg-slate-50'}
                    `}
                  >
                    <span className={fieldMode ? 'text-stone-300' : 'text-slate-700'}>
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <React.Fragment key={keyIdx}>
                          {keyIdx > 0 && (
                            <span className={`text-xs ${fieldMode ? 'text-stone-500' : 'text-slate-400'}`}>
                              /
                            </span>
                          )}
                          <kbd
                            className={`
                              px-2 py-1 text-xs font-mono font-semibold rounded
                              ${fieldMode
                                ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-700'
                                : 'bg-white text-slate-800 border border-slate-300 shadow-sm'
                              }
                            `}
                          >
                            {key}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className={`
            sticky bottom-0 p-4 border-t text-center text-sm
            ${fieldMode ? 'bg-stone-900 border-yellow-900/30 text-stone-400' : 'bg-slate-50 border-slate-200 text-slate-500'}
          `}
        >
          Press <kbd className={`px-1.5 py-0.5 rounded text-xs font-mono ${fieldMode ? 'bg-stone-800' : 'bg-white border border-slate-300'}`}>Esc</kbd> or click outside to close
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;

/**
 * KeyboardShortcutsModal Molecule
 *
 * Modal displaying available keyboard shortcuts for the viewer.
 * Uses shared ModalDialog for consistent modal behavior.
 *
 * ATOMIC DESIGN COMPLIANCE:
 * - Receives cx and fieldMode via props
 * - No domain logic
 * - Pure presentation
 *
 * @module features/viewer/ui/molecules/KeyboardShortcutsModal
 */

import React from 'react';
import { ModalDialog } from '@/src/shared/ui/molecules/ModalDialog';
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
      { keys: ['W', '\u2191'], description: 'Pan up' },
      { keys: ['S', '\u2193'], description: 'Pan down' },
      { keys: ['A', '\u2190'], description: 'Pan left' },
      { keys: ['D', '\u2192'], description: 'Pan right' },
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
      { keys: ['R'], description: 'Rotate clockwise 90\u00B0' },
      { keys: ['Shift', 'R'], description: 'Rotate counter-clockwise 90\u00B0' },
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
  const footer = (
    <div className={`text-center text-sm ${fieldMode ? 'text-stone-400' : 'text-slate-500'}`}>
      Press <kbd className={`px-1.5 py-0.5 rounded text-xs font-mono ${fieldMode ? 'bg-stone-800' : 'bg-white border border-slate-300'}`}>Esc</kbd> or click outside to close
    </div>
  );

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      icon="keyboard"
      iconColor={fieldMode ? 'bg-yellow-900/30 text-yellow-500' : 'bg-blue-100 text-blue-600'}
      size="md"
      fieldMode={fieldMode}
      footer={footer}
    >
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
    </ModalDialog>
  );
};

export default KeyboardShortcutsModal;

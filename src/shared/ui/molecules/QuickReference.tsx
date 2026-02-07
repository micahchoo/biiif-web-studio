/**
 * QuickReference Molecule
 *
 * Per-view help panel with keyboard shortcuts and actions.
 * Anchored to bottom-right, above StatusBar.
 *
 * ATOMIC DESIGN COMPLIANCE:
 * - No local state
 * - No domain logic
 * - Props-only API
 * - Uses design tokens
 *
 * @module shared/ui/molecules/QuickReference
 */

import React from 'react';
import { Button } from '@/src/shared/ui/atoms';
import { Icon } from '@/src/shared/ui/atoms/Icon';

interface QuickRefItem {
  icon: string;
  label: string;
  shortcut?: string;
  description?: string;
}

export interface QuickReferenceProps {
  title: string;
  items: QuickRefItem[];
  isOpen: boolean;
  onToggle: () => void;
}

export const QuickReference: React.FC<QuickReferenceProps> = ({ title, items, isOpen, onToggle }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-10 right-4 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
      <div className="w-72 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">{title}</h3>
          <Button variant="ghost" size="bare"
            onClick={onToggle}
            className="p-1 hover:bg-slate-200 rounded transition-colors"
            aria-label="Close quick help"
          >
            <Icon name="close" className="text-slate-500 text-sm" />
          </Button>
        </div>
        <div className="p-2 max-h-80 overflow-y-auto">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Icon name={item.icon} className="text-slate-400 text-sm mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-700">{item.label}</span>
                  {item.shortcut && (
                    <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[9px] font-mono text-slate-500">
                      {item.shortcut}
                    </kbd>
                  )}
                </div>
                {item.description && (
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickReference;

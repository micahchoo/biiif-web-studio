/**
 * BoardHeader Organism
 *
 * Header for the board-design feature.
 * Composes: Toolbar, ViewToggle molecules
 *
 * IDEAL OUTCOME: Provides tool selection, undo/redo, and export actions
 * FAILURE PREVENTED: Lost work (no undo), unclear tool state
 */

import React from 'react';
import { Icon } from '@/src/shared/ui/atoms';
import { ViewToggle } from '@/src/shared/ui/molecules/ViewToggle';
import { Toolbar } from '@/src/shared/ui/molecules/Toolbar';

export interface BoardHeaderProps {
  /** Board title */
  title: string;
  /** Currently active tool */
  activeTool: 'select' | 'connect' | 'note';
  /** Called when tool changes */
  onToolChange: (tool: 'select' | 'connect' | 'note') => void;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Undo callback */
  onUndo: () => void;
  /** Redo callback */
  onRedo: () => void;
  /** Export callback */
  onExport: () => void;
  /** Number of items on board */
  itemCount?: number;
  /** Number of connections */
  connectionCount?: number;
  /** Contextual styles from template */
  cx: {
    surface: string;
    text: string;
    accent: string;
  };
  /** Current field mode */
  fieldMode: boolean;
}

/**
 * BoardHeader Organism
 */
export const BoardHeader: React.FC<BoardHeaderProps> = ({
  title,
  activeTool,
  onToolChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExport,
  itemCount,
  connectionCount,
  cx,
  fieldMode,
}) => {
  const toolOptions = [
    { value: 'select', icon: 'mouse', label: 'Select' },
    { value: 'connect', icon: 'timeline', label: 'Connect' },
    { value: 'note', icon: 'sticky_note_2', label: 'Note' },
  ];

  return (
    <div
      className={`
        h-16 border-b px-4 flex items-center justify-between
        ${fieldMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}
      `}
    >
      {/* Left: Title + Stats */}
      <div className="flex items-center gap-4">
        <div
          className={`
            p-2 rounded-lg
            ${fieldMode ? 'bg-yellow-400/20 text-yellow-400' : 'bg-iiif-blue/10 text-iiif-blue'}
          `}
        >
          <Icon name="dashboard" className="text-xl" />
        </div>
        <div>
          <h2 className={`font-bold ${fieldMode ? 'text-yellow-400' : 'text-slate-800'}`}>
            {title}
          </h2>
          {(itemCount !== undefined || connectionCount !== undefined) && (
            <p className={`text-xs ${fieldMode ? 'text-slate-500' : 'text-slate-500'}`}>
              {itemCount !== undefined && `${itemCount} items`}
              {itemCount !== undefined && connectionCount !== undefined && ' · '}
              {connectionCount !== undefined && `${connectionCount} connections`}
            </p>
          )}
        </div>
      </div>

      {/* Center: Tool Selection */}
      <ViewToggle
        value={activeTool}
        onChange={(value) => onToolChange(value as 'select' | 'connect' | 'note')}
        options={toolOptions}
        ariaLabel="Board tools"
        cx={cx}
        fieldMode={fieldMode}
      />

      {/* Right: Actions */}
      <Toolbar>
        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`
            p-2 rounded transition-colors
            ${canUndo
              ? fieldMode
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-slate-400 cursor-not-allowed'}
          `}
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          <Icon name="undo" />
        </button>

        {/* Redo */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`
            p-2 rounded transition-colors
            ${canRedo
              ? fieldMode
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-slate-400 cursor-not-allowed'}
          `}
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo"
        >
          <Icon name="redo" />
        </button>

        <div className={`w-px h-6 ${fieldMode ? 'bg-slate-700' : 'bg-slate-200'}`} />

        {/* Export */}
        <button
          onClick={onExport}
          className={`
            flex items-center gap-2 px-3 py-2 rounded font-medium
            ${fieldMode
              ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-300'
              : 'bg-iiif-blue text-white hover:bg-blue-600'}
          `}
        >
          <Icon name="download" />
          <span>Export</span>
        </button>
      </Toolbar>
    </div>
  );
};

export default BoardHeader;

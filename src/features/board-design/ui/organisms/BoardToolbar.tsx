/**
 * BoardToolbar Organism
 *
 * Sidebar toolbar for the board-design feature.
 * Shows tool options and item actions.
 *
 * IDEAL OUTCOME: Quick access to tools and selected item actions
 * FAILURE PREVENTED: Unclear selection state, hard-to-find actions
 */

import React from 'react';
import { Icon } from '@/src/shared/ui/atoms';

export interface BoardToolbarProps {
  /** Currently active tool */
  activeTool: 'select' | 'connect' | 'note';
  /** Called when tool changes */
  onToolChange: (tool: 'select' | 'connect' | 'note') => void;
  /** Currently selected item ID */
  selectedItemId: string | null;
  /** Delete callback */
  onDelete: () => void;
  /** Contextual styles from template */
  cx: {
    surface: string;
    text: string;
    accent: string;
  };
  /** Current field mode */
  fieldMode: boolean;
}

const tools = [
  {
    id: 'select' as const,
    icon: 'mouse',
    label: 'Select',
    description: 'Select and move items',
    shortcut: 'V',
  },
  {
    id: 'connect' as const,
    icon: 'timeline',
    label: 'Connect',
    description: 'Create connections between items',
    shortcut: 'C',
  },
  {
    id: 'note' as const,
    icon: 'sticky_note_2',
    label: 'Note',
    description: 'Add text notes',
    shortcut: 'N',
  },
];

/**
 * BoardToolbar Organism
 */
export const BoardToolbar: React.FC<BoardToolbarProps> = ({
  activeTool,
  onToolChange,
  selectedItemId,
  onDelete,
  cx,
  fieldMode,
}) => {
  return (
    <div
      className={`
        w-16 flex flex-col items-center py-4 gap-2 border-r
        ${fieldMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}
      `}
    >
      {/* Tools */}
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolChange(tool.id)}
          className={`
            w-10 h-10 rounded flex items-center justify-center
            transition-all relative group
            ${activeTool === tool.id
              ? fieldMode
                ? 'bg-yellow-400 text-slate-900'
                : 'bg-iiif-blue text-white'
              : fieldMode
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'}
          `}
          title={`${tool.label} (${tool.shortcut})`}
          aria-label={tool.label}
          aria-pressed={activeTool === tool.id}
        >
          <Icon name={tool.icon} />

          {/* Tooltip */}
          <span
            className={`
              absolute left-full ml-2 px-2 py-1 rounded text-xs whitespace-nowrap
              opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50
              ${fieldMode ? 'bg-slate-800 text-white' : 'bg-slate-800 text-white'}
            `}
          >
            {tool.description}
          </span>
        </button>
      ))}

      {/* Divider */}
      <div className={`w-8 h-px my-2 ${fieldMode ? 'bg-slate-700' : 'bg-slate-200'}`} />

      {/* Selected Item Actions */}
      <button
        onClick={onDelete}
        disabled={!selectedItemId}
        className={`
          w-10 h-10 rounded flex items-center justify-center
          transition-all
          ${selectedItemId
            ? fieldMode
              ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
              : 'text-red-500 hover:text-red-600 hover:bg-red-50'
            : 'text-slate-400 cursor-not-allowed'}
        `}
        title={selectedItemId ? 'Delete selected (Delete)' : 'No item selected'}
        aria-label="Delete selected"
      >
        <Icon name="delete" />
      </button>
    </div>
  );
};

export default BoardToolbar;

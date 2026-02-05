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
import { Button } from '@/ui/primitives/Button';

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
  cx: _cx,
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
        <Button
          key={tool.id}
          onClick={() => onToolChange(tool.id)}
          variant={activeTool === tool.id ? 'primary' : 'ghost'}
          size="sm"
          icon={<Icon name={tool.icon} />}
          title={`${tool.label} (${tool.shortcut})`}
          aria-label={tool.label}
          aria-pressed={activeTool === tool.id}
          className="w-10 h-10"
        />
      ))}

      {/* Divider */}
      <div className={`w-8 h-px my-2 ${fieldMode ? 'bg-slate-700' : 'bg-slate-200'}`} />

      {/* Selected Item Actions */}
      <Button
        onClick={selectedItemId ? onDelete : undefined}
        variant="ghost"
        size="sm"
        disabled={!selectedItemId}
        icon={<Icon name="delete" />}
        title={selectedItemId ? 'Delete selected (Delete)' : 'No item selected'}
        aria-label="Delete selected"
        className="w-10 h-10"
      />
    </div>
  );
};

export default BoardToolbar;

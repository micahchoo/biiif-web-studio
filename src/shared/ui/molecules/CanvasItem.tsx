/**
 * CanvasItem Molecule
 *
 * Reusable canvas item component for displaying thumbnails with labels.
 * Used in staging, archive, and viewer features.
 *
 * ATOMIC DESIGN COMPLIANCE:
 * - Zero context hooks - all data via props
 * - No domain imports - purely presentational
 * - Supports drag-drop visual states
 *
 * IDEAL OUTCOME: Consistent canvas representation across features
 * FAILURE PREVENTED: Inconsistent thumbnails, broken drag-drop UX
 *
 * @module shared/ui/molecules/CanvasItem
 */

import React, { useEffect, useState } from 'react';
import { Icon } from '../atoms';
import type { ContextualClassNames } from '@/src/shared/lib/hooks/useContextualStyles';

export interface CanvasItemProps {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Thumbnail URL */
  thumbnailUrl?: string | null;
  /** Index for display */
  index: number;
  /** Whether item is selected */
  isSelected?: boolean;
  /** Whether item is a drag target */
  isDragTarget?: boolean;
  /** Whether item is being dragged */
  isDragging?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Called when item is clicked */
  onSelect?: (e: React.MouseEvent) => void;
  /** Called when drag starts */
  onDragStart?: (e: React.DragEvent) => void;
  /** Called when drag ends */
  onDragEnd?: (e: React.DragEvent) => void;
  /** Called when dragged over */
  onDragOver?: (e: React.DragEvent) => void;
  /** Called when dropped */
  onDrop?: (e: React.DragEvent) => void;
  /** Called on double click */
  onDoubleClick?: () => void;
  /** Keyboard navigation ID */
  navId?: string;
  /** Tab index for keyboard nav */
  tabIndex?: number;
  cx?: ContextualClassNames;
  fieldMode?: boolean;
}

/**
 * CanvasItem Molecule
 *
 * Displays a canvas with thumbnail, index badge, and selection state.
 * Supports drag-drop interactions and keyboard navigation.
 *
 * @example
 * <CanvasItem
 *   id="canvas-1"
 *   label="Page 1"
 *   thumbnailUrl="https://example.com/thumb.jpg"
 *   index={0}
 *   isSelected={selectedId === 'canvas-1'}
 *   onSelect={handleSelect}
 *   onDragStart={handleDragStart}
 * />
 */
export const CanvasItem: React.FC<CanvasItemProps> = ({
  id,
  label,
  thumbnailUrl,
  index,
  isSelected = false,
  isDragTarget = false,
  isDragging = false,
  className = '',
  onSelect,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onDoubleClick,
  navId,
  tabIndex = -1,
  cx,
  fieldMode: _fieldMode,
}) => {
  const [imageError, setImageError] = useState(false);

  // Reset error state when thumbnail URL changes
  useEffect(() => {
    setImageError(false);
  }, [thumbnailUrl]);

  return (
    <div
      data-canvas-id={id}
      data-nav-id={navId || id}
      data-nav-index={index}
      draggable={!!onDragStart}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      tabIndex={tabIndex}
      className={`
        group relative flex items-center gap-3 p-2 rounded-lg cursor-pointer
        transition-all duration-150 ease-in-out
        ${isSelected
          ? 'bg-blue-100 border-2 border-blue-500 shadow-sm'
          : `border ${cx?.surface ?? 'bg-white border-slate-200'} hover:shadow-sm`
        }
        ${isDragTarget ? 'border-blue-500 border-dashed bg-blue-50' : ''}
        ${isDragging ? 'opacity-50' : ''}
        ${className}
      `}
    >
      {/* Drag handle (visible on hover when draggable) */}
      {onDragStart && (
        <div className={`flex-shrink-0 cursor-grab active:cursor-grabbing ${cx?.textMuted ?? 'text-slate-400'} hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity`}>
          <Icon name="drag_indicator" className="text-lg" />
        </div>
      )}

      {/* Index badge */}
      <span className={`flex-shrink-0 w-7 h-7 ${cx?.subtleBg ?? 'bg-slate-100'} rounded-md text-[11px] font-bold ${cx?.textMuted ?? 'text-slate-500'} flex items-center justify-center`}>
        {index + 1}
      </span>

      {/* Thumbnail */}
      <div className={`flex-shrink-0 w-12 h-12 ${cx?.thumbnailBg ?? 'bg-slate-100'} rounded-md overflow-hidden flex items-center justify-center`}>
        {thumbnailUrl && !imageError ? (
          <img
            src={thumbnailUrl}
            alt={label}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <Icon name="image" className={`text-xl ${cx?.placeholderIcon ?? 'text-slate-400'}`} />
        )}
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${cx?.subtleText ?? 'text-slate-700'} truncate`} title={label}>
          {label}
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="flex-shrink-0">
          <Icon name="check_circle" className="text-blue-500 text-lg" />
        </div>
      )}
    </div>
  );
};

export default CanvasItem;

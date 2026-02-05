/**
 * SourcePane Molecule
 *
 * Left pane for staging workbench showing source manifests with drag-drop.
 * Extracted from legacy components/staging/SourcePane.tsx.
 *
 * ATOMIC DESIGN COMPLIANCE:
 * - Receives data via props (zero context hooks)
 * - Composes CanvasItem molecule from shared
 * - Uses useDragDrop hook from shared/lib
 *
 * IDEAL OUTCOME: Users can manage source manifests with drag-drop
 * FAILURE PREVENTED: Broken selection, lost drag state, poor keyboard nav
 *
 * @module features/staging/ui/molecules/SourcePane
 */

import React, { useCallback, useMemo, useRef } from 'react';
import type { SourceManifest, SourceManifests } from '@/types';
import { Icon } from '@/src/shared/ui/atoms';
import { Button } from '@/ui/primitives/Button';
import type { ContextualClassNames } from '@/hooks/useContextualStyles';
import { CanvasItem } from '@/src/shared/ui/molecules/CanvasItem';
import { useDragDrop } from '@/src/shared/lib';

export interface SourcePaneProps {
  /** Source manifests to display */
  sourceManifests: SourceManifests;
  /** Currently selected manifest IDs */
  selectedIds: string[];
  /** ID of focused manifest for keyboard nav */
  focusedId?: string | null;
  /** Filter text for search */
  filterText?: string;
  /** Whether pane has keyboard focus */
  isFocused?: boolean;
  /** Called when selection changes */
  onSelect: (id: string, metaKey?: boolean, shiftKey?: boolean) => void;
  /** Called when selection is cleared */
  onClearSelection: () => void;
  /** Called when drag starts */
  onDragStart?: (manifestId: string) => void;
  /** Called when manifests are reordered */
  onReorder?: (manifestIds: string[]) => void;
  /** Called when filter changes */
  onFilterChange?: (text: string) => void;
  /** Additional CSS classes */
  className?: string;
  cx?: ContextualClassNames;
  fieldMode?: boolean;
}

/**
 * SourcePane Molecule
 *
 * Displays source manifests with selection, filtering, and drag-drop support.
 *
 * @example
 * <SourcePane
 *   sourceManifests={manifests}
 *   selectedIds={selectedIds}
 *   onSelect={handleSelect}
 *   onReorder={handleReorder}
 *   onFilterChange={setFilter}
 * />
 */
export const SourcePane: React.FC<SourcePaneProps> = ({
  sourceManifests,
  selectedIds,
  focusedId,
  filterText = '',
  isFocused = false,
  onSelect,
  onClearSelection,
  onDragStart,
  onReorder,
  onFilterChange,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter manifests
  const filteredManifests = useMemo(() => {
    const manifests = sourceManifests.manifests || [];
    if (!filterText.trim()) return manifests;

    const lower = filterText.toLowerCase();
    return manifests.filter(
      (m) =>
        m.name.toLowerCase().includes(lower) ||
        m.breadcrumbs.some((b) => b.toLowerCase().includes(lower))
    );
  }, [sourceManifests.manifests, filterText]);

  // Extract manifest IDs for drag-drop
  const manifestIds = useMemo(
    () => filteredManifests.map((m) => m.id),
    [filteredManifests]
  );

  // Handle reorder
  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!onReorder) return;

      const reordered = [...manifestIds];
      const [removed] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, removed);
      onReorder(reordered);
    },
    [manifestIds, onReorder]
  );

  // Drag-drop hook
  const { handleDragStart: dragStart, handleDragEnd, getDragState, reorderItems: _reorderItems } = useDragDrop<SourceManifest>({
    containerRef,
    itemIds: manifestIds,
    onReorder: handleReorder,
    multiSelect: true,
    selectedIds,
  });

  // Custom drag start handler
  const handleDragStart = useCallback(
    (e: React.DragEvent, manifest: SourceManifest, index: number) => {
      const idsToDrag = selectedIds.includes(manifest.id) ? selectedIds : [manifest.id];
      e.dataTransfer.setData('application/iiif-manifest-ids', JSON.stringify(idsToDrag));
      e.dataTransfer.effectAllowed = 'copyMove';

      dragStart(e, { id: manifest.id, data: manifest, index });
      onDragStart?.(manifest.id);
    },
    [dragStart, onDragStart, selectedIds]
  );

  // Stats
  const stats = useMemo(() => {
    const manifests = sourceManifests.manifests || [];
    return {
      totalManifests: manifests.length,
      totalFiles: manifests.reduce((sum, m) => sum + (m.files?.length || 0), 0),
      filteredCount: filteredManifests.length,
    };
  }, [sourceManifests.manifests, filteredManifests.length]);

  // Handle canvas item selection
  const handleItemSelect = useCallback(
    (manifest: SourceManifest, e: React.MouseEvent) => {
      onSelect(manifest.id, e.metaKey || e.ctrlKey, e.shiftKey);
    },
    [onSelect]
  );

  return (
    <div
      ref={containerRef}
      className={`
        flex flex-col h-full border-r transition-colors
        ${isFocused ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200 bg-white'}
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Icon name="source" className="text-blue-500" />
              Source Files
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Drag to collections or reorder
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-slate-800">{stats.totalManifests}</div>
            <div className="text-[10px] text-slate-400">{stats.totalFiles} files</div>
          </div>
        </div>

        {/* Filter input */}
        {onFilterChange && (
          <div className="relative">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
            />
            <input
              type="text"
              value={filterText}
              onChange={(e) => onFilterChange(e.target.value)}
              placeholder="Filter manifests..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {filterText && (
              <Button
                onClick={() => onFilterChange('')}
                variant="ghost"
                size="sm"
                icon={<Icon name="close" className="text-sm" />}
                aria-label="Clear filter"
                className="absolute right-3 top-1/2 -translate-y-1/2"
              />
            )}
          </div>
        )}

        {/* Filter stats */}
        {filterText && (
          <div className="mt-2 text-[11px] text-slate-500">
            Showing {stats.filteredCount} of {stats.totalManifests}
          </div>
        )}
      </div>

      {/* Manifest list */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-2"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClearSelection();
          }
        }}
      >
        {filteredManifests.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Icon name="folder_open" className="text-4xl mb-2 opacity-50" />
            <p className="text-sm">
              {filterText ? 'No manifests match your filter' : 'No source manifests'}
            </p>
          </div>
        ) : (
          filteredManifests.map((manifest, index) => {
            const dragState = getDragState(manifest.id);

            return (
              <CanvasItem
                key={manifest.id}
                id={manifest.id}
                label={manifest.name}
                thumbnailUrl={(manifest as any).thumbnail}
                index={index}
                isSelected={selectedIds.includes(manifest.id)}
                isDragTarget={dragState.isDragOver}
                isDragging={dragState.isDragging}
                onSelect={(e) => handleItemSelect(manifest, e as unknown as React.MouseEvent)}
                onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, manifest, index)}
                onDragEnd={handleDragEnd}
                navId={manifest.id}
                tabIndex={focusedId === manifest.id ? 0 : -1}
              />
            );
          })
        )}
      </div>

      {/* Selection toolbar */}
      {selectedIds.length > 0 && (
        <div className="flex-shrink-0 p-3 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">
              {selectedIds.length} selected
            </span>
            <div
              onClick={onClearSelection}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SourcePane;

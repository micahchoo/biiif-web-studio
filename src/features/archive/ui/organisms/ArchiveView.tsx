/**
 * ArchiveView Organism
 *
 * Main organism for the archive feature. Composes ArchiveHeader, ArchiveGrid, and ArchiveList.
 * Receives cx and fieldMode via template render props, eliminating prop drilling.
 *
 * IDEAL OUTCOME: Archive view provides browsing, filtering, selection, and view switching
 * FAILURE PREVENTED: No fieldMode prop drilling, no hardcoded constants, consistent styling
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type IIIFCanvas, type IIIFCollection, type IIIFItem, isCanvas } from '@/types';
import { ValidationIssue } from '@/services/validator';
// LEGACY: Toast hook - will move to shared/hooks or app/providers
import { useToast } from '@/components/Toast';
import { useGridVirtualization, useIIIFTraversal, useResponsive, useSharedSelection } from '@/hooks';
import { IIIF_CONFIG, IIIF_SPEC } from '@/constants';
import { isValidChildType } from '@/utils/iiifHierarchy';
import { ContextMenu, type ContextMenuSection } from '@/src/shared/ui/molecules';
import { createLanguageMap, generateUUID } from '@/utils/iiifTypes';
import { ArchiveHeader } from './ArchiveHeader';
import { ArchiveGrid } from './ArchiveGrid';
import { type ArchiveViewMode, filterByTerm, getSelectionDNA, loadViewMode, saveViewMode, sortCanvases, type SortMode } from '../../model';

export interface ArchiveViewProps {
  /** Root IIIF item (Collection or Manifest) */
  root: IIIFItem | null;
  /** Called when a single item is selected (e.g., for preview) */
  onSelect: (item: IIIFItem) => void;
  /** Called when an item is opened (e.g., in viewer) */
  onOpen: (item: IIIFItem) => void;
  /** Called with selected IDs for batch editing */
  onBatchEdit: (ids: string[]) => void;
  /** Called when root is updated (e.g., after grouping) */
  onUpdate?: (newRoot: IIIFItem) => void;
  /** Validation issues keyed by item ID */
  validationIssues?: Record<string, ValidationIssue[]>;
  /** Reveal an item in a specific mode */
  onReveal?: (id: string, mode: 'collections' | 'viewer' | 'archive') => void;
  /** Called when selection should be sent to catalog */
  onCatalogSelection?: (ids: string[]) => void;
  /** Delegate view-mode switch to router (map, timeline, etc.) */
  onSwitchView?: (mode: string) => void;
  /** Contextual styles from template */
  cx: {
    surface: string;
    text: string;
    accent: string;
    border: string;
    divider: string;
    headerBg: string;
    textMuted: string;
    input: string;
    label: string;
    active: string;
    inactive: string;
    warningBg: string;
    pageBg: string;
  };
  /** Current field mode */
  fieldMode: boolean;
  /** Terminology function from template */
  t: (key: string) => string;
  /** Whether user is in advanced mode */
  isAdvanced: boolean;
}

/**
 * ArchiveView Organism
 *
 * @example
 * <FieldModeTemplate>
 *   {({ cx, fieldMode, t, isAdvanced }) => (
 *     <ArchiveView
 *       root={root}
 *       onSelect={handleSelect}
 *       onOpen={handleOpen}
 *       onBatchEdit={handleBatchEdit}
 *       onUpdate={handleUpdate}
 *       cx={cx}
 *       fieldMode={fieldMode}
 *       t={t}
 *       isAdvanced={isAdvanced}
 *     />
 *   )}
 * </FieldModeTemplate>
 */
export const ArchiveView: React.FC<ArchiveViewProps> = ({
  root,
  onSelect,
  onOpen,
  onBatchEdit,
  onUpdate,
  validationIssues: _validationIssues = {},
  onReveal: _onReveal,
  onCatalogSelection,
  onSwitchView,
  cx,
  fieldMode,
  t: _t,
  isAdvanced: _isAdvanced,
}) => {
  const { showToast } = useToast();
  const { isMobile } = useResponsive();

  // Load persisted view mode from localStorage
  const [view, setView] = useState<ArchiveViewMode>(loadViewMode);
  // Persist view mode changes
  useEffect(() => {
    saveViewMode(view);
  }, [view]);

  // Filter and sort state
  const [filter, setFilter] = useState('');
  const [sortBy] = useState<SortMode>('name');

  // Active item (for detail panel)
  const [activeItem, setActiveItem] = useState<IIIFCanvas | null>(null);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    targetId: string;
    isMulti?: boolean;
  } | null>(null);

  // Use shared selection hook for cross-view persistence
  const {
    selectedIds,
    handleSelectWithModifier,
    select,
    clear: clearSelection,
    isSelected,
  } = useSharedSelection();

  // Use IIIF traversal hook for efficient tree operations
  const { getAllCanvases } = useIIIFTraversal(root);

  // Get all canvases
  const allCanvases = useMemo(() => getAllCanvases(), [getAllCanvases]);

  // Filter and sort canvases
  const filteredCanvases = useMemo(() => {
    const filtered = filterByTerm(allCanvases, filter);
    return sortCanvases(filtered, sortBy);
  }, [allCanvases, filter, sortBy]);

  // Selected canvases
  const selectedCanvases = useMemo(() => allCanvases.filter(c => isSelected(c.id)), [allCanvases, isSelected]);

  // Selection DNA
  const selectionDNA = useMemo(() => getSelectionDNA(selectedCanvases), [selectedCanvases]);

  // Update active item when selection changes
  useEffect(() => {
    if (selectedIds.size === 1) {
      const id = Array.from(selectedIds)[0];
      const item = allCanvases.find(a => a.id === id);
      setActiveItem(item || null);
    } else if (selectedIds.size > 1) {
      if (!activeItem || !selectedIds.has(activeItem.id)) {
        const firstId = Array.from(selectedIds)[0];
        const firstItem = allCanvases.find(a => a.id === firstId);
        setActiveItem(firstItem || null);
      }
    } else {
      setActiveItem(null);
    }
  }, [selectedIds, allCanvases, activeItem]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Virtualization for grid view
  const gridItemSize = useMemo(() => {
    if (activeItem && !isMobile) return { width: 160, height: 180 };
    if (fieldMode) return { width: 200, height: 220 };
    return { width: 140, height: 160 };
  }, [activeItem, isMobile, fieldMode]);

  const { visibleRange: gridVisibleRange, columns: gridColumns } = useGridVirtualization({
    totalItems: filteredCanvases.length,
    itemSize: gridItemSize,
    containerRef: scrollContainerRef,
    overscan: 3,
  });


  // Handlers
  const handleFilterChange = useCallback((value: string) => {
    setFilter(value);
  }, []);

  const handleViewChange = useCallback((newView: ArchiveViewMode) => {
    // map/timeline are sibling features — delegate to router
    if (newView === 'map' || newView === 'timeline') {
      onSwitchView?.(newView);
      return;
    }
    setView(newView);
  }, [onSwitchView]);

  const handleClearFilter = useCallback(() => {
    setFilter('');
  }, []);

  const handleItemClick = useCallback((e: React.MouseEvent, asset: IIIFCanvas) => {
    handleSelectWithModifier(asset.id, e, filteredCanvases);
    if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
      onSelect(asset);
    }
  }, [handleSelectWithModifier, filteredCanvases, onSelect]);

  const handleContextMenu = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const isMulti = selectedIds.size > 1 && selectedIds.has(id);
    setContextMenu({ x: e.clientX, y: e.clientY, targetId: id, isMulti });
  }, [selectedIds]);

  const handleCreateManifestFromSelection = useCallback((specificIds?: string[]) => {
    const idsToGroup = specificIds && specificIds.length > 0
      ? new Set(specificIds)
      : selectedIds;

    if (!root || !onUpdate || idsToGroup.size === 0) return;
    const newRoot = JSON.parse(JSON.stringify(root)) as IIIFCollection;
    const canvasesToMove: any[] = [];

    // Validate that selected items are Canvases (the only valid child of Manifest)
    const removeCanvases = (parent: any) => {
      const list = parent.items || parent.annotations || [];
      for (let i = list.length - 1; i >= 0; i--) {
        const item = list[i];
        if (idsToGroup.has(item.id)) {
          if (isCanvas(item) && isValidChildType('Manifest', item.type)) {
            canvasesToMove.push(list.splice(i, 1)[0]);
          } else {
            console.warn(`Cannot move ${item.type} into Manifest - only Canvas is valid`);
          }
        } else if (item.items || item.annotations) {
          removeCanvases(item);
        }
      }
    };

    removeCanvases(newRoot);

    if (canvasesToMove.length === 0) {
      showToast('No Canvases selected - only Canvases can be grouped into a Manifest', 'error');
      return;
    }

    const baseUrl = IIIF_CONFIG.BASE_URL.DEFAULT;
    const manifestId = IIIF_CONFIG.ID_PATTERNS.MANIFEST(baseUrl, generateUUID());

    const newManifest: any = {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- IIIF Presentation 3 JSON-LD spec key
      '@context': IIIF_SPEC.PRESENTATION_3.CONTEXT,
      id: manifestId,
      type: 'Manifest',
      label: createLanguageMap('Selection Bundle'),
      items: canvasesToMove,
      behavior: ['individuals'],
    };

    if (!newRoot.items) newRoot.items = [];
    if (isValidChildType(newRoot.type, 'Manifest')) {
      newRoot.items.push(newManifest);
      onUpdate(newRoot);
      select(manifestId);
      showToast(`Grouped ${canvasesToMove.length} Canvases into new Manifest`, 'success');
    } else {
      showToast(`Cannot add Manifest to ${newRoot.type}`, 'error');
    }
  }, [root, onUpdate, selectedIds, select, showToast]);

  const handleOpenMap = useCallback(() => {
    onSwitchView?.('map');
  }, [onSwitchView]);

  const handleEditMetadata = useCallback(() => {
    onCatalogSelection?.(Array.from(selectedIds));
  }, [selectedIds, onCatalogSelection]);

  const handleBatchEdit = useCallback(() => {
    onBatchEdit(Array.from(selectedIds));
  }, [selectedIds, onBatchEdit]);

  // Render based on view mode
  const renderContentView = () => {
    switch (view) {
      case 'grid':
        return (
          <ArchiveGrid
            items={filteredCanvases}
            visibleRange={gridVisibleRange}
            columns={gridColumns}
            itemSize={gridItemSize}
            isSelected={isSelected}
            onItemClick={handleItemClick}
            onContextMenu={handleContextMenu}
            cx={cx}
            fieldMode={fieldMode}
            isMobile={isMobile}
            activeItem={activeItem}
            filter={filter}
            onClearFilter={handleClearFilter}
          />
        );
      case 'list':
        // TODO: Create ArchiveList organism
        return (
          <div className="p-6">
            <div className="text-center text-slate-500">List view not yet implemented</div>
          </div>
        );
      // map / timeline are handled by handleViewChange → router delegation
      case 'map':
      case 'timeline':
        return null;
      default:
        return null;
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full relative overflow-hidden ${cx.pageBg}`}>
      <ArchiveHeader
        filter={filter}
        onFilterChange={handleFilterChange}
        view={view}
        onViewChange={handleViewChange}
        isMobile={isMobile}
        selectedCount={selectedIds.size}
        selectionHasGPS={selectionDNA.hasGPS}
        onClearSelection={clearSelection}
        onGroupIntoManifest={handleCreateManifestFromSelection}
        onOpenMap={handleOpenMap}
        onEditMetadata={handleEditMetadata}
        onBatchEdit={handleBatchEdit}
        cx={cx}
        fieldMode={fieldMode}
      />

      <div
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto custom-scrollbar pb-24 ${view === 'map' || view === 'timeline' ? 'p-0' : 'p-6'} transition-all duration-300 ${!isMobile && activeItem ? 'w-1/3 max-w-sm border-r border-slate-200' : ''}`}
      >
        {renderContentView()}
      </div>

      {/* Context Menu */}
      {contextMenu && (() => {
        const sections: ContextMenuSection[] = [
          {
            items: [
              {
                id: 'open',
                label: 'Open',
                icon: 'visibility',
                onClick: () => {
                  onOpen(allCanvases.find(c => c.id === contextMenu.targetId) as IIIFItem);
                  setContextMenu(null);
                }
              },
              {
                id: 'group-into-manifest',
                label: 'Group into Manifest',
                icon: 'account_tree',
                onClick: () => {
                  handleCreateManifestFromSelection([contextMenu.targetId]);
                  setContextMenu(null);
                }
              }
            ]
          }
        ];
        return (
          <ContextMenu
            isOpen={true}
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            sections={sections}
            selectionCount={contextMenu.isMulti ? selectedIds.size : 1}
            fieldMode={fieldMode}
          />
        );
      })()}
    </div>
  );
};

export default ArchiveView;
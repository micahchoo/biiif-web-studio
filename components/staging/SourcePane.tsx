
import React, { useState, useCallback, useMemo } from 'react';
import { SourceManifests, SourceManifest } from '../../types';
import { Icon } from '../Icon';
import { SourceManifestItem } from './SourceManifestItem';
import { findSimilarFiles } from '../../utils/filenameUtils';

interface SourcePaneProps {
  sourceManifests: SourceManifests;
  selectedIds: string[];
  onToggleSelection: (id: string) => void;
  onSelectRange: (fromId: string, toId: string) => void;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onReorderCanvases: (manifestId: string, newOrder: string[]) => void;
  onDragStart: (e: React.DragEvent, manifestIds: string[]) => void;
  onFocus: () => void;
  isFocused: boolean;
}

export const SourcePane: React.FC<SourcePaneProps> = ({
  sourceManifests,
  selectedIds,
  onToggleSelection,
  onSelectRange,
  onClearSelection,
  onSelectAll,
  onReorderCanvases,
  onDragStart,
  onFocus,
  isFocused
}) => {
  const [filterText, setFilterText] = useState('');
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [selectedCanvasIndices, setSelectedCanvasIndices] = useState<Map<string, number[]>>(new Map());

  // Filter manifests
  const filteredManifests = useMemo(() => {
    if (!filterText.trim()) return sourceManifests.manifests;
    const lower = filterText.toLowerCase();
    return sourceManifests.manifests.filter(m =>
      m.name.toLowerCase().includes(lower) ||
      m.breadcrumbs.some(b => b.toLowerCase().includes(lower))
    );
  }, [sourceManifests.manifests, filterText]);

  // Get all manifest IDs for range selection
  const allIds = useMemo(() => filteredManifests.map(m => m.id), [filteredManifests]);

  // Handle manifest selection
  const handleManifestSelect = useCallback((manifest: SourceManifest, e: React.MouseEvent) => {
    onFocus();

    if (e.shiftKey && lastSelectedId) {
      // Range selection
      onSelectRange(lastSelectedId, manifest.id);
    } else if (e.ctrlKey || e.metaKey) {
      // Toggle selection
      onToggleSelection(manifest.id);
    } else {
      // Single selection - clear others
      onClearSelection();
      onToggleSelection(manifest.id);
    }
    setLastSelectedId(manifest.id);
  }, [lastSelectedId, onFocus, onSelectRange, onToggleSelection, onClearSelection]);

  // Handle canvas selection within a manifest
  const handleCanvasSelect = useCallback((manifestId: string, index: number, e: React.MouseEvent) => {
    const current = selectedCanvasIndices.get(manifestId) || [];

    if (e.ctrlKey || e.metaKey) {
      // Toggle
      const newIndices = current.includes(index)
        ? current.filter(i => i !== index)
        : [...current, index];
      setSelectedCanvasIndices(new Map(selectedCanvasIndices).set(manifestId, newIndices));
    } else {
      // Single selection
      setSelectedCanvasIndices(new Map([[manifestId, [index]]]));
    }
  }, [selectedCanvasIndices]);

  // Handle drag start for manifests
  const handleDragStart = useCallback((e: React.DragEvent, manifestId: string) => {
    const idsToSend = selectedIds.includes(manifestId) ? selectedIds : [manifestId];
    e.dataTransfer.setData('application/iiif-manifest-ids', JSON.stringify(idsToSend));
    e.dataTransfer.effectAllowed = 'copyMove';
    onDragStart(e, idsToSend);
  }, [selectedIds, onDragStart]);

  // Stats
  const stats = useMemo(() => ({
    totalManifests: sourceManifests.manifests.length,
    totalFiles: sourceManifests.manifests.reduce((sum, m) => sum + m.files.length, 0),
    patternsDetected: sourceManifests.manifests.filter(m => m.detectedPattern).length
  }), [sourceManifests.manifests]);

  return (
    <div
      className={`
        flex flex-col h-full border-r transition-colors
        ${isFocused ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200 bg-white'}
      `}
      onClick={onFocus}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Icon name="source" className="text-blue-500" />
              Source Manifests
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Preserved structure from your uploaded folder
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-slate-800">{stats.totalManifests}</div>
            <div className="text-[10px] text-slate-400">{stats.totalFiles} files</div>
          </div>
        </div>

        {/* Filter */}
        <div className="relative">
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter manifests..."
            className="w-full pl-8 pr-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:bg-white transition-colors"
          />
          <Icon name="search" className="absolute left-2.5 top-2.5 text-slate-400 text-sm" />
          {filterText && (
            <button
              onClick={() => setFilterText('')}
              className="absolute right-2 top-2 p-0.5 rounded hover:bg-slate-200"
            >
              <Icon name="close" className="text-sm text-slate-400" />
            </button>
          )}
        </div>

        {/* Selection actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-medium text-blue-600">
              {selectedIds.length} selected
            </span>
            <button
              onClick={onClearSelection}
              className="text-[11px] text-slate-500 hover:text-slate-700 underline"
            >
              Clear
            </button>
            <button
              onClick={onSelectAll}
              className="text-[11px] text-slate-500 hover:text-slate-700 underline"
            >
              Select All
            </button>
          </div>
        )}

        {/* Pattern detection summary */}
        {stats.patternsDetected > 0 && (
          <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-700 flex items-center gap-2">
            <Icon name="auto_awesome" className="text-emerald-500" />
            {stats.patternsDetected} manifest{stats.patternsDetected !== 1 ? 's' : ''} with detected sequence patterns
          </div>
        )}
      </div>

      {/* Manifest list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredManifests.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Icon name="folder_off" className="text-4xl mb-2" />
            <p className="text-sm">
              {filterText ? 'No manifests match your filter' : 'No manifests found'}
            </p>
          </div>
        ) : (
          filteredManifests.map((manifest) => (
            <SourceManifestItem
              key={manifest.id}
              manifest={manifest}
              isSelected={selectedIds.includes(manifest.id)}
              selectedCanvasIndices={selectedCanvasIndices.get(manifest.id) || []}
              onSelect={(e) => handleManifestSelect(manifest, e)}
              onCanvasSelect={(index, e) => handleCanvasSelect(manifest.id, index, e)}
              onReorderCanvases={(newOrder) => onReorderCanvases(manifest.id, newOrder)}
              onDragStart={(e) => handleDragStart(e, manifest.id)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-3 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-500">
        <div className="flex items-center justify-between">
          <span>
            Imported: {new Date(sourceManifests.createdAt).toLocaleString()}
          </span>
          <span className="font-medium">
            {sourceManifests.rootPath}
          </span>
        </div>
      </div>
    </div>
  );
};

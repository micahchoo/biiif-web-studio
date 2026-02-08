/**
 * useStagingState Hook
 *
 * Manages state for the staging workbench including selection, collections,
 * and manifest organization.
 */

import { useCallback, useMemo, useState } from 'react';
import type { SourceManifest, SourceManifests } from '@/src/shared/types';

export interface ArchiveLayout {
  root: {
    id: string;
    name: string;
    children: ArchiveNode[];
  };
}

export interface ArchiveNode {
  id: string;
  name: string;
  type: 'collection' | 'manifest';
  children?: ArchiveNode[];
  manifestIds?: string[];
}

export interface UseStagingStateReturn {
  selectedIds: string[];
  toggleSelection: (id: string) => void;
  selectRange: (from: string, to: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  focusedPane: 'source' | 'archive';
  setFocusedPane: (pane: 'source' | 'archive') => void;
  createNewCollection: (name: string) => string;
  addToCollection: (collectionId: string, manifestIds: string[]) => void;
  removeFromCollection: (collectionId: string, manifestIds: string[]) => void;
  renameCollectionAction: (collectionId: string, newName: string) => void;
  deleteCollectionAction: (collectionId: string) => void;
  reorderCanvases: (collectionId: string, canvasIds: string[], newIndex: number) => void;
  getAllCollectionsList: () => ArchiveNode[];
  getManifest: (manifestId: string) => SourceManifest | undefined;
  archiveLayout: ArchiveLayout;
  sourceManifests: SourceManifests;
  hasUnassigned: boolean;
}

export function useStagingState(initialSourceManifests: SourceManifests): UseStagingStateReturn {
  const [sourceManifests, setSourceManifests] = useState(initialSourceManifests);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [focusedPane, setFocusedPane] = useState<'source' | 'archive'>('source');
  const [collections, setCollections] = useState<Map<string, ArchiveNode>>(new Map());

  // Initialize collections from source manifests, grouped by top-level breadcrumb folder
  useMemo(() => {
    const newCollections = new Map<string, ArchiveNode>();
    const folderManifests = new Map<string, string[]>();

    sourceManifests.manifests.forEach((manifest) => {
      const folderName = manifest.breadcrumbs.length > 0
        ? manifest.breadcrumbs[0]
        : 'Root Files';
      if (!folderManifests.has(folderName)) {
        folderManifests.set(folderName, []);
      }
      folderManifests.get(folderName)!.push(manifest.id);
    });

    let idx = 0;
    folderManifests.forEach((manifestIds, folderName) => {
      const collectionId = `collection-${idx}`;
      newCollections.set(collectionId, {
        id: collectionId,
        name: folderName,
        type: 'collection',
        children: [],
        manifestIds
      });
      idx++;
    });

    setCollections(newCollections);
  }, [sourceManifests]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  const selectRange = useCallback((from: string, to: string) => {
    const allIds = sourceManifests.manifests.map(m => m.id);
    const fromIndex = allIds.indexOf(from);
    const toIndex = allIds.indexOf(to);

    if (fromIndex === -1 || toIndex === -1) return;

    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);
    const rangeIds = allIds.slice(start, end + 1);

    setSelectedIds(rangeIds);
  }, [sourceManifests.manifests]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(sourceManifests.manifests.map(m => m.id));
  }, [sourceManifests.manifests]);

  const createNewCollection = useCallback((name: string): string => {
    const id = `collection-${Date.now()}`;
    setCollections(prev => {
      const updated = new Map(prev);
      updated.set(id, {
        id,
        name,
        type: 'collection',
        children: [],
        manifestIds: []
      });
      return updated;
    });
    return id;
  }, []);

  const addToCollection = useCallback((collectionId: string, manifestIds: string[]) => {
    setCollections(prev => {
      const updated = new Map(prev);
      const collection = updated.get(collectionId);
      if (collection) {
        collection.manifestIds = Array.from(new Set([...(collection.manifestIds || []), ...manifestIds]));
      }
      return updated;
    });
  }, []);

  const removeFromCollection = useCallback((collectionId: string, manifestIds: string[]) => {
    setCollections(prev => {
      const updated = new Map(prev);
      const collection = updated.get(collectionId);
      if (collection && collection.manifestIds) {
        collection.manifestIds = collection.manifestIds.filter(id => !manifestIds.includes(id));
      }
      return updated;
    });
  }, []);

  const renameCollectionAction = useCallback((collectionId: string, newName: string) => {
    setCollections(prev => {
      const updated = new Map(prev);
      const collection = updated.get(collectionId);
      if (collection) {
        collection.name = newName;
      }
      return updated;
    });
  }, []);

  const deleteCollectionAction = useCallback((collectionId: string) => {
    setCollections(prev => {
      const updated = new Map(prev);
      updated.delete(collectionId);
      return updated;
    });
  }, []);

  const reorderCanvases = useCallback(
    (collectionId: string, canvasIds: string[], newIndex: number) => {
      setCollections(prev => {
        const updated = new Map(prev);
        const collection = updated.get(collectionId);
        if (collection && collection.manifestIds) {
          // Remove the canvases from current position
          const filtered = collection.manifestIds.filter(id => !canvasIds.includes(id));
          // Insert at new position
          filtered.splice(newIndex, 0, ...canvasIds);
          collection.manifestIds = filtered;
        }
        return updated;
      });
    },
    []
  );

  const getAllCollectionsList = useCallback((): ArchiveNode[] => {
    return Array.from(collections.values());
  }, [collections]);

  const getManifest = useCallback((manifestId: string): SourceManifest | undefined => {
    return sourceManifests.manifests.find(m => m.id === manifestId);
  }, [sourceManifests.manifests]);

  // Build archive layout from collections
  const archiveLayout: ArchiveLayout = useMemo(() => {
    return {
      root: {
        id: 'root',
        name: 'Archive',
        children: Array.from(collections.values())
      }
    };
  }, [collections]);

  // Check for unassigned manifests
  const hasUnassigned = useMemo(() => {
    const assignedIds = new Set<string>();
    Array.from(collections.values()).forEach(collection => {
      collection.manifestIds?.forEach(id => assignedIds.add(id));
    });
    return sourceManifests.manifests.some(m => !assignedIds.has(m.id));
  }, [collections, sourceManifests.manifests]);

  return {
    selectedIds,
    toggleSelection,
    selectRange,
    clearSelection,
    selectAll,
    focusedPane,
    setFocusedPane,
    createNewCollection,
    addToCollection,
    removeFromCollection,
    renameCollectionAction,
    deleteCollectionAction,
    reorderCanvases,
    getAllCollectionsList,
    getManifest,
    archiveLayout,
    sourceManifests,
    hasUnassigned,
  };
}

export default useStagingState;

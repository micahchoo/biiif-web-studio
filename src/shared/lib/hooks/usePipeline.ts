/**
 * usePipeline Hook - Unified Cross-View State Management
 *
 * Provides a single, typed mechanism for passing state between views
 * in the Field Studio pipeline:
 *
 * Search → Archive → Metadata/Board
 *
 * Features:
 * - Type-safe pipeline context
 * - SessionStorage persistence for tab persistence
 * - Breadcrumb trail for navigation
 * - Self-documenting API
 *
 * @module shared/lib/hooks/usePipeline
 */

import { useCallback, useMemo, useSyncExternalStore } from 'react';

/**
 * Pipeline origin - where the user came from
 */
export type PipelineOrigin =
  | 'search'
  | 'archive'
  | 'metadata'
  | 'board'
  | 'viewer'
  | 'map'
  | 'timeline'
  | null;

/**
 * Pipeline intent - what the user wants to do
 */
export type PipelineIntent =
  | 'view'           // Just viewing an item
  | 'edit-metadata'  // Batch edit metadata
  | 'compose'        // Compose on board
  | 'export'         // Export items
  | 'map'            // View on map
  | null;

/**
 * Pipeline state - all cross-view state in one place
 */
export interface PipelineState {
  // Navigation
  origin: PipelineOrigin;
  intent: PipelineIntent;

  // Selection for pipeline operations
  selectedIds: string[];

  // Focus item (for viewer, search result click)
  focusId: string | null;

  // Geo focus (for map reveal)
  focusCoordinate: { lat: number; lng: number } | null;

  // Preloaded data
  preloadedManifestUrl: string | null;

  // Breadcrumb trail
  breadcrumbs: Array<{
    mode: string;
    label: string;
    selectedIds?: string[];
  }>;
}

const STORAGE_KEY = 'field-studio-pipeline';

const initialState: PipelineState = {
  origin: null,
  intent: null,
  selectedIds: [],
  focusId: null,
  focusCoordinate: null,
  preloadedManifestUrl: null,
  breadcrumbs: [],
};

// Simple in-memory store with sessionStorage persistence
let currentState: PipelineState = initialState;
const listeners = new Set<() => void>();

// Load initial state from sessionStorage
try {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    currentState = { ...initialState, ...parsed };
  }
} catch {
  // Ignore parse errors
}

function getState(): PipelineState {
  return currentState;
}

function setState(newState: Partial<PipelineState>) {
  currentState = { ...currentState, ...newState };
  // Persist to sessionStorage
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      origin: currentState.origin,
      intent: currentState.intent,
      selectedIds: currentState.selectedIds,
      focusId: currentState.focusId,
      breadcrumbs: currentState.breadcrumbs.slice(-5), // Keep last 5
    }));
  } catch {
    // Ignore storage errors
  }
  // Notify listeners
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Hook for pipeline state access
 */
export function usePipelineStore() {
  return useSyncExternalStore(subscribe, getState, getState);
}

/**
 * Hook for pipeline navigation with convenience methods
 */
export function usePipeline() {
  const state = usePipelineStore();

  /**
   * Start a pipeline operation
   */
  const startPipeline = useCallback((params: {
    origin: PipelineOrigin;
    intent: PipelineIntent;
    selectedIds?: string[];
    focusId?: string;
  }) => {
    setState({
      origin: params.origin,
      intent: params.intent,
      selectedIds: params.selectedIds || [],
      focusId: params.focusId || null,
    });
  }, []);

  /**
   * Clear pipeline state
   */
  const clearPipeline = useCallback(() => {
    setState(initialState);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  /**
   * Update selection
   */
  const setSelectedIds = useCallback((ids: string[]) => {
    setState({ selectedIds: ids });
  }, []);

  /**
   * Focus on a specific item
   */
  const setFocusId = useCallback((id: string | null) => {
    setState({ focusId: id });
  }, []);

  /**
   * Set geo focus
   */
  const setFocusCoordinate = useCallback((coord: { lat: number; lng: number } | null) => {
    setState({ focusCoordinate: coord });
  }, []);

  /**
   * Add breadcrumb
   */
  const pushBreadcrumb = useCallback((crumb: { mode: string; label: string; selectedIds?: string[] }) => {
    setState({
      breadcrumbs: [...state.breadcrumbs.slice(-4), crumb],
    });
  }, [state.breadcrumbs]);

  /**
   * Go back in breadcrumb trail
   */
  const goBack = useCallback(() => {
    if (state.breadcrumbs.length === 0) return null;
    const newBreadcrumbs = state.breadcrumbs.slice(0, -1);
    const last = state.breadcrumbs[state.breadcrumbs.length - 1];
    setState({
      breadcrumbs: newBreadcrumbs,
      selectedIds: last.selectedIds || [],
    });
    return last;
  }, [state.breadcrumbs]);

  /**
   * Navigate from Search to Archive with a result
   */
  const searchToArchive = useCallback((itemId: string) => {
    startPipeline({
      origin: 'search',
      intent: 'view',
      focusId: itemId,
    });
    pushBreadcrumb({ mode: 'search', label: 'Search Results' });
  }, [startPipeline, pushBreadcrumb]);

  /**
   * Navigate from Archive to Metadata for batch editing
   */
  const archiveToMetadata = useCallback((selectedIds: string[]) => {
    startPipeline({
      origin: 'archive',
      intent: 'edit-metadata',
      selectedIds,
    });
    pushBreadcrumb({
      mode: 'archive',
      label: 'Archive',
      selectedIds
    });
  }, [startPipeline, pushBreadcrumb]);

  /**
   * Navigate from Archive to Board for composition
   */
  const archiveToBoard = useCallback((selectedIds: string[]) => {
    startPipeline({
      origin: 'archive',
      intent: 'compose',
      selectedIds,
    });
    pushBreadcrumb({
      mode: 'archive',
      label: 'Archive',
      selectedIds
    });
  }, [startPipeline, pushBreadcrumb]);

  /**
   * Navigate from Archive to Map
   */
  const archiveToMap = useCallback((selectedIds: string[], focusCoord?: { lat: number; lng: number }) => {
    startPipeline({
      origin: 'archive',
      intent: 'map',
      selectedIds,
    });
    if (focusCoord) {
      setFocusCoordinate(focusCoord);
    }
    pushBreadcrumb({
      mode: 'archive',
      label: 'Archive',
      selectedIds
    });
  }, [startPipeline, setFocusCoordinate, pushBreadcrumb]);

  /**
   * Check if there's a pipeline context active
   */
  const hasPipeline = useMemo(() =>
    state.intent !== null || state.selectedIds.length > 0,
    [state.intent, state.selectedIds]
  );

  /**
   * Get pipeline summary for display
   */
  const getPipelineSummary = useCallback(() => {
    if (!state.intent) return null;

    const count = state.selectedIds.length;
    const originLabel = state.origin
      ? state.origin.charAt(0).toUpperCase() + state.origin.slice(1)
      : '';

    switch (state.intent) {
      case 'edit-metadata':
        return `Editing ${count} item${count !== 1 ? 's' : ''} from ${originLabel}`;
      case 'compose':
        return `Composing ${count} item${count !== 1 ? 's' : ''} from ${originLabel}`;
      case 'map':
        return `Mapping ${count} item${count !== 1 ? 's' : ''} from ${originLabel}`;
      case 'view':
        return `Viewing from ${originLabel}`;
      default:
        return null;
    }
  }, [state.intent, state.selectedIds.length, state.origin]);

  return {
    // State
    ...state,
    hasPipeline,

    // Actions
    startPipeline,
    clearPipeline,
    setSelectedIds,
    setFocusId,
    setFocusCoordinate,
    pushBreadcrumb,
    goBack,

    // Convenience navigators
    searchToArchive,
    archiveToMetadata,
    archiveToBoard,
    archiveToMap,
    getPipelineSummary,
  };
}

export default usePipeline;

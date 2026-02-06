/**
 * Board Design Feature Model
 *
 * Domain-specific selectors and helpers for the board-design feature.
 * Manages board state: items, connections, history, and export.
 *
 * @module features/board-design/model
 */

import { getIIIFValue, type IIIFItem, type IIIFManifest } from '@/src/shared/types';
import { canvas, manifest } from '@/src/entities';

// Re-export entity models for convenience
export { manifest, canvas };

// ============================================================================
// Types
// ============================================================================

export type AnchorSide = 'T' | 'R' | 'B' | 'L';

export type ConnectionType =
  | 'associated'
  | 'partOf'
  | 'similarTo'
  | 'references'
  | 'requires'
  | 'sequence';

export interface BoardItem {
  id: string;
  resourceId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  resourceType: string;
  label: string;
  blobUrl?: string;
  annotation?: string;
  isNote?: boolean;
  isMetadataNode?: boolean;
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  type: ConnectionType;
  label?: string;
  fromAnchor?: AnchorSide;
  toAnchor?: AnchorSide;
  style?: 'straight' | 'elbow' | 'curved';
  color?: string;
}

export interface BoardState {
  items: BoardItem[];
  connections: Connection[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}

// ============================================================================
// Board Selectors
// ============================================================================

/**
 * Get all items on the board
 */
export const selectAllItems = (state: BoardState): BoardItem[] => state.items;

/**
 * Get all connections on the board
 */
export const selectAllConnections = (state: BoardState): Connection[] =>
  state.connections;

/**
 * Get item by ID
 */
export const selectItemById = (
  state: BoardState,
  id: string
): BoardItem | undefined => state.items.find((item) => item.id === id);

/**
 * Get connections for a specific item (both incoming and outgoing)
 */
export const selectConnectionsForItem = (
  state: BoardState,
  itemId: string
): Connection[] =>
  state.connections.filter(
    (conn) => conn.fromId === itemId || conn.toId === itemId
  );

/**
 * Check if board is empty
 */
export const selectIsEmpty = (state: BoardState): boolean =>
  state.items.length === 0;

/**
 * Get board bounds (min/max coordinates)
 */
export const selectBoardBounds = (
  state: BoardState
): { minX: number; minY: number; maxX: number; maxY: number } | null => {
  if (state.items.length === 0) return null;

  const minX = Math.min(...state.items.map((i) => i.x));
  const minY = Math.min(...state.items.map((i) => i.y));
  const maxX = Math.max(...state.items.map((i) => i.x + i.w));
  const maxY = Math.max(...state.items.map((i) => i.y + i.h));

  return { minX, minY, maxX, maxY };
};

// ============================================================================
// Board Helpers
// ============================================================================

/**
 * Create a new board item from a IIIF resource
 */
export const createBoardItem = (
  resource: IIIFItem,
  position: { x: number; y: number },
  size: { w: number; h: number } = { w: 200, h: 150 }
): BoardItem => ({
  id: `board-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  resourceId: resource.id,
  x: position.x,
  y: position.y,
  w: size.w,
  h: size.h,
  resourceType: resource.type,
  label: getIIIFValue(resource.label) || resource.id,
});

/**
 * Create a connection between two items
 */
export const createConnection = (
  fromId: string,
  toId: string,
  type: ConnectionType = 'associated',
  options: Partial<Omit<Connection, 'id' | 'fromId' | 'toId' | 'type'>> = {}
): Connection => ({
  id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  fromId,
  toId,
  type,
  ...options,
});

/**
 * Calculate default anchor points for a connection
 */
export const calculateAnchorPoints = (
  fromItem: BoardItem,
  toItem: BoardItem
): { from: AnchorSide; to: AnchorSide } => {
  const dx = toItem.x - fromItem.x;
  const dy = toItem.y - fromItem.y;

  // Determine best anchor sides based on relative positions
  if (Math.abs(dx) > Math.abs(dy)) {
    // More horizontal than vertical
    return {
      from: dx > 0 ? 'R' : 'L',
      to: dx > 0 ? 'L' : 'R',
    };
  } else {
    // More vertical than horizontal
    return {
      from: dy > 0 ? 'B' : 'T',
      to: dy > 0 ? 'T' : 'B',
    };
  }
};

/**
 * Get connection label based on type and terminology level
 */
export const getConnectionLabel = (
  type: ConnectionType,
  isAdvanced: boolean
): string => {
  const labels: Record<ConnectionType, { simple: string; advanced: string }> = {
    associated: { simple: 'Related', advanced: 'Associated' },
    partOf: { simple: 'Part of', advanced: 'Part Of' },
    similarTo: { simple: 'Similar', advanced: 'Similar To' },
    references: { simple: 'References', advanced: 'References' },
    requires: { simple: 'Needs', advanced: 'Requires' },
    sequence: { simple: 'Next', advanced: 'Sequence' },
  };

  return labels[type]?.[isAdvanced ? 'advanced' : 'simple'] || type;
};

/**
 * Export board state to IIIF Manifest format
 * Supports navDate (timeline), navPlace (map), and linking annotations
 */
export const exportToManifest = (
  state: BoardState,
  title: string,
  options?: {
    includeNavDate?: boolean;
    includeNavPlace?: boolean;
    templateType?: 'narrative' | 'comparison' | 'timeline' | 'map';
  }
): Partial<IIIFManifest> => {
  const manifest: Partial<IIIFManifest> = {
    type: 'Manifest',
    label: { en: [title] },
    items: state.items
      .filter((item) => !item.isNote)
      .map((item, index) => {
        const canvas: any = {
          type: 'Canvas' as const,
          id: item.resourceId,
          label: { en: [item.label] },
          width: item.w || 1000,
          height: item.h || 800,
          items: [],
        };

        // Add navDate for timeline templates
        if (options?.includeNavDate || options?.templateType === 'timeline') {
          const baseYear = new Date().getFullYear() - state.items.length + index;
          canvas.navDate = `${baseYear}-01-01T00:00:00Z`;
        }

        // Add navPlace for map templates
        if (options?.includeNavPlace || options?.templateType === 'map') {
          // Use position on board to generate approximate coordinates
          // This is a demo - in production, users would set real coordinates
          const normalizedX = (item.x / 1000) * 180 - 90; // -90 to 90 (lat-like)
          const normalizedY = (item.y / 1000) * 360 - 180; // -180 to 180 (lng-like)
          canvas.navPlace = {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [normalizedY, normalizedX], // GeoJSON is [lng, lat]
            },
            properties: {
              name: item.label,
            },
          };
        }

        return canvas;
      }),
  };

  // Add linking annotations for connections
  if (state.connections.length > 0) {
    const annotations = state.connections.map((conn) => ({
      type: 'Annotation' as const,
      id: conn.id,
      motivation: connectionTypeToMotivation(conn.type),
      body: {
        type: 'SpecificResource',
        source: conn.toId,
      },
      target: conn.fromId,
      label: conn.label ? { en: [conn.label] } : undefined,
    }));

    // Add as a top-level annotations array (IIIF Presentation 3.0)
    (manifest as any).annotations = [
      {
        type: 'AnnotationPage',
        id: `${title}-annotations`,
        items: annotations,
      },
    ];
  }

  return manifest;
};

/**
 * Map connection types to IIIF annotation motivations
 */
const connectionTypeToMotivation = (type: ConnectionType): string => {
  const motivationMap: Record<ConnectionType, string> = {
    associated: 'linking',
    partOf: 'linking',
    similarTo: 'comparing',
    references: 'linking',
    requires: 'linking',
    sequence: 'linking',
  };
  return motivationMap[type] || 'linking';
};

// ============================================================================
// Initial State
// ============================================================================

export const createInitialBoardState = (): BoardState => ({
  items: [],
  connections: [],
  viewport: {
    x: 0,
    y: 0,
    zoom: 1,
  },
});

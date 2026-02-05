/**
 * Vault Types - Core type definitions (Atom Layer)
 *
 * Fundamental types, interfaces, and enums used throughout the vault system.
 * These are the building blocks (atoms) of the vault architecture.
 */

import type {
  IIIFAnnotation,
  IIIFAnnotationPage,
  IIIFCanvas,
  IIIFCollection,
  IIIFItem,
  IIIFManifest,
  IIIFRange
} from '@/types';

/**
 * Entity types supported by the vault
 */
export type EntityType = 'Collection' | 'Manifest' | 'Canvas' | 'Range' | 'AnnotationPage' | 'Annotation';

/**
 * Trashed entity metadata for recovery
 */
export interface TrashedEntity {
  /** The entity data at time of deletion */
  entity: IIIFItem;
  /** Original parent ID for restoration */
  originalParentId: string | null;
  /** Timestamp when moved to trash */
  trashedAt: number;
  /** Collection memberships at time of deletion */
  memberOfCollections: string[];
  /** Hierarchical references at time of deletion */
  childIds: string[];
}

/**
 * Core normalized state structure
 * Flat storage of IIIF entities for O(1) lookups
 */
export interface NormalizedState {
  /** Flat storage of all entities by type and ID */
  entities: {
    Collection: Record<string, IIIFCollection>;
    Manifest: Record<string, IIIFManifest>;
    Canvas: Record<string, IIIFCanvas>;
    Range: Record<string, IIIFRange>;
    AnnotationPage: Record<string, IIIFAnnotationPage>;
    Annotation: Record<string, IIIFAnnotation>;
  };

  /** Parent → child ID references (for hierarchical ownership: Manifest→Canvas, Canvas→AnnotationPage) */
  references: Record<string, string[]>;

  /** Child → parent ID reverse lookup (for hierarchical ownership only) */
  reverseRefs: Record<string, string>;

  /**
   * Collection membership - tracks which Collections reference which resources
   * This is separate from hierarchical ownership because:
   * - Collections REFERENCE Manifests (many-to-many)
   * - Manifests OWN Canvases (one-to-many, hierarchical)
   *
   * Key: Collection ID, Value: Array of referenced resource IDs (Manifests or nested Collections)
   */
  collectionMembers: Record<string, string[]>;

  /**
   * Reverse lookup: which Collections contain this resource?
   * Key: resource ID (Manifest or Collection), Value: Array of Collection IDs that reference it
   * A Manifest can be in multiple Collections (non-hierarchical, many-to-many)
   */
  memberOfCollections: Record<string, string[]>;

  /** Root entity ID (usually a top-level Collection) */
  rootId: string | null;

  /** Entity type index for O(1) type lookup */
  typeIndex: Record<string, EntityType>;

  /**
   * Extension preservation for round-tripping
   * Stores unknown/vendor-specific properties by entity ID
   * Ensures properties like Mirador configs, Tify settings survive import/export
   */
  extensions: Record<string, Record<string, unknown>>;

  /**
   * Trashed entities storage - soft-deleted items awaiting permanent deletion or restoration
   * Key: entity ID, Value: trashed entity metadata with recovery information
   */
  trashedEntities: Record<string, TrashedEntity>;
}

/**
 * Snapshot of vault state for undo/redo
 */
export interface VaultSnapshot {
  state: NormalizedState;
  timestamp: number;
}

/**
 * Options for entity removal
 */
export interface RemoveOptions {
  /** If true, permanently delete; if false, move to trash (soft delete) */
  permanent?: boolean;
}

/**
 * Options for restoring from trash
 */
export interface RestoreOptions {
  /** Optional new parent ID; if not provided, uses original parent */
  parentId?: string;
  /** Optional index for positioning in parent */
  index?: number;
}

/**
 * Result of emptying trash
 */
export interface EmptyTrashResult {
  state: NormalizedState;
  deletedCount: number;
  errors: string[];
}

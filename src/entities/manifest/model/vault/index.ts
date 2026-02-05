/**
 * Vault Module - Atomic Design Decomposition
 *
 * Re-exports all vault functionality organized by atomic design layers:
 *
 * **Atoms** (types.ts): Core type definitions
 *   - EntityType, NormalizedState, TrashedEntity, VaultSnapshot
 *
 * **Molecules**: Small, focused utility functions
 *   - cloning.ts: cloneAsRecord, deepCloneState, recordAs, hasType
 *   - extensions.ts: extractExtensions, applyExtensions
 *
 * **Organisms**: Larger logical groupings
 *   - normalization.ts: normalize, createEmptyState
 *   - denormalization.ts: denormalize, denormalizeCanvas, denormalizeAnnotationPage
 *   - queries.ts: getEntity, getChildIds, getAncestors, getDescendants
 *   - collections.ts: addToCollection, removeFromCollection, isOrphanManifest
 *   - updates.ts: updateEntity, addEntity, removeEntity
 *   - trash.ts: moveEntityToTrash, restoreEntityFromTrash, emptyTrash
 *   - movement.ts: moveEntity, reorderChildren
 *
 * **Widgets** (vault.ts): Stateful components
 *   - Vault class, getVault(), resetVault()
 *
 * **Pages**: Test API aliases (for backward compatibility)
 *   - createEmptyVault, normalizeIIIF, denormalizeIIIF, getChildren, getParent
 */

// ============================================================================
// Atoms (Types)
// ============================================================================
export type {
  EntityType,
  NormalizedState,
  TrashedEntity,
  VaultSnapshot,
  RemoveOptions,
  RestoreOptions,
  EmptyTrashResult
} from './types';

// ============================================================================
// Molecules (Utilities)
// ============================================================================
export {
  cloneAsRecord,
  deepCloneState,
  recordAs,
  hasType
} from './cloning';

export {
  extractExtensions,
  applyExtensions,
  extractExtensionsFromEntity
} from './extensions';

// ============================================================================
// Organisms (Core Functions)
// ============================================================================
export {
  normalize,
  createEmptyState,
  normalizeItem,
  normalizeAnnotationPage
} from './normalization';

export {
  denormalize,
  denormalizeItem,
  denormalizeCanvas,
  denormalizeAnnotationPage
} from './denormalization';

export {
  getEntity,
  getEntityType,
  getParentId,
  getChildIds,
  getEntitiesByType,
  getAncestors,
  getDescendants,
  hasEntity,
  getRootId,
  getAllEntityIds,
  getEntityCount,
  getTotalEntityCount
} from './queries';

export {
  getCollectionsContaining,
  getCollectionMembers,
  isOrphanManifest,
  getOrphanManifests,
  addToCollection,
  removeFromCollection
} from './collections';

export {
  updateEntity,
  addEntity,
  removeEntity
} from './updates';

export {
  moveEntityToTrash,
  restoreEntityFromTrash,
  emptyTrash
} from './trash';

export {
  moveEntity,
  reorderChildren,
  insertChildAt,
  removeChild
} from './movement';

// ============================================================================
// Widgets (Stateful Components)
// ============================================================================
export {
  Vault,
  getVault,
  resetVault
} from './vault';

// ============================================================================
// Test API Aliases (Backward Compatibility - Page Layer)
// ============================================================================
export {
  createEmptyState as createEmptyVault,
  normalize as normalizeIIIF
} from './normalization';

export {
  denormalize as denormalizeIIIF
} from './denormalization';

export {
  getChildIds as getChildren,
  getParentId as getParent
} from './queries';

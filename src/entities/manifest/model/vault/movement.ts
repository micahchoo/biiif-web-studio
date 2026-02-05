/**
 * Vault Movement Functions (Organism Layer)
 *
 * Functions for moving entities between parents and reordering children.
 * These operations maintain the hierarchical structure of the IIIF tree.
 */

import type { NormalizedState } from './types';

/**
 * Move an entity to a new parent
 */
export function moveEntity(
  state: NormalizedState,
  id: string,
  newParentId: string,
  index?: number
): NormalizedState {
  const oldParentId = state.reverseRefs[id];
  if (!oldParentId) return state;

  // Remove from old parent's children
  const oldParentChildren = state.references[oldParentId] || [];
  const filteredOldChildren = oldParentChildren.filter(cid => cid !== id);

  // Add to new parent's children
  const newParentChildren = [...(state.references[newParentId] || [])];
  if (typeof index === 'number') {
    newParentChildren.splice(index, 0, id);
  } else {
    newParentChildren.push(id);
  }

  return {
    ...state,
    references: {
      ...state.references,
      [oldParentId]: filteredOldChildren,
      [newParentId]: newParentChildren
    },
    reverseRefs: {
      ...state.reverseRefs,
      [id]: newParentId
    }
  };
}

/**
 * Reorder children of a parent
 */
export function reorderChildren(
  state: NormalizedState,
  parentId: string,
  newOrder: string[]
): NormalizedState {
  return {
    ...state,
    references: {
      ...state.references,
      [parentId]: newOrder
    }
  };
}

/**
 * Insert a child at a specific index
 */
export function insertChildAt(
  state: NormalizedState,
  parentId: string,
  childId: string,
  index: number
): NormalizedState {
  const currentChildren = state.references[parentId] || [];
  const newChildren = [...currentChildren];
  newChildren.splice(index, 0, childId);

  return {
    ...state,
    references: {
      ...state.references,
      [parentId]: newChildren
    },
    reverseRefs: {
      ...state.reverseRefs,
      [childId]: parentId
    }
  };
}

/**
 * Remove a child from its parent (without deleting the entity)
 */
export function removeChild(
  state: NormalizedState,
  parentId: string,
  childId: string
): NormalizedState {
  const currentChildren = state.references[parentId] || [];
  const newChildren = currentChildren.filter(cid => cid !== childId);

  const newReverseRefs = { ...state.reverseRefs };
  delete newReverseRefs[childId];

  return {
    ...state,
    references: {
      ...state.references,
      [parentId]: newChildren
    },
    reverseRefs: newReverseRefs
  };
}

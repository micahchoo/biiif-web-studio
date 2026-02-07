/**
 * Vault Cloning Utilities (Molecule Layer)
 *
 * Small, focused functions for cloning entities and state.
 * Uses structuredClone with JSON serialization fallback.
 */

import type { NormalizedState } from '@/src/shared/types';

/**
 * Deep clone an entity using structuredClone (with JSON fallback)
 * This is the standard pattern for working with entities during denormalization
 */
export function cloneAsRecord<T extends object>(entity: T): Record<string, unknown> {
  // Use native structuredClone if available (faster, handles more types)
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(entity) as Record<string, unknown>;
    } catch {
      // Fallback for objects that can't be cloned (e.g., with functions)
    }
  }

  // Legacy fallback for older browsers
  return JSON.parse(JSON.stringify(entity)) as Record<string, unknown>;
}

/**
 * Create a deep clone of the entire state using structuredClone
 */
export function deepCloneState(state: NormalizedState): NormalizedState {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(state);
    } catch {
      // Fallback
    }
  }

  return JSON.parse(JSON.stringify(state)) as NormalizedState;
}

/**
 * Convert a manipulated record back to its typed form
 * Used after applyExtensions adds dynamic properties
 */
export function recordAs<T>(record: Record<string, unknown>): T {
  return record as T;
}

/**
 * Type guard for checking if an item has a 'type' property
 */
export function hasType(item: unknown): item is { type: string } {
  return typeof item === 'object' && item !== null && 'type' in item;
}

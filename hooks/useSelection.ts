/**
 * useSelection - Local multi-selection state management
 *
 * Provides Set-based selection with toggle, range select, and modifier key support.
 * Lighter alternative to useSharedSelection when cross-view persistence isn't needed.
 */

import { useCallback, useMemo, useState } from 'react';

export interface UseSelectionOptions {
  /** Initial selected IDs */
  initialSelected?: string[];
  /** Maximum allowed selections (0 = unlimited) */
  maxSelection?: number;
  /** Callback when selection changes */
  onChange?: (selectedIds: Set<string>) => void;
}

export interface UseSelectionReturn {
  /** Set of selected item IDs */
  selectedIds: Set<string>;
  /** Number of selected items */
  count: number;
  /** Whether anything is selected */
  hasSelection: boolean;
  /** Last selected ID (for range operations) */
  lastSelectedId: string | null;
  /** Check if an ID is selected */
  isSelected: (id: string) => boolean;
  /** Select a single item (clears others) */
  select: (id: string) => void;
  /** Toggle an item's selection */
  toggle: (id: string) => void;
  /** Add items to selection */
  add: (ids: string[]) => void;
  /** Remove items from selection */
  remove: (ids: string[]) => void;
  /** Select all items (up to maxSelection) */
  selectAll: (ids: string[]) => void;
  /** Select range between last selected and target */
  selectRange: (targetId: string, orderedIds: string[]) => void;
  /** Handle selection with modifier keys (Ctrl/Meta/Shift) */
  handleSelectWithModifier: (
    id: string,
    event: { shiftKey: boolean; metaKey: boolean; ctrlKey: boolean },
    orderedIds: string[]
  ) => void;
  /** Clear all selection */
  clear: () => void;
}

/**
 * Hook for local multi-selection state management
 *
 * @example
 * // Basic usage
 * const { selectedIds, toggle, clear, isSelected } = useSelection();
 *
 * @example
 * // With modifier key support
 * const { handleSelectWithModifier } = useSelection();
 *
 * // In render:
 * <Item
 *   onClick={(e) => handleSelectWithModifier(item.id, e, allIds)}
 *   selected={isSelected(item.id)}
 * />
 *
 * @example
 * // With callbacks
 * const { selectedIds, count } = useSelection({
 *   initialSelected: ['id1', 'id2'],
 *   maxSelection: 10,
 *   onChange: (ids) => console.log('Selected:', ids.size),
 * });
 */
export function useSelection(options: UseSelectionOptions = {}): UseSelectionReturn {
  const {
    initialSelected = [],
    maxSelection = 0,
    onChange,
  } = options;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelected));
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(
    initialSelected.length > 0 ? initialSelected[initialSelected.length - 1] : null
  );

  const count = useMemo(() => selectedIds.size, [selectedIds]);
  const hasSelection = useMemo(() => selectedIds.size > 0, [selectedIds]);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const updateSelection = useCallback(
    (newSelection: Set<string>) => {
      setSelectedIds(newSelection);
      onChange?.(newSelection);
    },
    [onChange]
  );

  const select = useCallback(
    (id: string) => {
      const newSet = new Set([id]);
      setLastSelectedId(id);
      updateSelection(newSet);
    },
    [updateSelection]
  );

  const toggle = useCallback(
    (id: string) => {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else if (maxSelection === 0 || next.size < maxSelection) {
          next.add(id);
        }
        const newSet = new Set(next);
        onChange?.(newSet);
        return newSet;
      });
      setLastSelectedId(id);
    },
    [maxSelection, onChange]
  );

  const add = useCallback(
    (ids: string[]) => {
      setSelectedIds(prev => {
        const next = new Set(prev);
        for (const id of ids) {
          if (maxSelection === 0 || next.size < maxSelection) {
            next.add(id);
          } else {
            break;
          }
        }
        const newSet = new Set(next);
        onChange?.(newSet);
        return newSet;
      });
      if (ids.length > 0) {
        setLastSelectedId(ids[ids.length - 1]);
      }
    },
    [maxSelection, onChange]
  );

  const remove = useCallback(
    (ids: string[]) => {
      setSelectedIds(prev => {
        const next = new Set(prev);
        for (const id of ids) {
          next.delete(id);
        }
        const newSet = new Set(next);
        onChange?.(newSet);
        return newSet;
      });
    },
    [onChange]
  );

  const selectAll = useCallback(
    (ids: string[]) => {
      const limitedIds = maxSelection > 0 ? ids.slice(0, maxSelection) : ids;
      const newSet = new Set(limitedIds);
      setLastSelectedId(limitedIds[limitedIds.length - 1] ?? null);
      updateSelection(newSet);
    },
    [maxSelection, updateSelection]
  );

  const selectRange = useCallback(
    (targetId: string, orderedIds: string[]) => {
      if (!lastSelectedId) {
        // No anchor, just select target
        select(targetId);
        return;
      }

      const startIndex = orderedIds.indexOf(lastSelectedId);
      const endIndex = orderedIds.indexOf(targetId);

      if (startIndex === -1 || endIndex === -1) {
        select(targetId);
        return;
      }

      const start = Math.min(startIndex, endIndex);
      const end = Math.max(startIndex, endIndex);
      const rangeIds = orderedIds.slice(start, end + 1);

      add(rangeIds);
    },
    [lastSelectedId, select, add]
  );

  const handleSelectWithModifier = useCallback(
    (
      id: string,
      event: { shiftKey: boolean; metaKey: boolean; ctrlKey: boolean },
      orderedIds: string[]
    ) => {
      const { shiftKey, metaKey, ctrlKey } = event;

      if (shiftKey && lastSelectedId) {
        // Range selection
        selectRange(id, orderedIds);
      } else if (metaKey || ctrlKey) {
        // Toggle selection
        toggle(id);
      } else {
        // Single selection
        select(id);
      }
    },
    [lastSelectedId, selectRange, toggle, select]
  );

  const clear = useCallback(() => {
    setLastSelectedId(null);
    updateSelection(new Set());
  }, [updateSelection]);

  return {
    selectedIds,
    count,
    hasSelection,
    lastSelectedId,
    isSelected,
    select,
    toggle,
    add,
    remove,
    selectAll,
    selectRange,
    handleSelectWithModifier,
    clear,
  };
}

export default useSelection;

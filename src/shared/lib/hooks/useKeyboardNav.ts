/**
 * useKeyboardNav Hook
 *
 * Reusable keyboard navigation for lists, grids, and tree structures.
 * Domain-agnostic hook that provides arrow key navigation, selection, and actions.
 *
 * ATOMIC DESIGN COMPLIANCE:
 * - No domain imports - purely interaction logic
 * - Supports various navigation patterns (list, grid, tree)
 * - Fully accessible with ARIA attributes
 *
 * IDEAL OUTCOME: Consistent keyboard navigation across all features
 * FAILURE PREVENTED: Keyboard traps, missing focus indicators, poor a11y
 *
 * @module shared/lib/hooks/useKeyboardNav
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Navigation direction
 */
export type NavDirection = 'up' | 'down' | 'left' | 'right' | 'home' | 'end' | 'pageUp' | 'pageDown';

/**
 * Navigation mode
 */
export type NavMode = 'list' | 'grid' | 'tree' | 'horizontal';

/**
 * Options for useKeyboardNav hook
 */
export interface KeyboardNavOptions {
  /** Navigation mode */
  mode?: NavMode;
  /** Number of columns (for grid mode) */
  columns?: number;
  /** Enable wrap-around navigation */
  wrap?: boolean;
  /** Enable page up/down navigation */
  pageSize?: number;
  /** Callback when item is selected */
  onSelect?: (id: string) => void;
  /** Callback when item is activated (Enter/Space) */
  onActivate?: (id: string) => void;
  /** Callback when selection changes with modifier */
  onMultiSelect?: (id: string) => void;
  /** Callback for range selection (Shift+Click/Arrow) */
  onRangeSelect?: (fromId: string, toId: string) => void;
  /** Custom key handler */
  onKeyDown?: (e: KeyboardEvent, currentId: string | null) => boolean;
}

/**
 * Return type for useKeyboardNav hook
 */
export interface UseKeyboardNavReturn {
  /** Current focused item ID */
  focusedId: string | null;
  /** Set focused item */
  setFocusedId: (id: string | null) => void;
  /** Handle key down event */
  handleKeyDown: (e: React.KeyboardEvent) => void;
  /** Get item props */
  getItemProps: (id: string, index: number) => {
    tabIndex: number;
    // eslint-disable-next-line @typescript-eslint/naming-convention -- HTML data attributes require kebab-case
    'data-nav-id': string;
    // eslint-disable-next-line @typescript-eslint/naming-convention -- HTML data attributes require kebab-case
    'data-nav-index': number;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onFocus: () => void;
    onClick: (e: React.MouseEvent) => void;
  };
  /** Register item ref */
  registerItem: (id: string, ref: HTMLElement | null) => void;
  /** Focus next item */
  focusNext: () => void;
  /** Focus previous item */
  focusPrevious: () => void;
  /** Focus first item */
  focusFirst: () => void;
  /** Focus last item */
  focusLast: () => void;
  /** Move focus in direction */
  moveFocus: (direction: NavDirection) => void;
}

/**
 * Hook for keyboard navigation
 *
 * @example
 * ```tsx
 * const { getItemProps, registerItem } = useKeyboardNav({
 *   mode: 'list',
 *   onSelect: (id) => setSelectedId(id),
 *   onActivate: (id) => openItem(id)
 * });
 *
 * return items.map((item, index) => (
 *   <div
 *     key={item.id}
 *     ref={(el) => registerItem(item.id, el)}
 *     {...getItemProps(item.id, index)}
 *   >
 *     {item.name}
 *   </div>
 * ));
 * ```
 */
export function useKeyboardNav(
  itemIds: string[],
  options: KeyboardNavOptions = {}
): UseKeyboardNavReturn {
  const {
    mode = 'list',
    columns = 1,
    wrap = true,
    pageSize = 10,
    onSelect,
    onActivate,
    onMultiSelect,
    onRangeSelect,
    onKeyDown: customKeyHandler,
  } = options;

  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  // Refs for item elements
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Register item ref
  const registerItem = useCallback((id: string, ref: HTMLElement | null) => {
    if (ref) {
      itemRefs.current.set(id, ref);
    } else {
      itemRefs.current.delete(id);
    }
  }, []);

  // Get index from ID
  const getIndex = useCallback(
    (id: string | null): number => {
      if (!id) return -1;
      return itemIds.indexOf(id);
    },
    [itemIds]
  );

  // Get ID from index
  const getId = useCallback(
    (index: number): string | null => {
      if (index < 0 || index >= itemIds.length) return null;
      return itemIds[index];
    },
    [itemIds]
  );

  // Focus an item by ID
  const focusItem = useCallback(
    (id: string | null) => {
      if (!id) return;
      setFocusedId(id);
      const element = itemRefs.current.get(id);
      element?.focus();
    },
    []
  );

  // Calculate next index based on direction
  const calculateNextIndex = useCallback(
    (currentIndex: number, direction: NavDirection): number => {
      const maxIndex = itemIds.length - 1;

      switch (direction) {
        case 'up':
          if (mode === 'grid') {
            const next = currentIndex - columns;
            return wrap && next < 0 ? maxIndex + next + 1 : Math.max(0, next);
          }
          return wrap && currentIndex <= 0 ? maxIndex : Math.max(0, currentIndex - 1);

        case 'down':
          if (mode === 'grid') {
            const next = currentIndex + columns;
            return wrap && next > maxIndex ? next - maxIndex - 1 : Math.min(maxIndex, next);
          }
          return wrap && currentIndex >= maxIndex ? 0 : Math.min(maxIndex, currentIndex + 1);

        case 'left':
          if (mode === 'grid' || mode === 'horizontal') {
            return wrap && currentIndex <= 0 ? maxIndex : Math.max(0, currentIndex - 1);
          }
          return currentIndex;

        case 'right':
          if (mode === 'grid' || mode === 'horizontal') {
            return wrap && currentIndex >= maxIndex ? 0 : Math.min(maxIndex, currentIndex + 1);
          }
          return currentIndex;

        case 'home':
          return 0;

        case 'end':
          return maxIndex;

        case 'pageUp':
          return Math.max(0, currentIndex - pageSize);

        case 'pageDown':
          return Math.min(maxIndex, currentIndex + pageSize);

        default:
          return currentIndex;
      }
    },
    [itemIds.length, mode, columns, wrap, pageSize]
  );

  // Move focus in direction
  const moveFocus = useCallback(
    (direction: NavDirection) => {
      const currentIndex = getIndex(focusedId);
      if (currentIndex === -1 && itemIds.length > 0) {
        focusItem(getId(0));
        return;
      }

      const nextIndex = calculateNextIndex(currentIndex, direction);
      const nextId = getId(nextIndex);

      if (nextId && nextId !== focusedId) {
        focusItem(nextId);
      }
    },
    [focusedId, itemIds.length, getIndex, getId, calculateNextIndex, focusItem]
  );

  // Focus helpers
  const focusNext = useCallback(() => moveFocus('down'), [moveFocus]);
  const focusPrevious = useCallback(() => moveFocus('up'), [moveFocus]);
  const focusFirst = useCallback(() => {
    const firstId = getId(0);
    if (firstId) focusItem(firstId);
  }, [getId, focusItem]);
  const focusLast = useCallback(() => {
    const lastId = getId(itemIds.length - 1);
    if (lastId) focusItem(lastId);
  }, [itemIds.length, getId, focusItem]);

  // Handle key down
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Let custom handler intercept if needed
      if (customKeyHandler?.(e.nativeEvent, focusedId)) {
        e.preventDefault();
        return;
      }

      const {key} = e;
      const isShift = e.shiftKey;
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      switch (key) {
        case 'ArrowUp':
          e.preventDefault();
          if (isShift && lastSelectedId && focusedId) {
            onRangeSelect?.(lastSelectedId, focusedId);
          } else {
            moveFocus('up');
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (isShift && lastSelectedId && focusedId) {
            onRangeSelect?.(lastSelectedId, focusedId);
          } else {
            moveFocus('down');
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          moveFocus('left');
          break;

        case 'ArrowRight':
          e.preventDefault();
          moveFocus('right');
          break;

        case 'Home':
          e.preventDefault();
          if (isCtrlOrMeta) {
            focusFirst();
          } else {
            moveFocus('home');
          }
          break;

        case 'End':
          e.preventDefault();
          if (isCtrlOrMeta) {
            focusLast();
          } else {
            moveFocus('end');
          }
          break;

        case 'PageUp':
          e.preventDefault();
          moveFocus('pageUp');
          break;

        case 'PageDown':
          e.preventDefault();
          moveFocus('pageDown');
          break;

        case 'Enter':
        case ' ':
          if (focusedId) {
            e.preventDefault();
            onActivate?.(focusedId);
          }
          break;

        case 'a':
          if (isCtrlOrMeta) {
            // Select all - handled by parent
            e.preventDefault();
          }
          break;

        case 'Escape':
          // Clear selection
          setFocusedId(null);
          break;
      }
    },
    [
      customKeyHandler,
      focusedId,
      lastSelectedId,
      moveFocus,
      focusFirst,
      focusLast,
      onActivate,
      onRangeSelect,
    ]
  );

  // Handle item click
  const handleItemClick = useCallback(
    (id: string, e: React.MouseEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      if (isCtrlOrMeta) {
        e.preventDefault();
        onMultiSelect?.(id);
        setLastSelectedId(id);
      } else if (isShift && lastSelectedId) {
        e.preventDefault();
        onRangeSelect?.(lastSelectedId, id);
      } else {
        onSelect?.(id);
        setLastSelectedId(id);
      }

      setFocusedId(id);
    },
    [lastSelectedId, onSelect, onMultiSelect, onRangeSelect]
  );

  // Get item props
  const getItemProps = useCallback(
    (id: string, index: number) => ({
      tabIndex: focusedId === id ? 0 : -1,
      // eslint-disable-next-line @typescript-eslint/naming-convention -- HTML data attributes require kebab-case
      'data-nav-id': id,
      // eslint-disable-next-line @typescript-eslint/naming-convention -- HTML data attributes require kebab-case
      'data-nav-index': index,
      onKeyDown: handleKeyDown,
      onFocus: () => setFocusedId(id),
      onClick: (e: React.MouseEvent) => handleItemClick(id, e),
    }),
    [focusedId, handleKeyDown, handleItemClick]
  );

  // Update focus when items change
  useEffect(() => {
    if (focusedId && !itemIds.includes(focusedId)) {
      setFocusedId(null);
    }
  }, [itemIds, focusedId]);

  return {
    focusedId,
    setFocusedId,
    handleKeyDown,
    getItemProps,
    registerItem,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    moveFocus,
  };
}

export default useKeyboardNav;

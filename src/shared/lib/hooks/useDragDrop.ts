/**
 * useDragDrop Hook
 *
 * Reusable drag and drop functionality for lists and grids.
 * Domain-agnostic hook that can be used across features.
 *
 * ATOMIC DESIGN COMPLIANCE:
 * - No domain imports - purely UI interaction logic
 * - Supports keyboard navigation for accessibility
 * - Configurable drag handle and drop zones
 *
 * IDEAL OUTCOME: Consistent drag-drop UX across all features
 * FAILURE PREVENTED: Broken drag-drop, accessibility violations
 *
 * @module shared/lib/hooks/useDragDrop
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Generic drag item type
 */
export interface DragItem<T = unknown> {
  id: string;
  data: T;
  index: number;
}

/**
 * Drop target configuration
 */
export interface DropTarget {
  id: string;
  accepts: string[];
  onDrop: (items: DragItem[], targetId: string) => void;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
  onDragOver?: (isOver: boolean) => void;
}

/**
 * Drag state for an item
 */
export interface DragState {
  isDragging: boolean;
  isDragOver: boolean;
  dragPosition: 'before' | 'after' | null;
}

/**
 * Drop state for a target
 */
export interface DropState {
  isDragOver: boolean;
  canDrop: boolean;
}

/**
 * Keyboard drag state
 */
export interface KeyboardDragState {
  isKeyboardDragging: boolean;
  draggedItemId: string | null;
  dropTargetId: string | null;
}

/**
 * Return type for useDragDrop hook
 */
export interface UseDragDropReturn<T = unknown> {
  // Drag handlers
  handleDragStart: (e: React.DragEvent, item: DragItem<T>) => void;
  handleDragEnd: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent, item: DragItem<T>) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, targetItem?: DragItem<T>) => void;

  // Drop target handlers
  handleDropTargetDragOver: (e: React.DragEvent, targetId: string, accepts: string[]) => void;
  handleDropTargetDragLeave: (e: React.DragEvent, targetId: string) => void;
  handleDropTargetDrop: (e: React.DragEvent, targetId: string, onDrop: (items: DragItem<T>[]) => void) => void;

  // Keyboard handlers
  handleKeyDragStart: (itemId: string) => void;
  handleKeyDrop: (targetId: string) => boolean;
  handleKeyCancel: () => void;
  moveKeyboardFocus: (direction: 'up' | 'down' | 'left' | 'right') => void;

  // State getters
  getDragState: (itemId: string) => DragState;
  getDropState: (targetId: string) => DropState;

  // Keyboard state
  keyboardDragState: KeyboardDragState;

  // Reorder helper
  reorderItems: (items: T[], fromIndex: number, toIndex: number) => T[];
}

/**
 * Options for useDragDrop hook
 */
export interface UseDragDropOptions<T = unknown> {
  /** MIME type for data transfer */
  mimeType?: string;
  /** Enable keyboard navigation */
  enableKeyboard?: boolean;
  /** Container ref for keyboard navigation */
  containerRef?: React.RefObject<HTMLElement>;
  /** Item IDs for keyboard navigation */
  itemIds?: string[];
  /** Called when items are reordered */
  onReorder?: (fromIndex: number, toIndex: number) => void;
  /** Called when items are dropped on external target */
  onExternalDrop?: (items: DragItem<T>[], targetId: string) => void;
  /** Custom drag image generator */
  getDragImage?: (items: DragItem<T>[]) => HTMLElement | null;
  /** Multi-select mode */
  multiSelect?: boolean;
  /** Selected item IDs for multi-drag */
  selectedIds?: string[];
}

/**
 * Hook for drag and drop functionality
 *
 * @example
 * ```tsx
 * const { handleDragStart, handleDragEnd, handleDrop, getDragState } = useDragDrop({
 *   mimeType: 'application/my-app-item',
 *   onReorder: (from, to) => setItems(prev => reorder(prev, from, to))
 * });
 *
 * return items.map((item, index) => (
 *   <div
 *     key={item.id}
 *     draggable
 *     onDragStart={(e) => handleDragStart(e, { id: item.id, data: item, index })}
 *     onDragEnd={handleDragEnd}
 *     className={getDragState(item.id).isDragging ? 'opacity-50' : ''}
 *   >
 *     {item.name}
 *   </div>
 * ));
 * ```
 */
export function useDragDrop<T = unknown>(
  options: UseDragDropOptions<T> = {}
): UseDragDropReturn<T> {
  const {
    mimeType = 'application/x-drag-item',
    enableKeyboard = true,
    containerRef,
    itemIds = [],
    onReorder,
    onExternalDrop: _onExternalDrop,
    multiSelect = false,
    selectedIds = [],
  } = options;

  // Refs for drag state (avoid re-renders during drag)
  const dragItemRef = useRef<DragItem<T> | null>(null);
  const dragOverItemRef = useRef<DragItem<T> | null>(null);
  const dragOverPositionRef = useRef<'before' | 'after' | null>(null);

  // State for UI updates
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<'before' | 'after' | null>(null);
  const [dropTargetStates, setDropTargetStates] = useState<Record<string, DropState>>({});

  // Keyboard drag state
  const [keyboardDragState, setKeyboardDragState] = useState<KeyboardDragState>({
    isKeyboardDragging: false,
    draggedItemId: null,
    dropTargetId: null,
  });

  // Focused item index for keyboard navigation
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  // Handle drag start
  const handleDragStart = useCallback(
    (e: React.DragEvent, item: DragItem<T>) => {
      dragItemRef.current = item;
      setDraggingId(item.id);

      // Set drag data
      const dragData = JSON.stringify(item);
      e.dataTransfer.setData(mimeType, dragData);
      e.dataTransfer.setData('text/plain', item.id);
      e.dataTransfer.effectAllowed = multiSelect && selectedIds.includes(item.id) ? 'copyMove' : 'move';

      // Set drag image if multi-select
      if (multiSelect && selectedIds.length > 1 && selectedIds.includes(item.id)) {
        const count = selectedIds.length;
        const div = document.createElement('div');
        div.className = 'bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg font-medium';
        div.textContent = `${count} items`;
        document.body.appendChild(div);
        e.dataTransfer.setDragImage(div, 0, 0);
        setTimeout(() => document.body.removeChild(div), 0);
      }

      // Dispatch custom event for external listeners
      window.dispatchEvent(
        new CustomEvent('dragstart', {
          detail: { item, selectedIds: multiSelect ? selectedIds : [item.id] },
        })
      );
    },
    [mimeType, multiSelect, selectedIds]
  );

  // Handle drag end
  const handleDragEnd = useCallback((_e: React.DragEvent) => {
    dragItemRef.current = null;
    dragOverItemRef.current = null;
    dragOverPositionRef.current = null;
    setDraggingId(null);
    setDragOverId(null);
    setDragPosition(null);

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('dragend'));
  }, []);

  // Calculate drop position
  const calculateDropPosition = useCallback(
    (e: React.DragEvent, targetRect: DOMRect): 'before' | 'after' => {
      const offset = e.clientY - targetRect.top;
      const threshold = targetRect.height / 2;
      return offset < threshold ? 'before' : 'after';
    },
    []
  );

  // Handle drag over
  const handleDragOver = useCallback(
    (e: React.DragEvent, item: DragItem<T>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      if (dragItemRef.current?.id === item.id) return;

      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const position = calculateDropPosition(e, rect);

      dragOverItemRef.current = item;
      dragOverPositionRef.current = position;
      setDragOverId(item.id);
      setDragPosition(position);
    },
    [calculateDropPosition]
  );

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;

    if (!currentTarget.contains(relatedTarget)) {
      dragOverItemRef.current = null;
      dragOverPositionRef.current = null;
      setDragOverId(null);
      setDragPosition(null);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent, targetItem?: DragItem<T>) => {
      e.preventDefault();

      const draggedItem = dragItemRef.current;
      if (!draggedItem) return;

      const dropTarget = targetItem || dragOverItemRef.current;
      if (!dropTarget || draggedItem.id === dropTarget.id) {
        handleDragEnd(e);
        return;
      }

      const position = dragOverPositionRef.current || 'after';
      let toIndex = dropTarget.index;
      if (position === 'after') {
        toIndex += 1;
      }
      if (draggedItem.index < toIndex) {
        toIndex -= 1;
      }

      onReorder?.(draggedItem.index, toIndex);
      handleDragEnd(e);
    },
    [onReorder, handleDragEnd]
  );

  // Handle drop target drag over
  const handleDropTargetDragOver = useCallback(
    (e: React.DragEvent, targetId: string, accepts: string[]) => {
      e.preventDefault();

      // Check if we can accept this drop
      const canAccept = accepts.some((type) => e.dataTransfer.types.includes(type));
      if (!canAccept && !e.dataTransfer.types.includes(mimeType)) return;

      e.dataTransfer.dropEffect = 'copy';

      setDropTargetStates((prev) => ({
        ...prev,
        [targetId]: { isDragOver: true, canDrop: true },
      }));
    },
    [mimeType]
  );

  // Handle drop target drag leave
  const handleDropTargetDragLeave = useCallback((e: React.DragEvent, targetId: string) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;

    if (!currentTarget.contains(relatedTarget)) {
      setDropTargetStates((prev) => ({
        ...prev,
        [targetId]: { isDragOver: false, canDrop: false },
      }));
    }
  }, []);

  // Handle drop target drop
  const handleDropTargetDrop = useCallback(
    (e: React.DragEvent, targetId: string, onDrop: (items: DragItem<T>[]) => void) => {
      e.preventDefault();

      setDropTargetStates((prev) => ({
        ...prev,
        [targetId]: { isDragOver: false, canDrop: false },
      }));

      try {
        // Try to get items from our mime type
        const data = e.dataTransfer.getData(mimeType);
        if (data) {
          const item: DragItem<T> = JSON.parse(data);

          // Handle multi-select
          if (multiSelect && selectedIds.includes(item.id) && selectedIds.length > 1) {
            const items = selectedIds
              .map((id) => ({ id, data: item.data, index: -1 } as DragItem<T>))
              .filter((i) => i.id !== item.id);
            items.unshift(item);
            onDrop(items);
          } else {
            onDrop([item]);
          }
          return;
        }

        // Try text/plain as fallback
        const textId = e.dataTransfer.getData('text/plain');
        if (textId) {
          onDrop([{ id: textId, data: null as T, index: -1 }]);
        }
      } catch {
        // Silently fail on parse error
      }
    },
    [mimeType, multiSelect, selectedIds]
  );

  // Keyboard drag start
  const handleKeyDragStart = useCallback((itemId: string) => {
    if (!enableKeyboard) return;

    setKeyboardDragState({
      isKeyboardDragging: true,
      draggedItemId: itemId,
      dropTargetId: null,
    });
  }, [enableKeyboard]);

  // Keyboard drop
  const handleKeyDrop = useCallback(
    (targetId: string): boolean => {
      if (!keyboardDragState.isKeyboardDragging || !keyboardDragState.draggedItemId) {
        return false;
      }

      if (keyboardDragState.draggedItemId === targetId) {
        // Cancel if dropped on self
        handleKeyCancel();
        return false;
      }

      // Find indices
      const fromIndex = itemIds.indexOf(keyboardDragState.draggedItemId);
      const toIndex = itemIds.indexOf(targetId);

      if (fromIndex !== -1 && toIndex !== -1) {
        onReorder?.(fromIndex, toIndex);
      }

      handleKeyCancel();
      return true;
    },
    [keyboardDragState, itemIds, onReorder]
  );

  // Keyboard cancel
  const handleKeyCancel = useCallback(() => {
    setKeyboardDragState({
      isKeyboardDragging: false,
      draggedItemId: null,
      dropTargetId: null,
    });
  }, []);

  // Move keyboard focus
  const moveKeyboardFocus = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      if (!itemIds.length) return;

      let newIndex = focusedIndex;

      if (direction === 'up' || direction === 'left') {
        newIndex = focusedIndex > 0 ? focusedIndex - 1 : itemIds.length - 1;
      } else {
        newIndex = focusedIndex < itemIds.length - 1 ? focusedIndex + 1 : 0;
      }

      setFocusedIndex(newIndex);

      // Focus the element
      const container = containerRef?.current;
      if (container) {
        const elements = container.querySelectorAll('[data-drag-id]');
        const element = elements[newIndex] as HTMLElement;
        element?.focus();
      }
    },
    [focusedIndex, itemIds.length, containerRef]
  );

  // Get drag state for an item
  const getDragState = useCallback(
    (itemId: string): DragState => ({
      isDragging: draggingId === itemId,
      isDragOver: dragOverId === itemId,
      dragPosition: dragOverId === itemId ? dragPosition : null,
    }),
    [draggingId, dragOverId, dragPosition]
  );

  // Get drop state for a target
  const getDropState = useCallback(
    (targetId: string): DropState =>
      dropTargetStates[targetId] || { isDragOver: false, canDrop: false },
    [dropTargetStates]
  );

  // Reorder helper
  const reorderItems = useCallback(<U,>(items: U[], fromIndex: number, toIndex: number): U[] => {
    if (fromIndex === toIndex) return items;

    const result = [...items];
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);
    return result;
  }, []);

  // Keyboard event listener
  useEffect(() => {
    if (!enableKeyboard || !containerRef?.current) return;

    const container = containerRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Space to start keyboard drag
      if (e.key === ' ' && !keyboardDragState.isKeyboardDragging) {
        const activeElement = document.activeElement as HTMLElement;
        const dragId = activeElement?.dataset.dragId;
        if (dragId) {
          e.preventDefault();
          handleKeyDragStart(dragId);
        }
      }

      // Escape to cancel
      if (e.key === 'Escape' && keyboardDragState.isKeyboardDragging) {
        handleKeyCancel();
      }

      // Enter to drop
      if (e.key === 'Enter' && keyboardDragState.isKeyboardDragging) {
        const activeElement = document.activeElement as HTMLElement;
        const dropId = activeElement?.dataset.dragId;
        if (dropId) {
          handleKeyDrop(dropId);
        }
      }

      // Arrow keys for navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const direction = e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? 'up' : 'down';
        moveKeyboardFocus(direction);
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboard, containerRef, keyboardDragState.isKeyboardDragging, handleKeyDragStart, handleKeyCancel, handleKeyDrop, moveKeyboardFocus]);

  return {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDropTargetDragOver,
    handleDropTargetDragLeave,
    handleDropTargetDrop,
    handleKeyDragStart,
    handleKeyDrop,
    handleKeyCancel,
    moveKeyboardFocus,
    getDragState,
    getDropState,
    keyboardDragState,
    reorderItems,
  };
}

export default useDragDrop;

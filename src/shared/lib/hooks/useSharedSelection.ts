/**
 * useSharedSelection Hook
 *
 * Manages shared selection state across components.
 * Provides selection tracking with modifier key support (Ctrl/Cmd, Shift).
 */

import { useCallback, useState } from 'react';

export interface UseSharedSelectionReturn {
  selectedIds: Set<string>;
  count: number;
  handleSelectWithModifier: (id: string, event: React.MouseEvent, items?: Array<{ id: string }>) => void;
  select: (id: string | string[]) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
}

export function useSharedSelection(): UseSharedSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const select = useCallback((id: string | string[]) => {
    const ids = Array.isArray(id) ? id : [id];
    setSelectedIds(prev => {
      const next = new Set(prev);
      ids.forEach(i => next.add(i));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback((id: string) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  const toggle = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectWithModifier = useCallback(
    (id: string, event: React.MouseEvent, items?: Array<{ id: string }>) => {
      const isCtrlCmd = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;

      if (isCtrlCmd) {
        // Toggle selection with Ctrl/Cmd
        toggle(id);
      } else if (isShift && items && items.length > 0) {
        // Range selection with Shift
        const lastSelected = Array.from(selectedIds).pop();
        if (lastSelected) {
          const lastIndex = items.findIndex(item => item.id === lastSelected);
          const currentIndex = items.findIndex(item => item.id === id);
          if (lastIndex !== -1 && currentIndex !== -1) {
            const start = Math.min(lastIndex, currentIndex);
            const end = Math.max(lastIndex, currentIndex);
            const rangeIds = items.slice(start, end + 1).map(item => item.id);
            setSelectedIds(prev => {
              const next = new Set(prev);
              rangeIds.forEach(i => next.add(i));
              return next;
            });
          } else {
            select(id);
          }
        } else {
          select(id);
        }
      } else {
        // Single selection
        setSelectedIds(new Set([id]));
      }
    },
    [toggle, select, selectedIds]
  );

  return {
    selectedIds,
    count: selectedIds.size,
    handleSelectWithModifier,
    select,
    clear,
    isSelected,
    toggle,
  };
}

export default useSharedSelection;

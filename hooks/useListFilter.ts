/**
 * useListFilter - Generic hook for list filtering and sorting
 *
 * Provides filter text state, sort configuration, and memoized filtered/sorted results.
 * Extracted from common patterns in ArchiveView and similar list components.
 */

import { useCallback, useMemo, useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  /** Key to sort by (can be a keyof T or a custom string key) */
  key: string;
  /** Sort direction */
  direction: SortDirection;
  /** Custom sort function (optional) */
  compareFn?: (a: T, b: T) => number;
}

export interface UseListFilterOptions<T> {
  /** Initial filter text */
  initialFilter?: string;
  /** Initial sort configuration */
  initialSort?: SortConfig<T>;
  /** Function to extract searchable text from an item */
  getSearchableText: (item: T) => string;
  /** Default sort function if no custom compareFn provided */
  defaultCompareFn?: (a: T, b: T, key: string) => number;
}

export interface UseListFilterReturn<T> {
  /** Current filter text */
  filter: string;
  /** Set filter text */
  setFilter: (value: string) => void;
  /** Clear filter text */
  clearFilter: () => void;
  /** Current sort configuration */
  sort: SortConfig<T>;
  /** Set sort configuration */
  setSort: (config: SortConfig<T>) => void;
  /** Set sort key (preserves direction) */
  setSortKey: (key: string) => void;
  /** Toggle sort direction for current key */
  toggleSortDirection: () => void;
  /** Filtered and sorted items */
  filteredItems: T[];
  /** Original items count */
  totalCount: number;
  /** Filtered items count */
  filteredCount: number;
}

/**
 * Generic hook for list filtering and sorting
 *
 * @example
 * // Basic usage
 * const { filteredItems, filter, setFilter, sort, setSortKey } = useListFilter({
 *   items: users,
 *   getSearchableText: (user) => `${user.name} ${user.email}`,
 * });
 *
 * @example
 * // With custom sort
 * const { filteredItems, sort, toggleSortDirection } = useListFilter({
 *   items: products,
 *   getSearchableText: (p) => p.name,
 *   initialSort: { key: 'price', direction: 'desc' },
 *   defaultCompareFn: (a, b, key) => (a[key] > b[key] ? 1 : -1),
 * });
 */
export function useListFilter<T>(
  items: T[],
  options: UseListFilterOptions<T>
): UseListFilterReturn<T> {
  const {
    initialFilter = '',
    initialSort = { key: 'default', direction: 'asc' },
    getSearchableText,
    defaultCompareFn = (a: T, b: T, key: string) => {
      // Default string comparison
      const aVal = String((a as Record<string, unknown>)[key] ?? '');
      const bVal = String((b as Record<string, unknown>)[key] ?? '');
      return aVal.localeCompare(bVal);
    },
  } = options;

  const [filter, setFilter] = useState(initialFilter);
  const [sort, setSort] = useState<SortConfig<T>>(initialSort);

  const clearFilter = useCallback(() => {
    setFilter('');
  }, []);

  const setSortKey = useCallback((key: string) => {
    setSort(prev => ({
      key,
      direction: prev.key === key ? prev.direction : 'asc',
      compareFn: prev.compareFn,
    }));
  }, []);

  const toggleSortDirection = useCallback(() => {
    setSort(prev => ({
      ...prev,
      direction: prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const filteredItems = useMemo(() => {
    // First filter
    const safeFilter = typeof filter === 'string' ? filter : '';
    const filtered = safeFilter.trim()
      ? items.filter(item =>
          getSearchableText(item).toLowerCase().includes(safeFilter.toLowerCase())
        )
      : [...items];

    // Then sort
    if (sort.compareFn) {
      filtered.sort(sort.compareFn);
    } else if (sort.key !== 'default') {
      filtered.sort((a, b) => {
        const result = defaultCompareFn(a, b, sort.key);
        return sort.direction === 'desc' ? -result : result;
      });
    }

    return filtered;
  }, [items, filter, sort, getSearchableText, defaultCompareFn]);

  return {
    filter,
    setFilter,
    clearFilter,
    sort,
    setSort,
    setSortKey,
    toggleSortDirection,
    filteredItems,
    totalCount: items.length,
    filteredCount: filteredItems.length,
  };
}

export default useListFilter;

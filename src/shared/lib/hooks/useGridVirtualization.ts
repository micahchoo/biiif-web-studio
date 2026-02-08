/**
 * useGridVirtualization Hook
 *
 * Provides virtualization support for large grids.
 * Calculates visible range and column count based on container dimensions.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseGridVirtualizationOptions {
  itemHeight?: number;
  itemWidth?: number;
  containerHeight?: number;
  containerWidth?: number;
  overscan?: number;
}

export interface UseGridVirtualizationReturn {
  visibleRange: {
    start: number;
    end: number;
  };
  columns: number;
  scrollTop: number;
  setScrollTop: (top: number) => void;
}

export function useGridVirtualization(
  options: UseGridVirtualizationOptions = {}
): UseGridVirtualizationReturn {
  const {
    itemHeight = 200,
    itemWidth = 200,
    containerHeight = 600,
    containerWidth = 1200,
    overscan = 3,
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const [columns, setColumns] = useState(1);

  // Calculate columns based on container width
  useEffect(() => {
    const cols = Math.max(1, Math.floor(containerWidth / itemWidth));
    setColumns(cols);
  }, [containerWidth, itemWidth]);

  // Calculate visible range based on scroll position
  useEffect(() => {
    const itemsPerRow = columns || 1;
    const visibleRows = Math.ceil(containerHeight / itemHeight);

    const startRow = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endRow = startRow + visibleRows + overscan * 2;

    const start = startRow * itemsPerRow;
    const end = (endRow + 1) * itemsPerRow;

    setVisibleRange({ start, end });
  }, [scrollTop, itemHeight, containerHeight, columns, overscan]);

  return {
    visibleRange,
    columns,
    scrollTop,
    setScrollTop,
  };
}

export default useGridVirtualization;

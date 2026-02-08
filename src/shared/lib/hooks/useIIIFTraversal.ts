/**
 * useIIIFTraversal Hook
 *
 * Provides utilities for traversing IIIF manifest hierarchies.
 * Helps collect items (canvases, ranges) from a manifest tree structure.
 */

import { useCallback, useMemo } from 'react';
import type { IIIFCanvas, IIIFItem } from '@/src/shared/types';

export interface UseIIIFTraversalReturn {
  getAllCanvases: () => IIIFCanvas[];
  getAllItems: () => IIIFItem[];
  getChildItems: (parentId: string) => IIIFItem[];
  getAncestors: (item: IIIFItem) => IIIFItem[];
}

export function useIIIFTraversal(root: IIIFItem | null): UseIIIFTraversalReturn {
  const getAllCanvases = useCallback((): IIIFCanvas[] => {
    if (!root) return [];

    const canvases: IIIFCanvas[] = [];

    const traverse = (item: IIIFItem) => {
      if (item.type === 'Canvas') {
        canvases.push(item as IIIFCanvas);
      }

      if (item.items && Array.isArray(item.items)) {
        for (const child of item.items) {
          traverse(child);
        }
      }
    };

    traverse(root);
    return canvases;
  }, [root]);

  const getAllItems = useCallback((): IIIFItem[] => {
    if (!root) return [];

    const items: IIIFItem[] = [];

    const traverse = (item: IIIFItem) => {
      items.push(item);
      if (item.items && Array.isArray(item.items)) {
        for (const child of item.items) {
          traverse(child);
        }
      }
    };

    traverse(root);
    return items;
  }, [root]);

  const getChildItems = useCallback(
    (parentId: string): IIIFItem[] => {
      if (!root) return [];

      let parent: IIIFItem | null = null;

      const findParent = (item: IIIFItem) => {
        if (item.id === parentId) {
          parent = item;
          return;
        }
        if (item.items && Array.isArray(item.items)) {
          for (const child of item.items) {
            findParent(child);
          }
        }
      };

      findParent(root);
      return parent?.items || [];
    },
    [root]
  );

  const getAncestors = useCallback(
    (item: IIIFItem): IIIFItem[] => {
      if (!root) return [];

      const ancestors: IIIFItem[] = [];

      const findAncestors = (current: IIIFItem, target: IIIFItem): boolean => {
        if (current.id === target.id) return true;

        if (current.items && Array.isArray(current.items)) {
          for (const child of current.items) {
            if (findAncestors(child, target)) {
              ancestors.push(current);
              return true;
            }
          }
        }

        return false;
      };

      findAncestors(root, item);
      return ancestors.reverse();
    },
    [root]
  );

  return useMemo(
    () => ({
      getAllCanvases,
      getAllItems,
      getChildItems,
      getAncestors,
    }),
    [getAllCanvases, getAllItems, getChildItems, getAncestors]
  );
}

export default useIIIFTraversal;

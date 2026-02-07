/**
 * useViewingDirection Hook
 *
 * Resolves CSS layout properties from IIIF viewingDirection.
 * Used by ArchiveGrid, FilmstripNavigator, and Board auto-layout.
 *
 * @see https://iiif.io/api/presentation/3.0/#viewingdirection
 */

import { useMemo } from 'react';

export type ViewingDirection = 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top';

export interface DirectionLayout {
  /** CSS flex-direction for grid containers */
  gridDirection: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  /** Axis for filmstrip/scroll layouts */
  filmstripAxis: 'horizontal' | 'vertical';
  /** Whether reading direction is right-to-left */
  isRTL: boolean;
  /** Whether reading direction is vertical */
  isVertical: boolean;
  /** Label for the "previous" navigation action */
  prevLabel: string;
  /** Label for the "next" navigation action */
  nextLabel: string;
  /** CSS direction property */
  cssDirection: 'ltr' | 'rtl';
}

/**
 * Resolve CSS layout properties from a IIIF viewingDirection value.
 */
export function resolveDirectionLayout(dir: ViewingDirection | undefined): DirectionLayout {
  switch (dir) {
    case 'right-to-left':
      return {
        gridDirection: 'row-reverse',
        filmstripAxis: 'horizontal',
        isRTL: true,
        isVertical: false,
        prevLabel: 'Next',
        nextLabel: 'Previous',
        cssDirection: 'rtl',
      };
    case 'top-to-bottom':
      return {
        gridDirection: 'column',
        filmstripAxis: 'vertical',
        isRTL: false,
        isVertical: true,
        prevLabel: 'Up',
        nextLabel: 'Down',
        cssDirection: 'ltr',
      };
    case 'bottom-to-top':
      return {
        gridDirection: 'column-reverse',
        filmstripAxis: 'vertical',
        isRTL: false,
        isVertical: true,
        prevLabel: 'Down',
        nextLabel: 'Up',
        cssDirection: 'ltr',
      };
    case 'left-to-right':
    default:
      return {
        gridDirection: 'row',
        filmstripAxis: 'horizontal',
        isRTL: false,
        isVertical: false,
        prevLabel: 'Previous',
        nextLabel: 'Next',
        cssDirection: 'ltr',
      };
  }
}

/**
 * React hook that memoizes the direction layout resolution.
 */
export function useViewingDirection(dir: ViewingDirection | undefined): DirectionLayout {
  return useMemo(() => resolveDirectionLayout(dir), [dir]);
}

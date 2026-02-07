/**
 * useViewingBehavior Hook
 *
 * Resolves effective viewing behaviors from manifest + canvas behaviors
 * using IIIF 3.0 inheritance rules.
 *
 * @see https://iiif.io/api/presentation/3.0/#behavior
 */

import { useMemo } from 'react';
import type { IIIFCanvas, IIIFManifest } from '@/src/shared/types';

export type ViewingLayout = 'individuals' | 'continuous' | 'paged';

export interface ViewingBehavior {
  /** Resolved layout mode from behaviors */
  layout: ViewingLayout;
  /** Whether to auto-advance to next canvas when media ends */
  autoAdvance: boolean;
  /** Whether to repeat from beginning after last canvas */
  repeat: boolean;
  /** Canvas IDs with 'facing-pages' behavior */
  facingPages: Set<string>;
  /** Canvas IDs with 'non-paged' behavior */
  nonPaged: Set<string>;
  /** Whether items are unordered */
  unordered: boolean;
}

/**
 * Extract a layout behavior from a behavior array
 */
function resolveLayout(behaviors: string[]): ViewingLayout | null {
  if (behaviors.includes('continuous')) return 'continuous';
  if (behaviors.includes('paged')) return 'paged';
  if (behaviors.includes('individuals')) return 'individuals';
  return null;
}

/**
 * Resolve viewing behaviors from manifest and its canvases.
 * Canvas behaviors inherit from manifest behaviors per IIIF spec.
 */
export function useViewingBehavior(
  manifest: IIIFManifest | null,
  canvases: IIIFCanvas[]
): ViewingBehavior {
  return useMemo(() => {
    const manifestBehaviors = manifest?.behavior || [];

    // Resolve layout: canvas-level doesn't override manifest layout
    const layout = resolveLayout(manifestBehaviors) || 'individuals';

    // Temporal behaviors: manifest-level
    const autoAdvance = manifestBehaviors.includes('auto-advance') &&
      !manifestBehaviors.includes('no-auto-advance');
    const repeat = manifestBehaviors.includes('repeat') &&
      !manifestBehaviors.includes('no-repeat');

    // Unordered
    const unordered = manifestBehaviors.includes('unordered');

    // Canvas-specific behaviors
    const facingPages = new Set<string>();
    const nonPaged = new Set<string>();

    for (const canvas of canvases) {
      const cb = canvas.behavior || [];
      if (cb.includes('facing-pages')) {
        facingPages.add(canvas.id);
      }
      if (cb.includes('non-paged')) {
        nonPaged.add(canvas.id);
      }
    }

    return {
      layout,
      autoAdvance,
      repeat,
      facingPages,
      nonPaged,
      unordered,
    };
  }, [manifest?.id, manifest?.behavior, canvases]);
}

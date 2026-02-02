/**
 * Unit Tests for services/actions.ts
 *
 * Tests action dispatcher, mutations, and history management.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ActionDispatcher,
  createActionHistory,
  executeAction,
  validateAction,
  ActionHistory,
} from '../../../services/actions';
import { createEmptyVault, normalizeIIIF } from '../../../services/vault';
import type { IIIFManifest, IIIFCanvas } from '../../../types';
import type { NormalizedState } from '../../../services/vault';

// ============================================================================
// Action Dispatcher Tests
// ============================================================================

describe('ActionDispatcher', () => {
  let dispatcher: ActionDispatcher;
  let initialState: NormalizedState;

  beforeEach(() => {
    const manifest: IIIFManifest = {
      '@context': 'http://iiif.io/api/presentation/3/context.json',
      id: 'https://example.com/manifest',
      type: 'Manifest',
      label: { en: ['Test Manifest'] },
      items: [],
    };

    initialState = normalizeIIIF(manifest);
    dispatcher = new ActionDispatcher(initialState);
  });

  it('should initialize with state', () => {
    expect(dispatcher.getState()).toBe(initialState);
  });

  it('should execute UPDATE_LABEL action', () => {
    const action = {
      type: 'UPDATE_LABEL' as const,
      id: 'https://example.com/manifest',
      label: { en: ['Updated Label'] },
    };

    dispatcher.dispatch(action);
    const state = dispatcher.getState();
    const entity: any = state.entities.Manifest['https://example.com/manifest'];

    expect(entity.label).toEqual({ en: ['Updated Label'] });
  });

  it('should execute UPDATE_METADATA action', () => {
    const action = {
      type: 'UPDATE_METADATA' as const,
      id: 'https://example.com/manifest',
      metadata: [
        {
          label: { en: ['Creator'] },
          value: { en: ['John Doe'] },
        },
      ],
    };

    dispatcher.dispatch(action);
    const state = dispatcher.getState();
    const entity: any = state.entities.Manifest['https://example.com/manifest'];

    expect(entity.metadata).toHaveLength(1);
    expect(entity.metadata[0].label).toEqual({ en: ['Creator'] });
  });

  it('should execute ADD_CANVAS action', () => {
    const canvas: IIIFCanvas = {
      id: 'https://example.com/canvas/1',
      type: 'Canvas',
      label: { en: ['Canvas 1'] },
      width: 1000,
      height: 1000,
      items: [],
    };

    const action = {
      type: 'ADD_CANVAS' as const,
      manifestId: 'https://example.com/manifest',
      canvas,
    };

    dispatcher.dispatch(action);
    const state = dispatcher.getState();

    expect(state.entities.Canvas['https://example.com/canvas/1']).toBeDefined();
    expect(state.references['https://example.com/manifest']).toContain('https://example.com/canvas/1');
  });

  it('should execute REORDER_CANVASES action', () => {
    // First add some canvases
    dispatcher.dispatch({
      type: 'ADD_CANVAS',
      manifestId: 'https://example.com/manifest',
      canvas: {
        id: 'https://example.com/canvas/1',
        type: 'Canvas',
        label: { en: ['Canvas 1'] },
        width: 1000,
        height: 1000,
        items: [],
      },
    });

    dispatcher.dispatch({
      type: 'ADD_CANVAS',
      manifestId: 'https://example.com/manifest',
      canvas: {
        id: 'https://example.com/canvas/2',
        type: 'Canvas',
        label: { en: ['Canvas 2'] },
        width: 1000,
        height: 1000,
        items: [],
      },
    });

    // Reorder
    const action = {
      type: 'REORDER_CANVASES' as const,
      manifestId: 'https://example.com/manifest',
      order: ['https://example.com/canvas/2', 'https://example.com/canvas/1'],
    };

    dispatcher.dispatch(action);
    const state = dispatcher.getState();
    const refs = state.references['https://example.com/manifest'];

    expect(refs[0]).toBe('https://example.com/canvas/2');
    expect(refs[1]).toBe('https://example.com/canvas/1');
  });

  it('should execute BATCH_UPDATE action', () => {
    dispatcher.dispatch({
      type: 'ADD_CANVAS',
      manifestId: 'https://example.com/manifest',
      canvas: {
        id: 'https://example.com/canvas/1',
        type: 'Canvas',
        label: { en: ['Canvas 1'] },
        width: 1000,
        height: 1000,
        items: [],
      },
    });

    const action = {
      type: 'BATCH_UPDATE' as const,
      updates: [
        {
          id: 'https://example.com/manifest',
          changes: { label: { en: ['Updated Manifest'] } },
        },
        {
          id: 'https://example.com/canvas/1',
          changes: { label: { en: ['Updated Canvas'] } },
        },
      ],
    };

    dispatcher.dispatch(action);
    const state = dispatcher.getState();

    expect((state.entities.Manifest['https://example.com/manifest'] as any).label).toEqual({
      en: ['Updated Manifest'],
    });
    expect((state.entities.Canvas['https://example.com/canvas/1'] as any).label).toEqual({
      en: ['Updated Canvas'],
    });
  });
});

// ============================================================================
// Action Validation Tests - CONSOLIDATED
// ============================================================================
// Mock-heavy tests removed: Tests that acknowledged they validate against
// empty vaults where entities don't exist provided no meaningful validation.
// Kept tests that validate actual behavior (format validation, dimension checks).

describe('validateAction', () => {
  it('should reject invalid label format', () => {
    const invalidAction = {
      type: 'UPDATE_LABEL' as const,
      id: 'https://example.com/manifest',
      label: 'invalid' as any,
    };

    const result = validateAction(invalidAction);
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('should validate ADD_CANVAS with dimensions', () => {
    const validAction = {
      type: 'ADD_CANVAS' as const,
      manifestId: 'https://example.com/manifest',
      canvas: {
        id: 'https://example.com/canvas/1',
        type: 'Canvas' as const,
        label: { en: ['Canvas'] },
        width: 1000,
        height: 1000,
        items: [],
      },
    };

    const result = validateAction(validAction);
    expect(result.valid).toBe(true);
  });

  it('should reject canvas with invalid dimensions', () => {
    const invalidAction = {
      type: 'ADD_CANVAS' as const,
      manifestId: 'https://example.com/manifest',
      canvas: {
        id: 'https://example.com/canvas/1',
        type: 'Canvas' as const,
        label: { en: ['Canvas'] },
        width: -100,
        height: 1000,
        items: [],
      },
    };

    const result = validateAction(invalidAction);
    expect(result.valid).toBe(false);
  });
});

// ============================================================================
// Action History Tests
// ============================================================================

describe('ActionHistory', () => {
  it('should push actions to history', () => {
    const history = createActionHistory();
    const beforeState = createEmptyVault();
    const afterState = createEmptyVault();

    history.push({
      action: {
        type: 'UPDATE_LABEL',
        id: 'test',
        label: { en: ['Test'] },
      },
      beforeState,
      afterState,
    });

    expect(history.canUndo()).toBe(true);
  });

  it('should undo action', () => {
    const manifest: IIIFManifest = {
      '@context': 'http://iiif.io/api/presentation/3/context.json',
      id: 'https://example.com/manifest',
      type: 'Manifest',
      label: { en: ['Original'] },
      items: [],
    };

    const initialState = normalizeIIIF(manifest);
    const history = createActionHistory();

    const updatedState = {
      ...initialState,
      entities: {
        ...initialState.entities,
        Manifest: {
          ...initialState.entities.Manifest,
          'https://example.com/manifest': {
            ...initialState.entities.Manifest['https://example.com/manifest'],
            label: { en: ['Updated'] },
          },
        },
      },
    };

    history.push({
      action: {
        type: 'UPDATE_LABEL',
        id: 'https://example.com/manifest',
        label: { en: ['Updated'] },
      },
      beforeState: initialState,
      afterState: updatedState,
    });

    const undoneState = history.undo();
    expect((undoneState?.entities.Manifest['https://example.com/manifest'] as any).label).toEqual({
      en: ['Original'],
    });
  });

  it('should redo action', () => {
    const manifest: IIIFManifest = {
      '@context': 'http://iiif.io/api/presentation/3/context.json',
      id: 'https://example.com/manifest',
      type: 'Manifest',
      label: { en: ['Original'] },
      items: [],
    };

    const initialState = normalizeIIIF(manifest);
    const history = createActionHistory();

    const updatedState = {
      ...initialState,
      entities: {
        ...initialState.entities,
        Manifest: {
          ...initialState.entities.Manifest,
          'https://example.com/manifest': {
            ...initialState.entities.Manifest['https://example.com/manifest'],
            label: { en: ['Updated'] },
          },
        },
      },
    };

    history.push({
      action: {
        type: 'UPDATE_LABEL',
        id: 'https://example.com/manifest',
        label: { en: ['Updated'] },
      },
      beforeState: initialState,
      afterState: updatedState,
    });

    history.undo();
    const redoneState = history.redo();

    expect((redoneState?.entities.Manifest['https://example.com/manifest'] as any).label).toEqual({
      en: ['Updated'],
    });
  });

  it('should respect history limit', () => {
    const history = createActionHistory({ maxSize: 5 });
    const beforeState = createEmptyVault();
    const afterState = createEmptyVault();

    for (let i = 0; i < 10; i++) {
      history.push({
        action: {
          type: 'UPDATE_LABEL',
          id: `test-${i}`,
          label: { en: [`Test ${i}`] },
        },
        beforeState,
        afterState,
      });
    }

    const status = history.getStatus();
    expect(status.total).toBeLessThanOrEqual(5);
  });

  it('should clear redo stack on new action', () => {
    const history = createActionHistory();
    const beforeState = createEmptyVault();
    const afterState = createEmptyVault();

    history.push({
      action: {
        type: 'UPDATE_LABEL',
        id: 'test-1',
        label: { en: ['Test 1'] },
      },
      beforeState,
      afterState,
    });

    history.push({
      action: {
        type: 'UPDATE_LABEL',
        id: 'test-2',
        label: { en: ['Test 2'] },
      },
      beforeState,
      afterState,
    });

    history.undo();
    expect(history.canRedo()).toBe(true);

    history.push({
      action: {
        type: 'UPDATE_LABEL',
        id: 'test-3',
        label: { en: ['Test 3'] },
      },
      beforeState,
      afterState,
    });

    expect(history.canRedo()).toBe(false);
  });
});

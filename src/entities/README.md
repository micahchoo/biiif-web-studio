# Entity Layer (`src/entities/`)

The **entity layer** establishes FSD (Feature-Sliced Design) boundaries. It provides thin wrappers that expose domain-specific selectors and actions, preventing features from reaching directly into the service layer.

## Philosophy

**"Features import from entities, not from services."**

Instead of:
```typescript
// ❌ WRONG: Features reach into services directly
import { getEntity, updateEntity } from '@/services/vault';
import { actions } from '@/services/actions';

const canvas = getEntity(state, id);
updateEntity(state, id, newData);
```

Use:
```typescript
// ✅ CORRECT: Features import from entities
import { canvas } from '@/src/entities';

const canvasData = canvas.model.selectById(state, id);
canvas.actions.updateLabel(id, newData);
```

## Structure

```
src/entities/
├── canvas/
│   ├── model.ts          ← Canvas-specific selectors
│   ├── actions.ts        ← Canvas-specific action creators
│   ├── index.ts          ← Public API
│   └── README.md
├── manifest/
│   ├── model.ts
│   ├── actions.ts
│   ├── index.ts
│   ├── README.md
│   └── model/
│       └── vault/        ← Vault-specific implementations
├── collection/
│   ├── model.ts
│   ├── actions.ts
│   ├── index.ts
│   └── README.md
├── annotation/           ← Future entity
│   └── model/
│       └── selectors.ts
├── vault.ts              ← Vault entity exports
├── index.ts              ← Barrel export
└── README.md             (this file)
```

## What Each Entity Provides

### `model.ts` (Selectors)

Re-exports vault queries for that entity type. Example for canvas:

```typescript
import { getEntity, getChildIds, getParentId, getEntitiesByType } from '@/services/vault';

export const selectById = (state, id) => getEntity(state, id);
export const selectAnnotationPages = (state, canvasId) => getChildIds(state, canvasId);
export const selectParentManifest = (state, canvasId) => getParentId(state, canvasId);
export const selectAll = (state) => getEntitiesByType(state, 'Canvas');
export const selectDimensions = (state, canvasId) => { ... };
export const selectLabel = (state, canvasId) => { ... };
export const hasAnnotations = (state, canvasId): boolean => { ... };
export const countAnnotations = (state, canvasId): number => { ... };
```

### `actions.ts` (Action Creators)

Re-exports action creators for that entity type. Example for canvas:

```typescript
import { actions as vaultActions } from '@/services/actions';

export const updateLabel = (id, label) =>
  vaultActions.updateLabel(id, label);

export const updateDimensions = (id, width, height) =>
  vaultActions.updateCanvasDimensions(id, width, height);

export const addAnnotation = (canvasId, annotation) =>
  vaultActions.addAnnotation(canvasId, annotation);

export const removeAnnotation = (canvasId, annotationId) =>
  vaultActions.removeAnnotation(canvasId, annotationId);

export const moveToManifest = (canvasId, manifestId, index?) =>
  vaultActions.moveItem(canvasId, manifestId, index);

export const batchUpdate = (canvasId, changes) =>
  vaultActions.batchUpdate([{ id: canvasId, changes }]);
```

### `index.ts` (Public API)

```typescript
export * as model from './model';
export * as actions from './actions';
export type { IIIFCanvas } from '@/types';
```

## Available Entities

| Entity | Selectors | Actions | Description |
|--------|-----------|---------|-------------|
| `canvas` | 10+ selectors | 8 actions | IIIF Canvas entities |
| `manifest` | 12+ selectors | 12 actions | IIIF Manifest entities |
| `collection` | 12+ selectors | 8 actions | IIIF Collection entities |

## Usage in Features

```typescript
import { canvas, manifest, collection } from '@/src/entities';

export const ArchiveGrid = ({ root }) => {
  // Use selectors
  const manifests = manifest.model.selectAll(root);
  const canvasIds = manifest.model.selectCanvases(root, manifestId);
  const canvasData = canvas.model.selectById(root, canvasId);
  
  const handleUpdateCanvas = (canvasId, newLabel) => {
    // Create action (dispatch separately)
    const action = canvas.actions.updateLabel(canvasId, { en: [newLabel] });
    dispatch(action);
  };
  
  const handleMoveCanvas = (canvasId, newManifestId) => {
    const action = canvas.actions.moveToManifest(canvasId, newManifestId);
    dispatch(action);
  };
  
  return (
    // ... render
  );
};
```

## Rules

✅ **Correct Usage:**
- Import from `@/src/entities` not from `@/services`
- Use selectors in components or derived state
- Create actions, then dispatch them
- Entities are pure functions - no side effects

❌ **Incorrect Usage:**
- Don't import directly from `services/vault` in features
- Don't mutate entity data directly
- Don't bypass the entity layer
- Don't call dispatch from within entity actions

## Benefits

1. **Boundary enforcement** — Features can't accidentally reach into services
2. **Type safety** — Each entity has typed selectors and actions
3. **Testability** — Entity layer is pure functions, easy to unit test
4. **Refactoring safety** — Changes to vault don't leak to features
5. **Discoverability** — All entity operations are in one place

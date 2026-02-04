# Canvas Entity (`src/entities/canvas/`)

The **Canvas entity** represents a single IIIF Canvas — an individual page, image, or media item within a Manifest.

## What is a Canvas?

In IIIF Presentation API 3.0, a Canvas:
- Represents a single view (page, image, audio segment, etc.)
- Has dimensions (width, height) for spatial positioning
- Contains Annotation Pages with content (images, text, audio)
- Is always contained within a Manifest

## Entity Structure

```
src/entities/canvas/
├── model.ts      ← Selectors: read canvas data from vault
├── actions.ts    ← Action creators: modify canvas data
├── index.ts      ← Public API export
└── README.md     ← This file
```

## Usage in Features

### Reading Canvas Data (Model)

```typescript
import { canvas } from '@/src/entities';

// In a component or selector
const canvasData = canvas.model.selectById(state, canvasId);
const annotationPages = canvas.model.selectAnnotationPages(state, canvasId);
const parentManifest = canvas.model.selectParentManifest(state, canvasId);
const dimensions = canvas.model.selectDimensions(state, canvasId);
```

### Modifying Canvas Data (Actions)

```typescript
import { canvas } from '@/src/entities';
import { useVault } from '@/services/vault';

const vault = useVault();

// Update canvas label
const action = canvas.actions.updateLabel(canvasId, { en: ['New Label'] });
vault.dispatch(action);

// Update dimensions
const action = canvas.actions.updateDimensions(canvasId, 1920, 1080);
vault.dispatch(action);

// Add annotation
const action = canvas.actions.addAnnotation(canvasId, {
  type: 'Annotation',
  body: { type: 'TextualBody', value: 'Note' }
});
vault.dispatch(action);
```

## Available Selectors (Model)

| Selector | Purpose |
|----------|---------|
| `selectById(state, id)` | Get canvas by ID |
| `selectAnnotationPages(state, canvasId)` | Get annotation page IDs |
| `selectParentManifest(state, canvasId)` | Get containing manifest ID |
| `selectAll(state)` | Get all canvases |
| `selectDimensions(state, canvasId)` | Get width/height |
| `selectLabel(state, canvasId)` | Get localized label |
| `selectThumbnail(state, canvasId)` | Get thumbnail URL |

## Available Actions

| Action | Purpose |
|--------|---------|
| `updateLabel(canvasId, label)` | Update canvas label |
| `updateSummary(canvasId, summary)` | Update description |
| `updateMetadata(canvasId, metadata)` | Update metadata array |
| `updateDimensions(canvasId, width, height)` | Update dimensions |
| `addAnnotation(canvasId, annotation)` | Add annotation |
| `removeAnnotation(canvasId, annotationId)` | Remove annotation |
| `updateThumbnail(canvasId, thumbnail)` | Update thumbnail |

## Rules

✅ **Correct Usage:**
- Import from `@/src/entities` not from `@/services`
- Use selectors in components or derived state
- Dispatch actions through vault

❌ **Incorrect Usage:**
- Don't import directly from `services/vault` in features
- Don't mutate canvas data directly
- Don't bypass the entity layer

## Dependencies

```
canvas/entity
  ├── imports: services/vault, services/actions
  ├── used by: features/viewer, features/archive
  └── depends on: types.ts (IIIFCanvas)
```

---

See also:
- [`src/entities/manifest/`](../manifest/) — Parent entity
- [`src/entities/collection/`](../collection/) — Ancestor entity

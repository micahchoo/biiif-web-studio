# Manifest Entity (`src/entities/manifest/`)

The **Manifest entity** represents a IIIF Manifest — a collection of Canvases that together form a logical unit (book, photo album, audio recording, etc.).

## What is a Manifest?

In IIIF Presentation API 3.0, a Manifest:
- Contains an ordered list of Canvases
- Has descriptive metadata (label, description, attribution)
- Can belong to one or more Collections
- Is the primary unit users interact with

## Entity Structure

```
src/entities/manifest/
├── model.ts      ← Selectors: read manifest data from vault
├── actions.ts    ← Action creators: modify manifest data
├── index.ts      ← Public API export
└── README.md     ← This file
```

## Usage in Features

### Reading Manifest Data (Model)

```typescript
import { manifest } from '@/src/entities';

// In a component or selector
const manifestData = manifest.model.selectById(state, manifestId);
const canvasIds = manifest.model.selectCanvases(state, manifestId);
const parentCollection = manifest.model.selectParentCollection(state, manifestId);
const allManifests = manifest.model.selectAll(state);
```

### Modifying Manifest Data (Actions)

```typescript
import { manifest } from '@/src/entities';
import { useVault } from '@/services/vault';

const vault = useVault();

// Update manifest label
const action = manifest.actions.updateLabel(manifestId, { en: ['New Title'] });
vault.dispatch(action);

// Add canvas to manifest
const action = manifest.actions.addCanvas(manifestId, canvasId, 0); // at index 0
vault.dispatch(action);

// Reorder canvases
const action = manifest.actions.reorderCanvases(manifestId, [canvas3, canvas1, canvas2]);
vault.dispatch(action);
```

## Available Selectors (Model)

| Selector | Purpose |
|----------|---------|
| `selectById(state, id)` | Get manifest by ID |
| `selectCanvases(state, manifestId)` | Get canvas IDs in order |
| `selectParentCollection(state, manifestId)` | Get parent collection ID |
| `selectCollectionMemberships(state, manifestId)` | Get all collections containing this manifest |
| `selectAll(state)` | Get all manifests |
| `selectOrphaned(state)` | Get manifests not in any collection |
| `selectByLabel(state, query)` | Search manifests by label |
| `selectMetadata(state, manifestId)` | Get metadata array |

## Available Actions

| Action | Purpose |
|--------|---------|
| `updateLabel(manifestId, label)` | Update manifest label |
| `updateSummary(manifestId, summary)` | Update description |
| `updateMetadata(manifestId, metadata)` | Update metadata array |
| `addCanvas(manifestId, canvasId, index?)` | Add canvas at position |
| `removeCanvas(manifestId, canvasId)` | Remove canvas |
| `reorderCanvases(manifestId, canvasIds)` | Reorder canvas list |
| `setThumbnail(manifestId, canvasId)` | Set thumbnail canvas |
| `addToCollection(manifestId, collectionId)` | Add to collection |
| `removeFromCollection(manifestId, collectionId)` | Remove from collection |

## Relationships

```
Collection (parent)
    └── Manifest (this entity)
            ├── Canvas (children)
            │       └── AnnotationPage
            │               └── Annotation
            └── Thumbnail (reference to one Canvas)
```

## Rules

✅ **Correct Usage:**
- Import from `@/src/entities` not from `@/services`
- Use selectors for reading, actions for writing
- Compose with canvas selectors for full hierarchy

❌ **Incorrect Usage:**
- Don't modify `items` array directly
- Don't import from `services/vault` in features
- Don't assume single parent (manifests can be in multiple collections)

## Dependencies

```
manifest/entity
  ├── imports: services/vault, services/actions
  ├── used by: features/archive, features/board-design, features/export
  └── depends on: types.ts (IIIFManifest), entities/canvas
```

---

See also:
- [`src/entities/canvas/`](../canvas/) — Child entity
- [`src/entities/collection/`](../collection/) — Parent entity

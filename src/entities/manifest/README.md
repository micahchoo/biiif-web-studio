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
├── model.ts          ← Selectors: read manifest data from vault
├── actions.ts        ← Action creators: modify manifest data
├── index.ts          ← Public API export
├── README.md         ← This file
└── model/
    └── vault/        ← Vault-specific implementations
        ├── index.ts
        ├── types.ts
        ├── vault.ts
        ├── normalization.ts
        ├── denormalization.ts
        ├── queries.ts
        ├── updates.ts
        ├── movement.ts
        ├── cloning.ts
        ├── extensions.ts
        ├── trash.ts
        └── collections.ts
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
const orphaned = manifest.model.selectOrphaned(state); // Not in any collection
const byLabel = manifest.model.selectByLabel(state, 'search term');
const metadata = manifest.model.selectMetadata(state, manifestId);
const rights = manifest.model.selectRights(state, manifestId);
const navDate = manifest.model.selectNavDate(state, manifestId);
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

// Remove canvas
const action = manifest.actions.removeCanvas(manifestId, canvasId);
vault.dispatch(action);

// Reorder canvases
const action = manifest.actions.reorderCanvases(manifestId, [canvas3, canvas1, canvas2]);
vault.dispatch(action);

// Move to different collection
const action = manifest.actions.moveToCollection(manifestId, collectionId);
vault.dispatch(action);

// Update navDate (for timeline)
const action = manifest.actions.updateNavDate(manifestId, '2024-01-15');
vault.dispatch(action);

// Update viewing direction
const action = manifest.actions.updateViewingDirection(manifestId, 'right-to-left');
vault.dispatch(action);

// Update behavior
const action = manifest.actions.updateBehavior(manifestId, ['paged']);
vault.dispatch(action);

// Batch update
const action = manifest.actions.batchUpdate(manifestId, { label: { en: ['New'] } });
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
| `selectRights(state, manifestId)` | Get rights statement |
| `selectNavDate(state, manifestId)` | Get navigation date |
| `selectAncestors(state, manifestId)` | Get path to root |
| `selectDescendants(state, manifestId)` | Get all nested items |

## Available Actions

| Action | Purpose |
|--------|---------|
| `updateLabel(manifestId, label)` | Update manifest label |
| `updateSummary(manifestId, summary)` | Update description |
| `updateMetadata(manifestId, metadata)` | Update metadata array |
| `updateRights(manifestId, rights)` | Update rights statement |
| `updateNavDate(manifestId, navDate)` | Update navigation date |
| `updateViewingDirection(manifestId, direction)` | Update viewing direction |
| `updateBehavior(manifestId, behavior)` | Update viewing behaviors |
| `addCanvas(manifestId, canvasId, index?)` | Add canvas at position |
| `removeCanvas(manifestId, canvasId)` | Remove canvas |
| `reorderCanvases(manifestId, canvasIds)` | Reorder canvas list |
| `moveToCollection(manifestId, collectionId, index?)` | Move to collection |
| `batchUpdate(manifestId, changes)` | Update multiple properties |

## Vault Model (`model/vault/`)

The vault subdirectory contains the underlying vault implementation:

| File | Purpose |
|------|---------|
| `types.ts` | Type definitions for vault state |
| `vault.ts` | Core vault state management |
| `normalization.ts` | IIIF to normalized state conversion |
| `denormalization.ts` | Normalized state to IIIF conversion |
| `queries.ts` | Query functions (getEntity, getChildren, etc.) |
| `updates.ts` | Update functions (add, remove, update) |
| `movement.ts` | Move/reorder operations |
| `cloning.ts` | Deep clone operations |
| `extensions.ts` | Vault extension points |
| `trash.ts` | Soft delete / trash functionality |
| `collections.ts` | Collection-specific operations |

## Relationships

```
Collection (parent)
    └── Manifest (this entity)
            ├── Canvas (children)
            │       └── AnnotationPage
            │               └── Annotation
            └── Thumbnail (reference to one Canvas)
```

A manifest can belong to multiple collections (many-to-many via membership).

## Rules

✅ **Correct Usage:**
- Import from `@/src/entities` not from `@/services`
- Use selectors for reading, actions for writing
- Dispatch actions through vault
- Use entity operations, not raw vault calls

❌ **Incorrect Usage:**
- Don't import directly from `services/vault` in features
- Don't mutate manifest data directly
- Don't call vault methods directly from features

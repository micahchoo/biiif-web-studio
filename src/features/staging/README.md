# Staging Feature (`src/features/staging/`)

The **staging feature** provides a two-pane workbench for importing and organizing IIIF resources.

## Scope

This feature handles:
- Source manifest management (left pane)
- Target collection management (right pane)
- Drag-drop between panes
- Canvas reordering within manifests
- Merging similar files (e.g., multi-angle shots)
- Checkpoint/resume for large imports

## Structure

```
staging/
├── ui/
│   └── organisms/
│       └── StagingView.tsx       ← Main two-pane workbench
├── model/
│   └── index.ts                  ← Source manifest operations, collection creation
├── index.ts                      ← Public API
└── README.md                     ← This file
```

## Atomic Design Compliance

### Organisms (This Feature)
- **StagingView**: Composes ViewContainer, FilterInput, Toolbar, EmptyState molecules
- Receives `cx` and `fieldMode` via props from FieldModeTemplate
- No direct hook calls to useAppSettings or useContextualStyles

### Molecules Used (From Shared)
- `ViewContainer`: Consistent view wrapper with header
- `FilterInput`: Search/filter input with debounce
- `Toolbar`: Action button group
- `EmptyState`: Empty/loading states

### Atoms Used (From Shared)
- `Button`: Action buttons

## Future Molecules Needed
- `SourcePane`: Draggable manifest list (feature-specific or shared)
- `CanvasItem`: Thumbnail + label for canvases
- `CollectionCard`: Card representing a target collection
- `SendToCollectionModal`: Modal for selecting destination

## Usage

```typescript
import { StagingView, type SourceManifests } from '@/src/features/staging';

const sourceManifests: SourceManifests = {
  byId: { /* ... */ },
  allIds: ['manifest-1', 'manifest-2']
};

<FieldModeTemplate>
  {({ cx, fieldMode }) => (
    <StagingView
      sourceManifests={sourceManifests}
      targetCollections={collections}
      cx={cx}
      fieldMode={fieldMode}
      onAddToCollection={handleAdd}
      onCreateCollection={handleCreate}
      onReorderCanvases={handleReorder}
      onRemoveFromSource={handleRemove}
    />
  )}
</FieldModeTemplate>
```

## Model API

### Source Manifest Operations
```typescript
import {
  createSourceManifest,
  addSourceManifest,
  removeSourceManifest,
  reorderCanvases,
  selectAllSourceManifests,
  selectTotalCanvasCount,
} from '@/src/features/staging';

// Create from IIIF manifest
const source = createSourceManifest(iiifManifest);

// Add to collection
const updated = addSourceManifest(sourceManifests, source);

// Reorder canvases
const reordered = reorderCanvases(sourceManifests, manifestId, newOrder);
```

### Collection Creation
```typescript
import { createCollectionFromManifests } from '@/src/features/staging';

const collection = createCollectionFromManifests('My Collection', manifests);
```

### Similarity Detection
```typescript
import { findSimilarFilenames, mergeSourceManifests } from '@/src/features/staging';

// Find similar files
const groups = findSimilarFilenames(filenames);

// Merge manifests
const merged = mergeSourceManifests(sourceManifests, sourceIds, targetId);
```

## Refactor Status

| Component | Status | Notes |
|-----------|--------|-------|
| StagingView organism | ✅ New | Refactored from StagingWorkbench |
| Model layer | ✅ New | Extracted and centralized |
| SourcePane | ⚠️ Inline | Should become molecule |
| Drag-drop | ❌ Basic | Needs useDragDrop hook |
| Keyboard nav | ❌ Pending | Accessibility requirement |
| CanvasItem | ❌ Pending | Should be shared molecule |
| CollectionCard | ❌ Pending | Should be shared molecule |
| Checkpoint/resume | ❌ Pending | From ingestState service |

## Legacy References

- `components/staging/StagingWorkbench.tsx` - Original main component
- `components/staging/SourcePane.tsx` - Original left pane (reference only)
- `components/staging/hooks/useStagingState.ts` - Original state hook (reference only)

# Features Layer (`src/features/`)

The **features layer** contains domain-specific feature implementations. Each feature is a self-contained slice with its own UI, models, and logic.

## Philosophy

**"A feature is a complete user scenario from UI to domain logic."**

Each feature:
- Knows about its domain (manifests, canvases, etc.)
- Uses entity models and actions
- Composes molecules into organisms
- Doesn't know about other features
- Is independently testable

## Structure

```
src/features/
├── archive/              ← Browse and organize collections
│   ├── ui/
│   │   ├── organisms/    ← ArchiveView, ArchiveGrid, ArchiveHeader
│   │   └── molecules/    ← MultiSelectFilmstrip
│   ├── model/
│   │   └── index.ts      ← Selectors, filtering, sorting
│   ├── index.ts          ← Public API
│   └── README.md
├── board-design/         ← Board layout design
│   ├── ui/organisms/     ← BoardView, BoardHeader, BoardToolbar, BoardCanvas
│   ├── model/
│   │   └── index.ts      ← Board state, items, connections
│   └── index.ts
├── metadata-edit/        ← Edit metadata fields
│   ├── ui/
│   │   ├── organisms/    ← MetadataView, MetadataEditorPanel
│   │   └── molecules/    ← CSVImportModal
│   ├── model/
│   │   └── index.ts      ← Flattening, CSV, filtering, change detection
│   └── index.ts
├── staging/              ← Two-pane import workbench
│   ├── ui/
│   │   ├── organisms/    ← StagingView
│   │   └── molecules/    ← SourcePane
│   ├── model/
│   │   └── index.ts      ← Source manifest operations
│   └── index.ts
├── search/               ← Full-text search
│   ├── ui/organisms/     ← SearchView
│   ├── model/
│   │   └── index.ts      ← useSearch hook + domain logic
│   └── index.ts
├── viewer/               ← IIIF viewer with annotations
│   ├── ui/
│   │   ├── organisms/    ← ViewerView, CanvasComposerPanel, AnnotationToolPanel
│   │   └── molecules/    ← ComposerToolbar, ComposerSidebar, ComposerCanvas, AnnotationToolbar, etc.
│   ├── model/
│   │   ├── index.ts      ← useViewer hook
│   │   ├── composer.ts   ← Composer state
│   │   └── annotation.ts ← Annotation state
│   └── index.ts
├── map/                  ← Geographic map
│   ├── ui/organisms/     ← MapView
│   ├── model/
│   │   └── index.ts      ← useMap hook + coordinate logic
│   └── index.ts
└── timeline/             ← Temporal timeline
    ├── ui/organisms/     ← TimelineView
    ├── model/
    │   └── index.ts      ← useTimeline hook + date logic
    └── index.ts
```

## Feature Anatomy

Each feature follows a consistent structure:

### 1. Public API (`index.ts`)

Exports the main view component and model utilities:

```typescript
// src/features/archive/index.ts
export { ArchiveView } from './ui/organisms/ArchiveView';
export { ArchiveHeader } from './ui/organisms/ArchiveHeader';
export { ArchiveGrid } from './ui/organisms/ArchiveGrid';
export { MultiSelectFilmstrip } from './ui/molecules/MultiSelectFilmstrip';
export type { ArchiveViewProps, ArchiveHeaderProps, ArchiveGridProps } from './ui/organisms';
export * from './model';
```

### 2. Organisms (`ui/organisms/`)

Organisms are domain-specific components that:
- Receive context via props from `FieldModeTemplate`
- Compose molecules from `src/shared/ui/molecules/`
- Contain feature-specific logic
- DON'T call `useAppSettings()` or `useContextualStyles()`

```typescript
// ArchiveView organism
export const ArchiveView = ({ root, cx, fieldMode, t, isAdvanced }) => {
  const [filter, setFilter] = useState('');
  const manifests = archive.model.selectAll(root);
  
  return (
    <ViewContainer title="Archive" icon="inventory_2">
      <ArchiveHeader filter={filter} onFilterChange={setFilter} />
      <ArchiveGrid items={manifests} onSelect={onSelect} />
    </ViewContainer>
  );
};
```

### 3. Model (`model/`)

Domain-specific selectors and state management:

```typescript
// src/features/archive/model/index.ts
import { canvas, manifest } from '@/src/entities';

export { manifest, canvas };

// Archive-specific selectors
export const selectAllCanvases = (root: IIIFItem) => { ... };
export const filterByTerm = (canvases: IIIFCanvas[], term: string) => { ... };
export const sortCanvases = (canvases: IIIFCanvas[], sortBy: 'name' | 'date') => { ... };
export const getFileDNA = (item: IIIFItem): FileDNA => { ... };
```

## Usage in App

Features are consumed by the app layer:

```typescript
import { ArchiveView } from '@/src/features/archive';
import { BoardView } from '@/src/features/board-design';
import { MetadataView } from '@/src/features/metadata-edit';
import { StagingView } from '@/src/features/staging';
import { SearchView } from '@/src/features/search';
import { ViewerView } from '@/src/features/viewer';
import { MapView } from '@/src/features/map';
import { TimelineView } from '@/src/features/timeline';

// In ViewRouter
<FieldModeTemplate>
  {({ cx, fieldMode, t, isAdvanced }) => {
    switch (currentMode) {
      case 'archive':
        return <ArchiveView root={root} cx={cx} fieldMode={fieldMode} t={t} isAdvanced={isAdvanced} />;
      case 'boards':
        return <BoardView root={root} cx={cx} fieldMode={fieldMode} t={t} isAdvanced={isAdvanced} />;
      // ... other cases
    }
  }}
</FieldModeTemplate>
```

## Dependency Rules

```
features/* ← entities/*     (features use entity models)
features/* ← shared/*       (features use shared molecules)
features/* ← NOT features/* (features don't import each other)
app/* ← features/*          (app composes features)
```

## Adding a New Feature

1. Create directory: `src/features/<name>/`
2. Add structure:
   - `ui/organisms/` for main view components
   - `ui/molecules/` for feature-specific molecules (optional)
   - `model/` for domain logic and hooks
   - `index.ts` for public API
   - `README.md` for documentation
3. Export from `index.ts`
4. Wire into `ViewRouter`

## Feature Checklist

When implementing a feature, ensure:

- [ ] Organisms receive `cx`, `fieldMode`, `t`, `isAdvanced` via props
- [ ] No `useAppSettings()` or `useContextualStyles()` in organisms
- [ ] Molecules composed from `src/shared/ui/molecules/`
- [ ] Domain logic in `model/` directory
- [ ] Entity models used via `@/src/entities`
- [ ] Public API exported from `index.ts`
- [ ] README.md documents the feature

# Archive Feature (`src/features/archive/`)

The **Archive feature** is the primary view for browsing, organizing, and managing field research media collections.

## Structure

```
archive/
├── ui/
│   ├── organisms/
│   │   ├── ArchiveView.tsx         ← Main view (orchestrates archive UI)
│   │   ├── ArchiveGrid.tsx         ← Grid rendering with virtualization
│   │   ├── ArchiveHeader.tsx       ← Header with search + view toggle
│   │   └── README.md               (this file)
│   └── molecules/
│       └── MultiSelectFilmstrip.tsx  ← Filmstrip for multi-selection
├── model/
│   └── index.ts                    ← Selectors, filtering, sorting, FileDNA
├── index.ts                        ← Public API
└── README.md                       ← This file
```

## What Each Component Does

### ArchiveView
**Responsibility:** Orchestrate the archive view
- Receives `root` (IIIF tree) via props
- Manages view state (filter, sort, view mode)
- Composes ArchiveHeader + ArchiveGrid organisms
- Receives `cx`, `fieldMode`, `t`, `isAdvanced` via props from FieldModeTemplate
- **NOT responsible for:** Data fetching (that's handled by vault)

### ArchiveHeader
**Responsibility:** Header + filtering + view toggle
- Composes `SearchField` molecule for search
- Composes `ViewToggle` molecule for mode switching
- Receives `cx` and `fieldMode` via props from ArchiveView
- Passes `cx` and `fieldMode` to molecule children
- **NOT responsible for:** What happens when user searches (that's ArchiveView's job)

### ArchiveGrid
**Responsibility:** Render archive items in chosen view mode
- Virtualized grid for performance
- Supports grid, list, map views
- Uses virtualization for large collections
- **NOT responsible for:** Data selection, filtering (that's ArchiveView's job)

### MultiSelectFilmstrip
**Responsibility:** Filmstrip for multi-selected items
- Shows thumbnails of selected canvases
- Allows quick navigation between selections
- Uses shared molecules for rendering

## Key Patterns

### 1. Organisms Compose Molecules
```typescript
<ArchiveView>
  └─ <ArchiveHeader>
        └─ <SearchField />      ← Molecule
        └─ <ViewToggle />       ← Molecule
  └─ <ArchiveGrid>
        └─ <CollectionCard />   ← Shared molecule
```

### 2. Domain Logic in Model
```typescript
// model/index.ts - Archive-specific selectors
export const selectAllCanvases = (root) => { ... };
export const filterByTerm = (canvases, term) => { ... };
export const sortCanvases = (canvases, sortBy) => { ... };
export const getFileDNA = (item) => { ... }; // Metadata presence indicators
```

### 3. Context via Props (No Hooks in Organisms)
```typescript
interface ArchiveViewProps {
  root: IIIFItem | null;
  cx: ContextualClassNames;     // From FieldModeTemplate
  fieldMode: boolean;           // From FieldModeTemplate
  t: (key: string) => string;   // From FieldModeTemplate
  isAdvanced: boolean;          // From FieldModeTemplate
  onSelect?: (id: string) => void;
}
```

## Model API

### Selectors

```typescript
import { selectAllCanvases, filterByTerm, sortCanvases, getFileDNA } from '@/src/features/archive';

// Get all canvases flattened from tree
const canvases = selectAllCanvases(root);

// Filter by search term
const filtered = filterByTerm(canvases, 'search term');

// Sort by name or date
const sorted = sortCanvases(filtered, 'date');

// Get metadata presence indicators
const dna = getFileDNA(item); // { hasTime: true, hasLocation: false, hasDevice: true }
```

## Usage

```typescript
import { ArchiveView } from '@/src/features/archive';

<FieldModeTemplate>
  {({ cx, fieldMode, t, isAdvanced }) => (
    <ArchiveView
      root={root}
      cx={cx}
      fieldMode={fieldMode}
      t={t}
      isAdvanced={isAdvanced}
      onSelect={handleSelect}
    />
  )}
</FieldModeTemplate>
```

## Public API

```typescript
// Components
export { ArchiveView } from './ui/organisms/ArchiveView';
export { ArchiveHeader } from './ui/organisms/ArchiveHeader';
export { ArchiveGrid } from './ui/organisms/ArchiveGrid';
export { MultiSelectFilmstrip } from './ui/molecules/MultiSelectFilmstrip';

// Types
export type { ArchiveViewProps } from './ui/organisms/ArchiveView';
export type { ArchiveHeaderProps } from './ui/organisms/ArchiveHeader';
export type { ArchiveGridProps } from './ui/organisms/ArchiveGrid';
export type { MultiSelectFilmstripProps } from './ui/molecules/MultiSelectFilmstrip';

// Model
export {
  manifest,
  canvas,
  selectAllCanvases,
  filterByTerm,
  sortCanvases,
  getFileDNA,
  type FileDNA,
} from './model';
```

## Molecules Used

| Molecule | Purpose | Source |
|----------|---------|--------|
| `SearchField` | Main search input | `src/shared/ui/molecules/` |
| `ViewToggle` | Grid/list/map toggle | `src/shared/ui/molecules/` |
| `CollectionCard` | Item card display | `src/shared/ui/molecules/` |
| `EmptyState` | Empty collections | `src/shared/ui/molecules/` |
| `LoadingState` | Loading indicator | `src/shared/ui/molecules/` |
| `ZoomControl` | Zoom in/out | `src/shared/ui/molecules/` |

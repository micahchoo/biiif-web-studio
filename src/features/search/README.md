# Search Feature

Global search across IIIF items with filtering, autocomplete, and result navigation.

## Architecture

This feature follows Atomic Design + Feature-Sliced Design principles:

```
src/features/search/
├── ui/organisms/
│   └── SearchView.tsx      # Main organism (composes molecules)
├── model/
│   └── index.ts            # useSearch hook + domain logic
├── index.ts                # Public API
└── README.md               # This file
```

## Organism: SearchView

The SearchView organism receives context via props from FieldModeTemplate:

```typescript
<FieldModeTemplate>
  {({ cx, fieldMode, t }) => (
    <SearchView
      root={root}
      onSelect={handleSelect}
      onRevealMap={handleRevealMap}
      cx={cx}
      fieldMode={fieldMode}
      t={t}
    />
  )}
</FieldModeTemplate>
```

**Key Design Decisions:**
- No `useAppSettings()` or `useContextualStyles()` calls in organism
- `cx` and `fieldMode` received via props from template
- `t` (terminology) received via props from template
- All UI elements composed from molecules in `src/shared/ui/molecules/`

## Model: useSearch Hook

Encapsulates all search state and logic:

```typescript
const {
  query,
  results,
  filter,
  indexing,
  autocompleteResults,
  // ...actions
  setQuery,
  setFilter,
  selectAutocomplete,
} = useSearch(root);
```

**Responsibilities:**
- Index building when root changes
- Debounced search execution (300ms)
- Autocomplete suggestions
- Keyboard navigation
- Recent searches management

## Molecules Used

| Molecule | Purpose |
|----------|---------|
| `SearchField` | Main search input with clear button |
| `FacetPill` | Filter pills (All, Manifest, Canvas, Annotation) |
| `ResultCard` | Individual search result display |
| `EmptyState` | Empty states (no results, initial state) |
| `LoadingState` | Indexing indicator |

## Legacy Migration

This replaces `components/views/SearchView.tsx`:

| Aspect | Legacy | New |
|--------|--------|-----|
| Lines of code | 264 | ~200 (organism) + 150 (model) |
| fieldMode access | `useAppSettings()` | Via props from template |
| Styling | Inline classes | Via `cx` prop |
| Search logic | Inline useEffect | `useSearch` hook |
| Terminology | `useTerminology()` | Via `t` prop |

## TODO / Future Decomposition

The following could be extracted to feature-specific molecules:

1. **SearchAutocomplete** - The autocomplete dropdown could become a molecule
2. **SearchFilters** - Filter pill group could be a molecule
3. **SearchResultsList** - Results list with virtualization for large result sets

These are currently inline because they're only used within SearchView. If reused
(e.g., in a sidebar search widget), extract to `ui/molecules/`.

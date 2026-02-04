# Metadata Edit Feature (`src/features/metadata-edit/`)

The **metadata-edit feature** provides spreadsheet-style bulk editing of IIIF resource metadata.

## Scope

This feature handles:
- Flattening IIIF hierarchies (Collection → Manifest → Canvas) to spreadsheet rows
- Tabular editing of metadata fields
- CSV import/export for external editing
- Dynamic column detection from existing metadata
- Change tracking and unsaved changes warnings

## Structure

```
metadata-edit/
├── ui/
│   └── organisms/
│       └── MetadataView.tsx      ← Main spreadsheet view (refactored from MetadataSpreadsheet)
├── model/
│   └── index.ts                  ← Flattening, CSV, filtering, change detection
├── index.ts                      ← Public API
└── README.md                     ← This file
```

## Atomic Design Compliance

### Organisms (This Feature)
- **MetadataView**: Composes ViewContainer, FilterInput, Toolbar, EmptyState molecules
- Receives `cx` and `fieldMode` via props from FieldModeTemplate
- No direct hook calls to useAppSettings or useContextualStyles

### Molecules Used (From Shared)
- `ViewContainer`: Consistent view wrapper with header
- `FilterInput`: Search/filter input with debounce
- `Toolbar`: Action button group
- `EmptyState`: Empty/loading states

### Atoms Used (From Shared)
- `Button`: Action buttons

## Usage

```typescript
import { MetadataView } from '@/src/features/metadata-edit';

<FieldModeTemplate>
  {({ cx, fieldMode }) => (
    <MetadataView
      root={root}
      cx={cx}
      fieldMode={fieldMode}
      onUpdate={handleUpdate}
      filterIds={selectedIds}
      onClearFilter={clearSelection}
    />
  )}
</FieldModeTemplate>
```

## Model API

### Flattening
```typescript
import { flattenTree, type FlatItem } from '@/src/features/metadata-edit';

const items: FlatItem[] = flattenTree(root, 'All'); // or 'Collection', 'Manifest', 'Canvas'
```

### Filtering
```typescript
import { filterByTerm, filterByIds } from '@/src/features/metadata-edit';

const filtered = filterByTerm(items, 'search term');
const selection = filterByIds(items, selectedIds);
```

### CSV Export
```typescript
import { itemsToCSV, extractColumns } from '@/src/features/metadata-edit';

const columns = extractColumns(items);
const csv = itemsToCSV(items, columns);
```

### Change Detection
```typescript
import { detectChanges } from '@/src/features/metadata-edit';

const changedIds = detectChanges(currentItems, originalItems);
```

## Refactor Status

| Component | Status | Notes |
|-----------|--------|-------|
| MetadataView organism | ✅ New | Refactored from MetadataSpreadsheet |
| Model layer | ✅ New | Extracted and centralized |
| MetadataEditorPanel | ❌ Pending | Extract from MetadataEditor.tsx |
| CSV import modal | ❌ Pending | Create as molecule |
| Navigation guard | ❌ Pending | Integrate with app layer |

## Legacy References

- `components/views/MetadataSpreadsheet.tsx` - Original 722-line component (reference only)
- `components/MetadataEditor.tsx` - Original 395-line panel (reference only)

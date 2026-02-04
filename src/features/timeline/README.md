# Timeline Feature

Temporal visualization of IIIF items with navDate property.

## Architecture

This feature follows Atomic Design + Feature-Sliced Design principles:

```
src/features/timeline/
├── ui/organisms/
│   └── TimelineView.tsx      # Main organism (composes molecules)
├── model/
│   └── index.ts              # useTimeline hook + domain logic
├── index.ts                  # Public API
└── README.md                 # This file
```

## Organism: TimelineView

The TimelineView organism receives context via props from FieldModeTemplate:

```typescript
<FieldModeTemplate>
  {({ cx, fieldMode }) => (
    <TimelineView
      root={root}
      onSelect={handleSelect}
      cx={cx}
      fieldMode={fieldMode}
    />
  )}
</FieldModeTemplate>
```

**Key Design Decisions:**
- No `useAppSettings()` or `useContextualStyles()` calls in organism
- `cx` and `fieldMode` received via props from template
- All UI elements composed from molecules in `src/shared/ui/molecules/`
- Date calculations in `useTimeline` hook

## Model: useTimeline Hook

Encapsulates all timeline state and date logic:

```typescript
const {
  groups,
  minDate,
  maxDate,
  zoomLevel,
  selectedDate,
  setZoomLevel,
  toggleDate,
  // ...more
} = useTimeline(root);
```

**Responsibilities:**
- Extract items with navDate from IIIF tree
- Sort items chronologically
- Group by zoom level (day/month/year)
- Track selected date
- Calculate date range for minimap

## Zoom Levels

| Level | Grouping | Grid Columns |
|-------|----------|--------------|
| Day | By date (YYYY-MM-DD) | 4-6 |
| Month | By month (YYYY-MM) | 6-8 |
| Year | By year (YYYY) | 8-12 |

## Molecules Used

| Molecule | Purpose |
|----------|---------|
| `TimelineTick` | Date header with item count |
| `EmptyState` | No dated items state |

## Date Format Support

The timeline uses the IIIF `navDate` property which should be ISO 8601 format:

```json
{
  "navDate": "2024-01-15T10:30:00Z"
}
```

## Legacy Migration

This replaces `components/views/TimelineView.tsx`:

| Aspect | Legacy | New |
|--------|--------|-----|
| Lines of code | 255 | ~200 (organism) + 150 (model) |
| fieldMode access | `useAppSettings()` | Via props from template |
| Styling | Inline classes | Via `cx` prop |
| Date formatting | Inline functions | `formatDisplayDate()` utility |
| Grid layout | Inline logic | `getGridColumns()` utility |

## Decomposition Notes

### Future Molecules

1. **TimelineHeader** - Title, stats, and zoom controls
2. **TimelineMinimap** - Date range bar with position markers
3. **TimelineGroup** - Collapsible date group
4. **TimelineItemCard** - Item thumbnail with metadata
5. **RangeSelector** - Date range filter

### Future Enhancements

1. **Date Range Filtering** - Filter to specific date ranges
2. **Temporal Search** - Search within date ranges
3. **Animation** - Animate transitions between zoom levels
4. **Export** - Export timeline as static image

## Performance Considerations

- Items sorted once per root change (useMemo)
- Groups recalculated only when zoom changes
- Images lazy-loaded
- Minimap markers limited to visible range

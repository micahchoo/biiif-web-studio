# Map Feature

Geographic visualization of IIIF items with GPS coordinates.

## Architecture

This feature follows Atomic Design + Feature-Sliced Design principles:

```
src/features/map/
├── ui/organisms/
│   └── MapView.tsx           # Main organism (composes molecules)
├── model/
│   └── index.ts              # useMap hook + domain logic
├── index.ts                  # Public API
└── README.md                 # This file
```

## Organism: MapView

The MapView organism receives context via props from FieldModeTemplate:

```typescript
<FieldModeTemplate>
  {({ cx, fieldMode, t, isAdvanced }) => (
    <MapView
      root={root}
      onSelect={handleSelect}
      cx={cx}
      fieldMode={fieldMode}
      t={t}
      isAdvanced={isAdvanced}
    />
  )}
</FieldModeTemplate>
```

**Key Design Decisions:**
- No `useAppSettings()` or `useContextualStyles()` calls in organism
- `cx`, `fieldMode`, `t`, `isAdvanced` received via props from template
- All UI elements composed from molecules in `src/shared/ui/molecules/`
- Geographic calculations in `useMap` hook

## Model: useMap Hook

Encapsulates all map state and geographic logic:

```typescript
const {
  geoItems,
  bounds,
  clusters,
  zoom,
  hoveredItem,
  containerRef,
  geoToPixel,
  zoomIn,
  zoomOut,
  // ...more
} = useMap(root);
```

**Responsibilities:**
- Extract geotagged items from IIIF tree
- Parse GPS coordinates from metadata
- Calculate geographic bounds
- Cluster items based on pixel proximity
- Coordinate-to-pixel transformations
- Viewport state management

## Coordinate Format Support

The map supports multiple coordinate formats:

```typescript
// Decimal format
"40.7128, -74.0060"

// Degrees with direction
"40.7128°N, 74.0060°W"
"40.7128 N, 74.0060 W"
```

Coordinates are extracted from metadata fields with labels:
- "Location"
- "GPS"
- "Coordinates"

## Molecules Used

| Molecule | Purpose |
|----------|---------|
| `MapMarker` | Individual item pin on map |
| `ClusterBadge` | Grouped items indicator |
| `ZoomControl` | Zoom in/out/reset buttons |
| `EmptyState` | No geotagged items state |

## Clustering Algorithm

Items are clustered based on pixel distance (40px radius):

```
For each item:
  1. Calculate pixel position
  2. Find nearby cluster (within 40px)
  3. If found: add to cluster, update center
  4. If not: create new cluster
```

Cluster centers are dynamically recalculated as items are added.

## Legacy Migration

This replaces `components/views/MapView.tsx`:

| Aspect | Legacy | New |
|--------|--------|-----|
| Lines of code | 379 | ~200 (organism) + 200 (model) |
| fieldMode access | `useAppSettings()` | Via props from template |
| Styling | Inline classes | Via `cx` prop |
| Coordinate parsing | Inline function | `parseCoordinates()` utility |
| Clustering | Inline function | `clusterItems()` utility |

## Decomposition Notes

### Future Molecules

1. **MapToolbar** - Zoom controls + view options
2. **ClusterPopup** - Item selector for clusters
3. **MapTooltip** - Hover info card
4. **CoordinateInput** - Lat/lng editor for metadata

### Integration with navPlace

Future enhancement: Support IIIF navPlace for geographic features:

```typescript
// navPlace extraction (TODO)
const navPlaceFeatures = extractNavPlace(canvas);
```

This would enable displaying geographic features beyond simple points.

## Performance Considerations

- Clusters recalculated on zoom change (useMemo)
- Coordinate parsing cached per item
- Container dimensions tracked via resize observer
- Bounds calculated once per geoItems change

# Map Feature (`src/features/map/`)

Geographic visualization of IIIF items with GPS coordinates.

## Architecture

This feature follows Atomic Design + Feature-Sliced Design principles:

```
src/features/map/
├── ui/organisms/
│   └── MapView.tsx           ← Main organism (composes molecules)
├── model/
│   └── index.ts              ← useMap hook + domain logic
├── index.ts                  ← Public API
└── README.md                 ← This file
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
  selectedCluster,
  containerRef,
  geoToPixel,
  zoomIn,
  zoomOut,
  resetView,
  hasGeotaggedItems,
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

## Types

```typescript
interface GeoItem {
  canvas: IIIFCanvas;
  lat: number;
  lng: number;
}

interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

interface Cluster {
  lat: number;
  lng: number;
  items: GeoItem[];
}

interface UseMapReturn extends MapState {
  containerRef: React.RefObject<HTMLDivElement>;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  geoToPixel: (lat: number, lng: number) => { x: number; y: number };
  hasGeotaggedItems: boolean;
}
```

## Molecules Used

| Molecule | Purpose |
|----------|---------|
| `MapMarker` | Individual item pin on map |
| `ClusterBadge` | Grouped items indicator |
| `ZoomControl` | Zoom in/out/reset buttons |
| `EmptyState` | No geotagged items state |

## Clustering Algorithm

Items are clustered based on pixel distance (40px radius):

1. Convert lat/lng to pixel coordinates
2. Group items within cluster radius
3. Display cluster badge with count
4. Click to expand and see individual items

## Public API

```typescript
// Component
export { MapView } from './ui/organisms/MapView';
export type { MapViewProps } from './ui/organisms/MapView';

// Model
export {
  useMap,
  parseCoordinates,
  formatCoordinates,
  formatBounds,
  type GeoItem,
  type MapBounds,
  type Cluster,
  type UseMapReturn,
} from './model';
```

## Usage

```typescript
import { MapView } from '@/src/features/map';

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

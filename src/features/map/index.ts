/**
 * Map Feature
 *
 * Geographic visualization of IIIF items with GPS coordinates.
 *
 * @example
 * import { MapView } from '@/src/features/map';
 *
 * <MapView
 *   root={root}
 *   onSelect={handleSelect}
 *   cx={cx}
 *   fieldMode={fieldMode}
 *   t={t}
 *   isAdvanced={isAdvanced}
 * />
 */

export { MapView } from './ui/organisms/MapView';
export type { MapViewProps } from './ui/organisms/MapView';

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

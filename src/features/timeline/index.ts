/**
 * Timeline Feature
 *
 * Temporal visualization of IIIF items with navDate property.
 *
 * @example
 * import { TimelineView } from '@/src/features/timeline';
 *
 * <TimelineView
 *   root={root}
 *   onSelect={handleSelect}
 *   cx={cx}
 *   fieldMode={fieldMode}
 * />
 */

export { TimelineView } from './ui/organisms/TimelineView';
export type { TimelineViewProps } from './ui/organisms/TimelineView';

export {
  useTimeline,
  formatDisplayDate,
  formatTime,
  getGridColumns,
  getTimelinePosition,
  type ZoomLevel,
  type TimelineGroup,
  type UseTimelineReturn,
} from './model';

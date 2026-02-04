/**
 * Molecules: Composable UI Units
 *
 * All molecules are exported here for consistent imports across features.
 *
 * PRINCIPLE: Molecules are imported by organisms, never used directly in features.
 * Features compose organisms, which compose molecules.
 *
 * @example
 * import {
 *   FilterInput,
 *   SearchField,
 *   ViewToggle,
 *   ViewContainer,
 *   Toolbar,
 * } from '@/src/shared/ui/molecules';
 *
 * export const MyOrganism = () => (
 *   <ViewContainer
 *     title="Archive"
 *     icon="inventory"
 *     filter={{ value: filter, onChange: setFilter }}
 *     viewToggle={{ value: mode, onChange: setMode, options: [...] }}
 *   >
 *     <FilterInput value={search} onChange={setSearch} />
 *     <Toolbar>
 *       <Button onClick={onCreate}>Create</Button>
 *     </Toolbar>
 *   </ViewContainer>
 * );
 */

// Display & Content
export { StackedThumbnail } from './StackedThumbnail';
export type { StackedThumbnailProps } from './StackedThumbnail';

export { MuseumLabel } from './MuseumLabel';
export type { MuseumLabelProps, MuseumLabelType } from './MuseumLabel';

// Context Menu
export { ContextMenu } from './ContextMenu';
export type { ContextMenuProps, ContextMenuItem, ContextMenuSection } from './ContextMenu';

// Filter & Search
export { FilterInput } from './FilterInput';
export type { FilterInputProps } from './FilterInput';

export { SearchField } from './SearchField';
export type { SearchFieldProps } from './SearchField';

export { DebouncedInput } from './DebouncedInput';
export type { DebouncedInputProps } from './DebouncedInput';

// Layout & Container
export { ViewContainer } from './ViewContainer';
export type { ViewContainerProps } from './ViewContainer';

export { ViewToggle } from './ViewToggle';
export type { ViewToggleProps, ViewToggleOption } from './ViewToggle';

// Actions & Controls
export { Toolbar } from './Toolbar';
export type { ToolbarProps } from './Toolbar';

export { SelectionToolbar } from './SelectionToolbar';
export type { SelectionToolbarProps } from './SelectionToolbar';

export { IconButton } from './IconButton';
export type { IconButtonProps } from './IconButton';

export { ActionButton } from './ActionButton';
export type { ActionButtonProps } from './ActionButton';

// State & Info
export { EmptyState } from './EmptyState';
export type { EmptyStateProps, EmptyStateAction } from './EmptyState';

export { LoadingState } from './LoadingState';
export type { LoadingStateProps } from './LoadingState';

export { ResourceTypeBadge } from './ResourceTypeBadge';
export type { ResourceTypeBadgeProps } from './ResourceTypeBadge';

export { StatusBadge } from './StatusBadge';
export type { StatusBadgeProps, StatusVariant } from './StatusBadge';

// Search & Discovery (for decomposition)
export { FacetPill } from './FacetPill';
export type { FacetPillProps } from './FacetPill';

export { ResultCard } from './ResultCard';
export type { ResultCardProps } from './ResultCard';

// Viewer Controls (for decomposition)
export { ZoomControl } from './ZoomControl';
export type { ZoomControlProps } from './ZoomControl';

export { PageCounter } from './PageCounter';
export type { PageCounterProps } from './PageCounter';

// Map Components (for decomposition)
export { MapMarker } from './MapMarker';
export type { MapMarkerProps } from './MapMarker';

export { ClusterBadge } from './ClusterBadge';
export type { ClusterBadgeProps, ClusterItem } from './ClusterBadge';

// Timeline Components (for decomposition)
export { TimelineTick } from './TimelineTick';
export type { TimelineTickProps, TimelineItem } from './TimelineTick';

export { RangeSelector } from './RangeSelector';
export type { RangeSelectorProps, RangePreset } from './RangeSelector';

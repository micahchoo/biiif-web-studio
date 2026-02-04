/**
 * Archive Feature
 *
 * Public API for the archive feature slice.
 *
 * @module features/archive
 */

export { ArchiveView } from './ui/organisms/ArchiveView';
export { ArchiveHeader } from './ui/organisms/ArchiveHeader';
export { ArchiveGrid } from './ui/organisms/ArchiveGrid';

// NEW: MultiSelectFilmstrip molecule
export { MultiSelectFilmstrip } from './ui/molecules/MultiSelectFilmstrip';

export type { ArchiveViewProps } from './ui/organisms/ArchiveView';
export type { ArchiveHeaderProps } from './ui/organisms/ArchiveHeader';
export type { ArchiveGridProps } from './ui/organisms/ArchiveGrid';
export type { MultiSelectFilmstripProps } from './ui/molecules/MultiSelectFilmstrip';

export * from './model';
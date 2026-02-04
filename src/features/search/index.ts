/**
 * Search Feature
 *
 * Global search across IIIF items with filtering, autocomplete, and result navigation.
 *
 * @example
 * import { SearchView } from '@/src/features/search';
 *
 * <SearchView
 *   root={root}
 *   onSelect={handleSelect}
 *   cx={cx}
 *   fieldMode={fieldMode}
 *   t={t}
 * />
 */

export { SearchView } from './ui/organisms/SearchView';
export type { SearchViewProps } from './ui/organisms/SearchView';

export {
  useSearch,
  getResultCountText,
  shouldSearch,
  type SearchFilter,
  type SearchState,
  type UseSearchReturn,
} from './model';

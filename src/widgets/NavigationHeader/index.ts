/**
 * NavigationHeader Widget
 *
 * Composes HeaderTopBar, HeaderBreadcrumb, and HeaderUserMenu
 * with the ArchiveHeader organism from the archive feature.
 *
 * @module widgets/NavigationHeader
 */

// Main widget
export { NavigationHeader } from './NavigationHeader';
export type { NavigationHeaderProps } from './NavigationHeader';

// Sub-components (for independent use or testing)
export { HeaderTopBar } from './HeaderTopBar';
export type { HeaderTopBarProps } from './HeaderTopBar';

export { HeaderBreadcrumb } from './HeaderBreadcrumb';
export type { HeaderBreadcrumbProps } from './HeaderBreadcrumb';

export { HeaderUserMenu } from './HeaderUserMenu';
export type { HeaderUserMenuProps } from './HeaderUserMenu';

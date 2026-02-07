/**
 * Shared types for Breadcrumb components.
 * Extracted to break circular dependency between BreadcrumbNav and BreadcrumbSiblingMenu.
 */

export interface BreadcrumbItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: string;
  /** Item type for styling */
  type?: 'root' | 'collection' | 'manifest' | 'canvas' | 'folder';
  /** Number of children (for badge) */
  childCount?: number;
  /** Sibling items for dropdown navigation */
  siblings?: BreadcrumbItem[];
  /** Click handler */
  onClick?: () => void;
}

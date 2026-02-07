/**
 * Shared types for Metadata components.
 * Extracted to break circular dependency between MetadataCard and MetadataFieldRenderer.
 */

export interface MetadataField {
  /** Field identifier */
  id: string;
  /** Human-readable label */
  label: string;
  /** Current value */
  value: string | string[] | null;
  /** Whether field is editable */
  editable?: boolean;
  /** Field type for appropriate input */
  type?: 'text' | 'textarea' | 'date' | 'url' | 'select' | 'readonly';
  /** Options for select type */
  options?: { value: string; label: string }[];
  /** Help text/tooltip */
  helpText?: string;
  /** Group/category */
  group?: 'basic' | 'technical' | 'rights' | 'relations';
  /** Whether field is required */
  required?: boolean;
  /** Validation error message */
  error?: string | null;
}

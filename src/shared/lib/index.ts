/**
 * Shared Library Utilities
 *
 * Domain-agnostic utilities and hooks used across the application.
 * These should contain zero domain-specific logic.
 *
 * @module shared/lib
 */

// ============================================================================
// Hooks (React-specific utilities)
// ============================================================================
export { useDragDrop } from './hooks/useDragDrop';
export type { UseDragDropReturn, DragItem, DropTarget } from './hooks/useDragDrop';

export { useKeyboardNav } from './hooks/useKeyboardNav';
export type { UseKeyboardNavReturn, KeyboardNavOptions } from './hooks/useKeyboardNav';

// ============================================================================
// Note: Additional utilities are available in @/utils
// ============================================================================
// IIIF utilities, sanitization, media types, etc. remain in the utils/
// directory due to complex interdependencies. Import from @/utils directly.

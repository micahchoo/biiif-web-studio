/**
 * useFocusTrap Hook
 *
 * Traps focus within a container element for accessibility.
 * Essential for modals, dialogs, and overlay components.
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose, children }) {
 *   const containerRef = useFocusTrap(isOpen);
 *
 *   return (
 *     <div ref={containerRef} role="dialog" aria-modal="true">
 *       {children}
 *       <button onClick={onClose}>Close</button>
 *     </div>
 *   );
 * }
 * ```
 */

import { RefObject, useEffect, useRef } from 'react';

/** Default selector for focusable elements */
const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** Default delay before focusing first element (ms) */
const DEFAULT_FOCUS_DELAY = 50;

/** Escape key code */
const ESCAPE_KEY = 'Escape';

export interface UseFocusTrapOptions {
  /** Whether the focus trap is active */
  isActive: boolean;
  /** Element to return focus to when trap is deactivated */
  returnFocusTo?: HTMLElement | null;
  /** Delay before focusing first element (ms) */
  focusDelay?: number;
  /** Callback when escape key is pressed */
  onEscape?: () => void;
}

/**
 * Hook to trap focus within a container
 * @param options - Configuration options
 * @returns RefObject to attach to the container element
 */
export function useFocusTrap<T extends HTMLElement>(
  options: UseFocusTrapOptions
): RefObject<T> {
  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const { isActive, returnFocusTo, focusDelay = DEFAULT_FOCUS_DELAY, onEscape } = options;

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    // Store the element that had focus before trapping
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Find all focusable elements
    const getFocusableElements = (): HTMLElement[] => {
      return Array.from(
        container.querySelectorAll(FOCUSABLE_SELECTOR)
      ).filter((el): el is HTMLElement => {
        // Filter out disabled elements and hidden elements
        const htmlEl = el as HTMLElement;
        return (
          !htmlEl.hasAttribute('disabled') &&
          htmlEl.getAttribute('tabindex') !== '-1' &&
          htmlEl.offsetParent !== null // Check visibility
        );
      });
    };

    // Focus the first focusable element after a delay
    const focusFirstElement = () => {
      const focusable = getFocusableElements();
      if (focusable.length > 0) {
        // Try to find an autofocus element first
        const autoFocusEl = focusable.find(el => el.hasAttribute('autofocus'));
        (autoFocusEl || focusable[0]).focus();
      }
    };

    const timeoutId = setTimeout(focusFirstElement, focusDelay);

    // Handle tab key to trap focus
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        if (event.key === ESCAPE_KEY && onEscape) {
          onEscape();
        }
        return;
      }

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      // If shift+tab on first element, go to last
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      // If tab on last element, go to first
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener('keydown', handleKeyDown);

      // Return focus to the element that had it before trapping
      const elementToFocus = returnFocusTo ?? previousActiveElement.current;
      if (elementToFocus && 'focus' in elementToFocus) {
        elementToFocus.focus();
      }
    };
  }, [isActive, returnFocusTo, focusDelay, onEscape]);

  return containerRef;
}

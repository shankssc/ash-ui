import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to trap focus within a container element
 * Implements accessible focus management for modals
 */
export function useFocusTrap(
  isOpen: boolean,
  containerRef: React.RefObject<HTMLElement | null>,
  trapFocus: boolean = true,
) {
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen || !trapFocus || !containerRef.current) return;

    // Save currently focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // Find all focusable elements within the container
    const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    if (focusableElements.length === 0) return;

    // Focus the first element
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement.focus();

    // Handle Tab and Shift+Tab to cycle through focusable elements
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift+Tab: move focus to previous element
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: move focus to next element
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus to previously focused element
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isOpen, trapFocus, containerRef]);
}

/**
 * Hook to lock body scroll when modal is open
 */
export function useScrollLock(isOpen: boolean, lockScroll: boolean = true) {
  useEffect(() => {
    if (!isOpen || !lockScroll) return;

    // Save current overflow state
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Lock scroll
    document.body.style.overflow = 'hidden';

    // Prevent layout shift by compensating for scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      // Restore original overflow state
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen, lockScroll]);
}

/**
 * Hook to handle Escape key press for closing modal
 */
export function useEscapeKey(isOpen: boolean, onClose: () => void, closeOnEsc: boolean = true) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEsc) {
        e.stopPropagation();
        onClose();
      }
    },
    [onClose, closeOnEsc],
  );

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);
}

/**
 * Hook to handle click outside (overlay click) for closing modal
 */
export function useClickOutside(
  isOpen: boolean,
  onClose: () => void,
  containerRef: React.RefObject<HTMLElement | null>,
  closeOnOverlayClick: boolean = true,
) {
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!closeOnOverlayClick || !containerRef.current) return;

      // Check if click is outside the container
      if (!containerRef.current.contains(e.target as Node)) {
        e.stopPropagation();
        onClose();
      }
    },
    [onClose, closeOnOverlayClick, containerRef],
  );

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isOpen, handleClick]);
}

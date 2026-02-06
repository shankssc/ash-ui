/**
 * Modal Size Variants
 * @public
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Modal Animation Variants
 * @public
 */
export type ModalAnimation =
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale';

/**
 * Modal Props Interface
 * @public
 */
export interface ModalProps {
  /**
   * Controls whether the modal is open or closed
   */
  isOpen: boolean;

  /**
   * Callback fired when modal should close
   * (triggered by Escape key, overlay click, or close button)
   */
  onClose: () => void;

  /**
   * Modal size variant
   * @default 'md'
   */
  size?: ModalSize;

  /**
   * Animation type for modal entrance/exit
   * @default 'fade'
   */
  animation?: ModalAnimation;

  /**
   * Whether to close modal when clicking the overlay
   * @default true
   */
  closeOnOverlayClick?: boolean;

  /**
   * Whether to close modal when pressing Escape key
   * @default true
   */
  closeOnEsc?: boolean;

  /**
   * Whether to trap focus inside the modal
   * @default true
   */
  trapFocus?: boolean;

  /**
   * Whether to lock scrolling on the body when modal is open
   * @default true
   */
  lockScroll?: boolean;

  /**
   * ARIA label for the modal (for screen readers)
   */
  'aria-label'?: string;

  /**
   * ID of the element that labels the modal
   */
  'aria-labelledby'?: string;

  /**
   * ID of the element that describes the modal
   */
  'aria-describedby'?: string;

  /**
   * Custom class names for the modal container
   */
  className?: string;

  /**
   * Custom class names for the modal content
   */
  contentClassName?: string;

  /**
   * Custom class names for the overlay/backdrop
   */
  overlayClassName?: string;

  /**
   * Test ID for testing purposes
   */
  'data-testid'?: string;

  /**
   * Children to render inside the modal
   */
  children: React.ReactNode;
}

/**
 * Modal Header Props
 * @public
 */
export interface ModalHeaderProps {
  /**
   * Custom class names
   */
  className?: string;
  /**
   * Children to render in header
   */
  children: React.ReactNode;
}

/**
 * Modal Body Props
 * @public
 */
export interface ModalBodyProps {
  /**
   * Custom class names
   */
  className?: string;
  /**
   * Children to render in body
   */
  children: React.ReactNode;
}

/**
 * Modal Footer Props
 * @public
 */
export interface ModalFooterProps {
  /**
   * Custom class names
   */
  className?: string;
  /**
   * Children to render in footer
   */
  children: React.ReactNode;
}

/**
 * Modal Title Props
 * @public
 */
export interface ModalTitleProps {
  /**
   * Custom class names
   */
  className?: string;
  /**
   * Title text or element
   */
  children: React.ReactNode;
  /**
   * HTML heading level (h1-h6)
   * @default 'h2'
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * Modal Close Button Props
 * @public
 */
export interface ModalCloseButtonProps {
  /**
   * Custom class names
   */
  className?: string;
  /**
   * Close handler (inherited from Modal context)
   */
  onClose?: () => void;
}

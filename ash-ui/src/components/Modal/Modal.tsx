import React, { useRef, createContext, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type {
  ModalProps,
  ModalSize,
  ModalAnimation,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
  ModalTitleProps,
  ModalCloseButtonProps,
} from './types';
import { useFocusTrap, useScrollLock, useEscapeKey, useClickOutside } from './hooks';

/**
 * Modal Context for sharing onClose handler with child components
 */
interface ModalContextType {
  onClose?: () => void;
}

const ModalContext = createContext<ModalContextType>({});

/**
 * Size configuration based on design tokens
 */
const sizeConfig: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full w-full h-full',
};

/**
 * Animation configuration
 */
const animationConfig: Record<
  ModalAnimation,
  {
    enter: string;
    exit: string;
  }
> = {
  fade: {
    enter: 'opacity-100',
    exit: 'opacity-0',
  },
  'slide-up': {
    enter: 'opacity-100 translate-y-0',
    exit: 'opacity-0 translate-y-4',
  },
  'slide-down': {
    enter: 'opacity-100 translate-y-0',
    exit: 'opacity-0 translate-y-[-4rem]',
  },
  'slide-left': {
    enter: 'opacity-100 translate-x-0',
    exit: 'opacity-0 translate-x-[-4rem]',
  },
  'slide-right': {
    enter: 'opacity-100 translate-x-0',
    exit: 'opacity-0 translate-x-4',
  },
  scale: {
    enter: 'opacity-100 scale-100',
    exit: 'opacity-0 scale-95',
  },
};

/**
 * Modal Component
 *
 * An accessible, customizable modal/dialog component with focus trapping,
 * keyboard navigation, and smooth animations.
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
 *   <Modal.Header>
 *     <Modal.Title>Modal Title</Modal.Title>
 *     <Modal.CloseButton />
 *   </Modal.Header>
 *
 *   <Modal.Body>
 *     <p>Modal content goes here</p>
 *   </Modal.Body>
 *
 *   <Modal.Footer>
 *     <Button variant="secondary" onClick={() => setIsOpen(false)}>
 *       Cancel
 *     </Button>
 *     <Button variant="primary">Confirm</Button>
 *   </Modal.Footer>
 * </Modal>
 * ```
 *
 * @param props - Modal component props
 * @returns An accessible modal component
 *
 * @public
 */
export const Modal: React.FC<ModalProps> & {
  Header: React.FC<ModalHeaderProps>;
  Body: React.FC<ModalBodyProps>;
  Footer: React.FC<ModalFooterProps>;
  Title: React.FC<ModalTitleProps>;
  CloseButton: React.FC<ModalCloseButtonProps>;
} = ({
  isOpen,
  onClose,
  size = 'md',
  animation = 'fade',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  trapFocus = true,
  lockScroll = true,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  className = '',
  contentClassName = '',
  overlayClassName = '',
  'data-testid': dataTestId = 'modal',
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Apply accessibility hooks
  useFocusTrap(isOpen, containerRef, trapFocus);
  useScrollLock(isOpen, lockScroll);
  useEscapeKey(isOpen, onClose, closeOnEsc);
  useClickOutside(isOpen, onClose, containerRef, closeOnOverlayClick);

  // Handle close from child components
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  // Get animation classes
  const { enter } = animationConfig[animation];

  return createPortal(
    <ModalContext.Provider value={{ onClose: handleClose }}>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlayClassName}`}
        role="presentation"
        data-testid={`${dataTestId}-overlay`}
      >
        {/* Overlay/Backdrop */}
        <div
          className={`fixed inset-0 bg-neutral-900/50 backdrop-blur-sm transition-opacity ${enter}`}
          aria-hidden="true"
        />

        {/* Modal Container */}
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          className={`relative z-50 w-full ${sizeConfig[size]} transform transition-all duration-300 ease-out ${enter} ${contentClassName} `}
          data-testid={dataTestId}
        >
          <div
            className={`flex max-h-[90vh] flex-col overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-neutral-900 ${className} `}
          >
            {children}
          </div>
        </div>
      </div>
    </ModalContext.Provider>,
    document.body,
  );
};

/**
 * Modal Header Component
 */
export const ModalHeader: React.FC<ModalHeaderProps> = ({ className = '', children }) => {
  return (
    <div
      className={`flex items-center justify-between border-b border-neutral-200 p-6 dark:border-neutral-700 ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Modal Body Component
 */
export const ModalBody: React.FC<ModalBodyProps> = ({ className = '', children }) => {
  return (
    <div className={`flex-1 overflow-y-auto p-6 ${className}`} role="region">
      {children}
    </div>
  );
};

/**
 * Modal Footer Component
 */
export const ModalFooter: React.FC<ModalFooterProps> = ({ className = '', children }) => {
  return (
    <div
      className={`flex items-center justify-end gap-3 border-t border-neutral-200 p-6 dark:border-neutral-700 ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Modal Title Component
 */
export const ModalTitle: React.FC<ModalTitleProps> = ({
  className = '',
  children,
  as: Tag = 'h2',
}) => {
  return (
    <Tag className={`text-xl font-semibold text-neutral-900 dark:text-neutral-100 ${className}`}>
      {children}
    </Tag>
  );
};

/**
 * Modal Close Button Component
 */
export const ModalCloseButton: React.FC<ModalCloseButtonProps> = ({
  className = '',
  onClose: customOnClose,
}) => {
  const context = useContext(ModalContext);
  const handleClose = customOnClose || context.onClose;

  if (!handleClose) {
    console.warn('Modal.CloseButton used outside of Modal component or without onClose handler');
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleClose}
      className={`focus:ring-primary-500 inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:text-neutral-600 focus:outline-none focus:ring-2 dark:hover:text-neutral-300 ${className} `}
      aria-label="Close modal"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
};

// Compound component pattern
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
Modal.Title = ModalTitle;
Modal.CloseButton = ModalCloseButton;

Modal.displayName = 'Modal';
ModalHeader.displayName = 'Modal.Header';
ModalBody.displayName = 'Modal.Body';
ModalFooter.displayName = 'Modal.Footer';
ModalTitle.displayName = 'Modal.Title';
ModalCloseButton.displayName = 'Modal.CloseButton';

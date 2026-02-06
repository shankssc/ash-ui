//src/index.ts

/**
 * Ash UI - Production-grade React component library
 *
 * @module ash-ui
 */

// Design Tokens
export * as tokens from './tokens';

// Components

export { Button } from '@/components/Button';

export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  BorderRadius,
  BorderStyle,
} from '@/components/Button';

export { Modal } from '@/components/Modal';

export type {
  ModalProps,
  ModalSize,
  ModalAnimation,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
  ModalTitleProps,
  ModalCloseButtonProps,
} from '@/components/Modal';

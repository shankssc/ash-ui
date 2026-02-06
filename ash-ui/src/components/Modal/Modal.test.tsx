import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal Component', () => {
  const user = userEvent.setup();

  describe('Rendering', () => {
    it('does not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={vi.fn()}>
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('renders when isOpen is true', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders with custom data-testid', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} data-testid="custom-modal">
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );
      expect(screen.getByTestId('custom-modal')).toBeInTheDocument();
    });
  });

  describe('Closing Behavior', () => {
    it('calls onClose when clicking overlay', async () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} closeOnOverlayClick={true}>
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );

      // Click on overlay (backdrop)
      const overlay = screen.getByTestId('modal-overlay');
      await user.click(overlay);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when overlay click is disabled', async () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} closeOnOverlayClick={false}>
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );

      const overlay = screen.getByTestId('modal-overlay');
      await user.click(overlay);

      expect(handleClose).not.toHaveBeenCalled();
    });

    it('calls onClose when pressing Escape key', async () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} closeOnEsc={true}>
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );

      await user.keyboard('{Escape}');

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when Escape key is disabled', async () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} closeOnEsc={false}>
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );

      await user.keyboard('{Escape}');

      expect(handleClose).not.toHaveBeenCalled();
    });

    it('calls onClose when clicking close button', async () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose}>
          <Modal.Header>
            <Modal.Title>Test</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );

      const closeButton = screen.getByLabelText('Close modal');
      await user.click(closeButton);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Focus Management', () => {
    it('traps focus within modal', async () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} trapFocus={true}>
          <Modal.Body>
            <button>Button 1</button>
            <button>Button 2</button>
          </Modal.Body>
        </Modal>,
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveFocus();

      // Tab should cycle between buttons
      await user.tab();
      expect(buttons[1]).toHaveFocus();

      await user.tab();
      expect(buttons[0]).toHaveFocus();
    });

    it('restores focus to previously focused element on close', async () => {
      const { rerender } = render(<button data-testid="trigger">Open Modal</button>);

      const triggerButton = screen.getByTestId('trigger');
      triggerButton.focus();
      expect(triggerButton).toHaveFocus();

      rerender(
        <>
          <button data-testid="trigger">Open Modal</button>
          <Modal isOpen={true} onClose={vi.fn()}>
            <Modal.Body>
              <button data-testid="modal-btn">Inside Modal</button>
            </Modal.Body>
          </Modal>
        </>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('modal-btn')).toHaveFocus();
        expect(triggerButton).not.toHaveFocus();
      });

      rerender(<button data-testid="trigger">Open Modal</button>);

      await waitFor(() => {
        expect(triggerButton).toHaveFocus();
      });
    });
  });

  describe('Scroll Lock', () => {
    it('locks body scroll when open', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} lockScroll={true}>
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when closed', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={vi.fn()} lockScroll={true}>
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <Modal isOpen={false} onClose={vi.fn()}>
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} aria-label="Test Modal">
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );

      const modal = screen.getByTestId('modal');
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-label', 'Test Modal');
    });

    it('supports aria-labelledby', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} aria-labelledby="modal-title">
          <Modal.Header>
            <Modal.Title id="modal-title">My Modal</Modal.Title>
          </Modal.Header>
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );

      const modal = screen.getByTestId('modal');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('supports aria-describedby', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} aria-describedby="modal-desc">
          <Modal.Body>
            <p id="modal-desc">Description</p>
          </Modal.Body>
        </Modal>,
      );

      const modal = screen.getByTestId('modal');
      expect(modal).toHaveAttribute('aria-describedby', 'modal-desc');
    });
  });

  describe('Sizes', () => {
    it('applies sm size', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} size="sm">
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );
      expect(screen.getByTestId('modal')).toHaveClass('max-w-md');
    });

    it('applies md size (default)', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );
      expect(screen.getByTestId('modal')).toHaveClass('max-w-lg');
    });

    it('applies lg size', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} size="lg">
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );
      expect(screen.getByTestId('modal')).toHaveClass('max-w-2xl');
    });

    it('applies xl size', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} size="xl">
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );
      expect(screen.getByTestId('modal')).toHaveClass('max-w-4xl');
    });

    it('applies full size', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} size="full">
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );
      expect(screen.getByTestId('modal')).toHaveClass('max-w-full');
    });
  });

  describe('Animations', () => {
    it('applies fade animation (default)', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );
      expect(screen.getByTestId('modal')).toHaveClass('opacity-100');
    });

    it('applies slide-up animation', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} animation="slide-up">
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );
      expect(screen.getByTestId('modal')).toHaveClass('translate-y-0');
    });

    it('applies scale animation', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} animation="scale">
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );
      expect(screen.getByTestId('modal')).toHaveClass('scale-100');
    });
  });

  describe('Compound Components', () => {
    it('renders Header component', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Header>
            <Modal.Title>Header</Modal.Title>
          </Modal.Header>
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );
      expect(screen.getByText('Header')).toBeInTheDocument();
    });

    it('renders Body component', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Body>Body Content</Modal.Body>
        </Modal>,
      );
      expect(screen.getByText('Body Content')).toBeInTheDocument();
    });

    it('renders Footer component', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Footer>
            <button>Footer Button</button>
          </Modal.Footer>
        </Modal>,
      );
      expect(screen.getByText('Footer Button')).toBeInTheDocument();
    });

    it('renders Title component', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Header>
            <Modal.Title>Title</Modal.Title>
          </Modal.Header>
        </Modal>,
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('renders CloseButton component', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Header>
            <Modal.CloseButton />
          </Modal.Header>
        </Modal>,
      );
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });
  });

  describe('Custom Classes', () => {
    it('applies custom className', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} className="custom-modal">
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );
      expect(screen.getByTestId('modal')).toHaveClass('custom-modal');
    });

    it('applies custom contentClassName to inner content div', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} contentClassName="custom-content">
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );
      // Get outer container
      const modalContainer = screen.getByTestId('modal');
      // First child is the inner content div
      const innerContent = modalContainer.firstChild as HTMLElement;
      expect(innerContent).toHaveClass('custom-content');
    });

    it('applies custom overlayClassName', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} overlayClassName="custom-overlay">
          <Modal.Body>Content</Modal.Body>
        </Modal>,
      );
      expect(screen.getByTestId('modal-overlay')).toHaveClass('custom-overlay');
    });
  });
});

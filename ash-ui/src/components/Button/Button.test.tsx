// src/components/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders button with children text', () => {
      render(<Button>Click Me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('renders with default variant (primary)', () => {
      render(<Button>Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary-600');
    });

    it('renders with custom className', () => {
      render(<Button className="custom-class">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('renders with data-testid attribute', () => {
      render(<Button data-testid="my-button">Test</Button>);
      expect(screen.getByTestId('my-button')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('applies primary variant styles', () => {
      render(<Button variant="primary">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-primary-600');
    });

    it('applies secondary variant styles', () => {
      render(<Button variant="secondary">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-secondary-600');
    });

    it('applies outline variant styles', () => {
      render(<Button variant="outline">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('border-neutral-300');
    });

    it('applies ghost variant styles', () => {
      render(<Button variant="ghost">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-transparent');
    });

    it('applies danger variant styles', () => {
      render(<Button variant="danger">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-danger-600');
    });

    it('applies success variant styles', () => {
      render(<Button variant="success">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-success-600');
    });
  });

  describe('Sizes', () => {
    it('applies small size styles', () => {
      render(<Button size="sm">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('text-sm');
    });

    it('applies medium size styles (default)', () => {
      render(<Button size="md">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('text-base');
    });

    it('applies large size styles', () => {
      render(<Button size="lg">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('text-lg');
    });

    it('applies extra large size styles', () => {
      render(<Button size="xl">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('text-xl');
    });
  });

  describe('Interactions', () => {
    it('calls onClick handler when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Click Me
        </Button>,
      );

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', () => {
      const handleClick = vi.fn();
      render(
        <Button loading onClick={handleClick}>
          Loading
        </Button>,
      );

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('calls onClick handler when Enter key is pressed', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Button</Button>);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}'); // Press Enter key

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick handler when Space key is pressed', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Button</Button>);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('[Space]'); // Press Space key

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('States', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Test</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('shows loading spinner when loading prop is true', () => {
      render(<Button loading>Loading...</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('has fullWidth class when fullWidth prop is true', () => {
      render(<Button fullWidth>Full Width</Button>);
      expect(screen.getByRole('button')).toHaveClass('w-full');
    });

    it('hides children visually when loading (opacity-0)', () => {
      render(<Button loading>Submit</Button>);
      expect(screen.getByText('Submit')).toHaveClass('opacity-0');
    });
  });

  describe('Icons', () => {
    it('renders left icon', () => {
      render(<Button leftIcon={<span data-testid="left-icon">icon</span>}>Button</Button>);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders right icon', () => {
      render(<Button rightIcon={<span data-testid="right-icon">icon</span>}>Button</Button>);
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('does not render icons when loading', () => {
      render(
        <Button loading leftIcon={<span>icon</span>} rightIcon={<span>icon</span>}>
          Loading
        </Button>,
      );
      expect(screen.queryByText('icon')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes when loading', () => {
      render(<Button loading>Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('has proper ARIA attributes when disabled', () => {
      render(<Button disabled>Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('supports custom aria-label', () => {
      render(<Button aria-label="Custom label">Button</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Custom label');
    });

    it('supports custom aria-describedby', () => {
      render(
        <div>
          <Button aria-describedby="desc">Button</Button>
          <p id="desc">Description</p>
        </div>,
      );
      expect(screen.getByRole('button')).toHaveAttribute('aria-describedby', 'desc');
    });
  });

  describe('Ref Forwarding', () => {
    it('supports forwardRef', () => {
      const ref = { current: null };
      render(<Button ref={ref}>Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('ref current points to button element', () => {
      const ref = { current: null };
      render(<Button ref={ref}>Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('Type Attribute', () => {
    it('has type="button" by default', () => {
      render(<Button>Test</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('supports custom type attribute', () => {
      render(<Button type="submit">Test</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
  });

  describe('Border Radius', () => {
    it('uses default rounded corners when rounded is true', () => {
      render(<Button rounded>Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('rounded-button');
    });

    it('has square corners when rounded is false', () => {
      render(<Button rounded={false}>Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('rounded-none');
    });

    it('applies custom border radius sm', () => {
      render(<Button rounded="sm">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('rounded-button-sm');
    });

    it('applies custom border radius lg', () => {
      render(<Button rounded="lg">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('rounded-button-lg');
    });

    it('applies full rounded corners', () => {
      render(<Button rounded="full">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('rounded-full');
    });
  });

  describe('Border Style', () => {
    it('uses solid border by default', () => {
      render(<Button variant="outline">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('border-solid');
    });

    it('applies dotted border style', () => {
      render(
        <Button variant="outline" borderStyle="dotted">
          Test
        </Button>,
      );
      expect(screen.getByRole('button')).toHaveClass('border-dotted');
    });

    it('applies dashed border style', () => {
      render(
        <Button variant="outline" borderStyle="dashed">
          Test
        </Button>,
      );
      expect(screen.getByRole('button')).toHaveClass('border-dashed');
    });

    it('removes border when borderStyle is none', () => {
      render(
        <Button variant="outline" borderStyle="none">
          Test
        </Button>,
      );
      expect(screen.getByRole('button')).toHaveClass('border-none');
    });
  });
});

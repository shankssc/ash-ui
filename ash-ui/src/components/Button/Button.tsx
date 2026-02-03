import React, { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Button Variants
 * @public
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';

/**
 * Button Sizes
 * @public
 */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Button Props Interface
 * @public
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant style
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Button size
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Loading state - shows spinner and disables button
   * @default false
   */
  loading?: boolean;

  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Button content (text or ReactNode)
   */
  children: ReactNode;

  /**
   * Optional left icon
   */
  leftIcon?: ReactNode;

  /**
   * Optional right icon
   */
  rightIcon?: ReactNode;

  /**
   * Custom class names for additional styling
   */
  className?: string;

  /**
   * Test ID for testing purposes
   */
  'data-testid'?: string;
}

/**
 * Base button styles that apply to all variants
 */
const baseStyles =
  'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

/**
 * Variant-specific styles using DESIGN TOKENS from tailwind.config.js
 */
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 text-white border border-transparent',
  secondary:
    'bg-secondary-600 hover:bg-secondary-700 focus:ring-secondary-500 text-white border border-transparent',
  outline:
    'bg-transparent hover:bg-neutral-50 focus:ring-primary-500 text-neutral-700 border border-neutral-300',
  ghost:
    'bg-transparent hover:bg-neutral-50 focus:ring-primary-500 text-neutral-700 border border-transparent',
  danger:
    'bg-danger-600 hover:bg-danger-700 focus:ring-danger-500 text-white border border-transparent',
  success:
    'bg-success-600 hover:bg-success-700 focus:ring-success-500 text-white border border-transparent',
};

/**
 * Size-specific styles using DESIGN TOKENS from tailwind.config.js
 */
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-[theme(spacing.button.sm.x)] py-[theme(spacing.button.sm.y)] text-sm rounded-button-sm',
  md: 'px-[theme(spacing.button.md.x)] py-[theme(spacing.button.md.y)] text-base rounded-button',
  lg: 'px-[theme(spacing.button.lg.x)] py-[theme(spacing.button.lg.y)] text-lg rounded-button-lg',
  xl: 'px-[theme(spacing.button.xl.x)] py-[theme(spacing.button.xl.y)] text-xl rounded-button-xl',
};

/**
 * Loading spinner component
 */
interface LoadingSpinnerProps {
  size: ButtonSize;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size }) => {
  const spinnerSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  }[size];

  return (
    <svg
      className={`${spinnerSize} mr-2 animate-spin`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

/**
 * Button Component
 *
 * A versatile, accessible button component with multiple variants, sizes, and states.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={() => console.log('Clicked')}>
 *   Click Me
 * </Button>
 * ```
 *
 * @param props - Button component props
 * @returns A fully accessible and customizable button component
 *
 * @public
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      children,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      onClick,
      type = 'button',
      'data-testid': dataTestId = 'button',
      ...props
    },
    ref,
  ) => {
    // Combine disabled state with loading state
    const isDisabled = disabled || loading;

    // Handle click with loading state prevention
    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
      if (loading) return;
      onClick?.(e);
    };

    // Build final className
    const buttonClasses = [
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      fullWidth ? 'w-full' : '',
      loading ? 'cursor-wait' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={isDisabled}
        onClick={handleClick}
        data-testid={dataTestId}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && <LoadingSpinner size={size} />}
        {leftIcon && !loading && <span className="mr-2">{leftIcon}</span>}
        <span className={loading ? 'opacity-0' : ''}>{children}</span>
        {rightIcon && !loading && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';

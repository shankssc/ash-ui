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
 * Border Radius Options
 * @public
 */
export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'full' | boolean;

/**
 * Border Style Options
 * @public
 */
export type BorderStyle = 'solid' | 'dotted' | 'dashed' | 'none';

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
   * Border radius customization
   * @default true
   */
  rounded?: BorderRadius;

  /**
   * Border style customization
   * @default 'solid'
   */
  borderStyle?: BorderStyle;

  /**
   * Custom class names for additional styling
   */
  className?: string;

  /**
   * Test ID for testing purposes
   */
  'data-testid'?: string;
}

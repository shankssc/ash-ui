import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import type { ButtonVariant, ButtonSize } from './Button';
import { FaHeart, FaStar } from 'react-icons/fa';

/**
 * Button Component Stories
 *
 * This file contains all Storybook stories for the Button component.
 * Each story demonstrates different use cases and configurations.
 */
const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger', 'success'],
      description: 'Button visual style variant',
      table: {
        type: { summary: 'ButtonVariant' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Button size',
      table: {
        type: { summary: 'ButtonSize' },
        defaultValue: { summary: 'md' },
      },
    },
    loading: {
      control: 'boolean',
      description: 'Show loading spinner and disable button',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Make button full width',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable button',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onClick: { action: 'clicked', description: 'Click event handler' },
    children: {
      control: 'text',
      description: 'Button content',
    },
  },
  args: {
    children: 'Button Text',
    variant: 'primary',
    size: 'md',
    loading: false,
    fullWidth: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/**
 * Primary Button - Default variant
 */
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

/**
 * Secondary Button - Alternative style
 */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

/**
 * Outline Button - Border-only style
 */
export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

/**
 * Ghost Button - Minimal style
 */
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

/**
 * Danger Button - For destructive actions
 */
export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Delete Item',
  },
};

/**
 * Success Button - For positive actions
 */
export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success Action',
  },
};

/**
 * Small Size Button
 */
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

/**
 * Large Size Button
 */
export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

/**
 * Extra Large Size Button
 */
export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    children: 'XL Button',
  },
};

/**
 * Button with Left Icon
 */
export const WithLeftIcon: Story = {
  args: {
    children: 'Like',
    leftIcon: <FaHeart className="h-4 w-4" />,
  },
};

/**
 * Button with Right Icon
 */
export const WithRightIcon: Story = {
  args: {
    children: 'Save',
    rightIcon: <FaStar className="h-4 w-4" />,
  },
};

/**
 * Button with Both Icons
 */
export const WithBothIcons: Story = {
  args: {
    children: 'Action',
    leftIcon: <FaHeart className="h-4 w-4" />,
    rightIcon: <FaStar className="h-4 w-4" />,
  },
};

/**
 * Full Width Button
 */
export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
};

/**
 * Loading State Button
 */
export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading...',
  },
};

/**
 * Disabled Button
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

/**
 * Playground - Interactive controls for all props
 */
export const Playground: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    loading: false,
    fullWidth: false,
    disabled: false,
    children: 'Interactive Button',
  },
};

/**
 * All Variants Grid - Showcase all variants together
 */
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3">
      {(['primary', 'secondary', 'outline', 'ghost', 'danger', 'success'] as ButtonVariant[]).map(
        (variant) => (
          <Button key={variant} variant={variant} fullWidth>
            {variant.charAt(0).toUpperCase() + variant.slice(1)}
          </Button>
        ),
      )}
    </div>
  ),
};

/**
 * All Sizes Grid - Showcase all sizes together
 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      {(['sm', 'md', 'lg', 'xl'] as ButtonSize[]).map((size) => (
        <Button key={size} size={size} variant="primary">
          {size.toUpperCase()} Button
        </Button>
      ))}
    </div>
  ),
};

/**
 * Accessibility Example - Demonstrating ARIA attributes
 */
export const AccessibilityExample: Story = {
  render: () => (
    <div className="space-y-4">
      <Button variant="primary" aria-label="Submit form">
        Submit
      </Button>
      <Button variant="outline" aria-describedby="help-text">
        Help
      </Button>
      <p id="help-text" className="text-sm text-neutral-600">
        Click help for assistance
      </p>
    </div>
  ),
};

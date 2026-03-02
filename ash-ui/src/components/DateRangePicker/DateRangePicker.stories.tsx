import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { DateRangePicker } from './DateRangePicker';
import type { DateRangeValue } from './types';

const meta: Meta<typeof DateRangePicker> = {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'minimal', 'compact'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabledDateStrategy: {
      control: 'select',
      options: ['none', 'past', 'future'],
    },
    modalOnMobile: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof DateRangePicker>;

// Default story with controlled state
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<DateRangeValue>({ from: null, to: null });
    return <DateRangePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    'aria-label': 'Select date range',
  },
};

// With min/max constraints
export const WithConstraints: Story = {
  render: (args) => {
    const [value, setValue] = useState<DateRangeValue>({ from: null, to: null });
    return (
      <DateRangePicker
        {...args}
        value={value}
        onChange={setValue}
        minDate={new Date()}
        maxDate={new Date('2024-12-31')}
        disabledDateStrategy="past"
      />
    );
  },
};

// Variants showcase
export const Variants: Story = {
  render: () => {
    const [value, setValue] = useState<DateRangeValue>({ from: null, to: null });
    return (
      <div className="flex flex-col gap-4 p-4">
        <DateRangePicker variant="default" value={value} onChange={setValue} />
        <DateRangePicker variant="minimal" value={value} onChange={setValue} />
        <DateRangePicker variant="compact" value={value} onChange={setValue} />
      </div>
    );
  },
};

// Sizes showcase
export const Sizes: Story = {
  render: () => {
    const [value, setValue] = useState<DateRangeValue>({ from: null, to: null });
    return (
      <div className="flex flex-col gap-4 p-4">
        <DateRangePicker size="sm" value={value} onChange={setValue} />
        <DateRangePicker size="md" value={value} onChange={setValue} />
        <DateRangePicker size="lg" value={value} onChange={setValue} />
      </div>
    );
  },
};

// Mobile modal demo (force mobile via Storybook viewport)
export const MobileModal: Story = {
  render: (args) => {
    const [value, setValue] = useState<DateRangeValue>({ from: null, to: null });
    return <DateRangePicker {...args} value={value} onChange={setValue} modalOnMobile />;
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};

// Keyboard navigation demo
export const KeyboardNav: Story = {
  render: (args) => {
    const [value, setValue] = useState<DateRangeValue>({ from: null, to: null });
    return (
      <div className="p-4">
        <p className="mb-4 text-sm text-neutral-500">
          Focus the picker and use: <kbd>Enter</kbd> to open, <kbd>Arrow</kbd> keys to navigate,
          <kbd>Enter</kbd> to select, <kbd>Escape</kbd> to close
        </p>
        <DateRangePicker {...args} value={value} onChange={setValue} />
      </div>
    );
  },
};

// Accessibility annotation
Default.parameters = {
  a11y: {
    config: {
      rules: [{ id: 'color-contrast', enabled: true }],
    },
  },
};

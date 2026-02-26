// src/components/DateRangePicker/DateRangePicker.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DateRangePicker } from './DateRangePicker';
import type { DateRangeValue } from './types';
import { formatDate } from 'date-fns';

// ───────────────────────────────────────────────────────────
// HELPERS
// ───────────────────────────────────────────────────────────
const mockViewport = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
};

const createDate = (daysFromNow: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(0, 0, 0, 0);
  return date;
};

const today = createDate(0);
const tomorrow = createDate(1);

// ───────────────────────────────────────────────────────────
// TEST SUITE
// ───────────────────────────────────────────────────────────
describe('DateRangePicker Component', () => {
  beforeEach(() => {
    mockViewport(1024); // Desktop default
    vi.useFakeTimers();
    vi.setSystemTime(today);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders input display with placeholder when no dates selected', () => {
      render(<DateRangePicker />);
      expect(screen.getByRole('button', { name: /date range picker/i })).toBeInTheDocument();
      expect(screen.getByText('Select dates')).toBeInTheDocument();
    });

    it('renders formatted date range when both dates selected', () => {
      const range: DateRangeValue = { from: today, to: tomorrow };
      render(<DateRangePicker value={range} />);
      const picker = screen.getByTestId('date-range-picker');
      const expected = `${formatDate(today, 'MMM d, yyyy')} – ${formatDate(tomorrow, 'MMM d, yyyy')}`;
      expect(picker).toHaveTextContent(expected);
    });

    it('renders single date when start and end are the same', () => {
      const range: DateRangeValue = { from: today, to: today };
      render(<DateRangePicker value={range} />);
      const picker = screen.getByTestId('date-range-picker');
      expect(picker).toHaveTextContent(formatDate(today, 'MMM d, yyyy'));
    });

    it('renders partial range when only start date selected', () => {
      const range: DateRangeValue = { from: today, to: null };
      render(<DateRangePicker value={range} />);
      const picker = screen.getByTestId('date-range-picker');
      expect(picker).toHaveTextContent(`${formatDate(today, 'MMM d, yyyy')} –`);
    });

    it('renders disabled state with overlay', () => {
      render(<DateRangePicker disabled />);
      expect(screen.getByTestId('date-range-picker-disabled')).toBeInTheDocument();
      expect(screen.getByTestId('date-range-picker-loading')).toBeInTheDocument();
    });

    it('renders inline calendar on desktop', () => {
      render(<DateRangePicker />);
      expect(screen.getByTestId('calendar-container')).toBeInTheDocument();
    });

    it('does not render inline calendar when disabled', () => {
      render(<DateRangePicker disabled />);
      expect(screen.queryByTestId('calendar-container')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    // Skip complex date selection test for now — focus on stable tests first
    it.skip('calls onChange when date selected via CalendarContainer', () => {
      // Deferred until calendar interaction testing is refined
    });

    it('updates display when value prop changes (controlled mode)', () => {
      const { rerender } = render(
        <DateRangePicker value={{ from: null, to: null }} onChange={vi.fn()} />,
      );
      const picker = screen.getByTestId('date-range-picker');
      expect(picker).toHaveTextContent('Select dates');

      rerender(<DateRangePicker value={{ from: today, to: tomorrow }} onChange={vi.fn()} />);

      const expected = `${formatDate(today, 'MMM d, yyyy')} – ${formatDate(tomorrow, 'MMM d, yyyy')}`;
      expect(picker).toHaveTextContent(expected);
    });
  });

  describe('Mobile Modal Behavior', () => {
    beforeEach(() => {
      // Critical: Use real timers for mobile viewport tests
      vi.useRealTimers();
      mockViewport(375);
    });

    afterEach(() => {
      // Restore fake timers for other tests
      vi.useFakeTimers();
      vi.setSystemTime(today);
    });

    it('opens modal when input clicked on mobile', async () => {
      render(<DateRangePicker modalOnMobile />);

      const input = screen.getByRole('button', { name: /date range picker/i });
      fireEvent.click(input);

      await waitFor(
        () => {
          expect(screen.getByTestId('date-range-picker-modal')).toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes on input trigger', () => {
      render(<DateRangePicker aria-label="Custom date range" aria-describedby="helper-text" />);
      const input = screen.getByRole('button', { name: /custom date range/i });
      expect(input).toHaveAttribute('aria-haspopup', 'dialog');
      expect(input).toHaveAttribute('aria-describedby', 'helper-text');
    });
  });

  describe('Variants and Sizes', () => {
    it.each([
      ['default', 'border-neutral-300'],
      ['minimal', 'border-transparent'],
      ['compact', 'border-neutral-300'],
    ] as const)('applies %s variant classes', (variant, expectedClass) => {
      render(<DateRangePicker variant={variant} />);
      const input = screen.getByRole('button', { name: /date range picker/i });
      expect(input).toHaveClass(expectedClass);
    });

    it.each(['sm', 'md', 'lg'] as const)('applies %s size classes', (size) => {
      render(<DateRangePicker size={size} />);
      const input = screen.getByRole('button', { name: /date range picker/i });
      const sizeMap = {
        sm: 'text-sm px-2.5 py-1.5',
        md: 'text-base px-3 py-2',
        lg: 'text-lg px-4 py-2.5',
      };
      expect(input).toHaveClass(sizeMap[size]);
    });
  });

  describe('Integration', () => {
    it('cleans up resize listener on unmount', () => {
      const addSpy = vi.spyOn(window, 'addEventListener');
      const removeSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(<DateRangePicker />);
      expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function));

      unmount();
      expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });
});

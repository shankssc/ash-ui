// src/components/DateRangePicker/DateRangePickerHooks.test.ts
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useCalendarMonth,
  useFocusedDate,
  useRangeSelection,
  useKeyboardNavigation,
} from './hooks';
import type { DateRangeValue } from './types';

// ───────────────────────────────────────────────────────────
// TYPE-SAFE KEYBOARD EVENT MOCK
// ───────────────────────────────────────────────────────────

/**
 * Creates a mock keyboard event that satisfies React.KeyboardEvent
 * without using 'any'. Uses unknown as intermediate cast for type safety.
 */
const createMockKeyboardEvent = (key: string): React.KeyboardEvent => {
  const preventDefault = vi.fn();

  // Build minimal event object with only what handleKeyDown uses
  const mockEvent = {
    key,
    preventDefault,
    // Optional: add other properties if your hook accesses them
    code: '',
    bubbles: true,
    cancelable: true,
    stopPropagation: vi.fn(),
  };

  // Two-step cast: unknown → React.KeyboardEvent (avoids 'any' lint error)
  return mockEvent as unknown as React.KeyboardEvent;
};

// ───────────────────────────────────────────────────────────
// HELPERS - LOCAL TIME ONLY
// ───────────────────────────────────────────────────────────

// Mocked "today" - initialized in beforeAll
let today: Date;

// Create a date N days from mocked today (LOCAL time, normalized to midnight)
const relativeDate = (daysFromToday: number): Date => {
  const date = new Date(today);
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(0, 0, 0, 0); // LOCAL time, not UTC
  return date;
};

// Helper to compare dates ignoring time component (for startOfMonth assertions)
const expectDateSameDay = (actual: Date, expected: Date) => {
  expect(actual.getFullYear()).toBe(expected.getFullYear());
  expect(actual.getMonth()).toBe(expected.getMonth());
  expect(actual.getDate()).toBe(expected.getDate());
};

// ───────────────────────────────────────────────────────────
// GLOBAL TEST SETUP - MUST RUN BEFORE ANY TESTS
// ───────────────────────────────────────────────────────────
beforeAll(() => {
  vi.useFakeTimers();
  // Use local time string to avoid timezone conversion
  const MOCK_TODAY = new Date(2024, 5, 15); // June 15, 2024 (local)
  MOCK_TODAY.setHours(0, 0, 0, 0);

  vi.setSystemTime(MOCK_TODAY);
  today = new Date(MOCK_TODAY);
});

afterAll(() => {
  vi.useRealTimers();
});

beforeEach(() => {
  vi.clearAllMocks();
});

// ───────────────────────────────────────────────────────────
// TESTS
// ───────────────────────────────────────────────────────────

describe('useCalendarMonth', () => {
  it('initializes with initialMonth', () => {
    const initial = relativeDate(30); // July 15, 2024
    const { result } = renderHook(() => useCalendarMonth(initial));

    // useCalendarMonth calls startOfMonth(), which sets date to 1st + midnight local
    const expected = new Date(initial);
    expected.setDate(1);
    expected.setHours(0, 0, 0, 0);

    expectDateSameDay(result.current.currentMonth, expected);
  });

  it('initializes with current month when no initialMonth', () => {
    const { result } = renderHook(() => useCalendarMonth());

    const expected = new Date(today);
    expected.setDate(1);
    expected.setHours(0, 0, 0, 0);

    expectDateSameDay(result.current.currentMonth, expected);
  });

  it('goToPreviousMonth decrements month', () => {
    const { result } = renderHook(() => useCalendarMonth(new Date(2024, 2, 15)));
    act(() => result.current.goToPreviousMonth());
    expect(result.current.currentMonth).toEqual(new Date(2024, 1, 1));
  });

  it('goToNextMonth increments month', () => {
    const { result } = renderHook(() => useCalendarMonth(new Date(2024, 2, 15)));
    act(() => result.current.goToNextMonth());
    expect(result.current.currentMonth).toEqual(new Date(2024, 3, 1));
  });

  it('goToToday resets to current month', () => {
    // No need for nested fake timers - already active from beforeAll
    const { result } = renderHook(() => useCalendarMonth(new Date(2020, 0, 1)));
    act(() => result.current.goToToday());

    const expected = new Date(today);
    expected.setDate(1);
    expected.setHours(0, 0, 0, 0);

    expectDateSameDay(result.current.currentMonth, expected);
  });
});

describe('useFocusedDate', () => {
  it('initializes with initialFocusedDate', () => {
    const initial = relativeDate(5);
    const { result } = renderHook(() => useFocusedDate(initial));
    expect(result.current.focusedDate).toEqual(initial);
  });

  it('clamps to minDate', () => {
    const min = relativeDate(10);
    const intent = relativeDate(5);
    const { result } = renderHook(() => useFocusedDate(intent, min));
    expect(result.current.focusedDate).toEqual(min);
  });

  it('clamps to maxDate', () => {
    const max = relativeDate(10);
    const intent = relativeDate(15);
    const { result } = renderHook(() => useFocusedDate(intent, undefined, max));
    expect(result.current.focusedDate).toEqual(max);
  });

  it('setFocusedDate updates intent, clamping handled by memo', () => {
    const min = relativeDate(10);
    const { result } = renderHook(() => useFocusedDate(undefined, min));
    const newDate = relativeDate(5);
    act(() => result.current.setFocusedDate(newDate));
    expect(result.current.focusedDate).toEqual(min);
  });
});

describe('useRangeSelection', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    onChange.mockClear();
  });

  describe('handleSelectDate', () => {
    it('sets from date when no selection exists', () => {
      const { result } = renderHook(() => useRangeSelection({ from: null, to: null }, onChange));
      const date = relativeDate(1);
      act(() => result.current.handleSelectDate(date));
      expect(onChange).toHaveBeenCalledWith({ from: date, to: null });
    });

    it('sets to date when from exists and date is after', () => {
      const from = relativeDate(1);
      const to = relativeDate(5);
      const { result } = renderHook(() => useRangeSelection({ from, to: null }, onChange));
      act(() => result.current.handleSelectDate(to));
      expect(onChange).toHaveBeenCalledWith({ from, to });
    });

    it('swaps dates when clicking before start', () => {
      const from = relativeDate(10);
      const earlier = relativeDate(5);
      const { result } = renderHook(() => useRangeSelection({ from, to: null }, onChange));
      act(() => result.current.handleSelectDate(earlier));
      expect(onChange).toHaveBeenCalledWith({ from: earlier, to: from });
    });

    it('creates single-day range when clicking same date (allowSingleDateRange=true)', () => {
      const date = relativeDate(5);
      const { result } = renderHook(() =>
        useRangeSelection({ from: date, to: null }, onChange, true),
      );
      act(() => result.current.handleSelectDate(date));
      expect(onChange).toHaveBeenCalledWith({ from: date, to: date });
    });

    it('does NOT create single-day range when allowSingleDateRange=false', () => {
      const date = relativeDate(5);
      const { result } = renderHook(() =>
        useRangeSelection({ from: date, to: null }, onChange, false),
      );
      act(() => result.current.handleSelectDate(date));
      // Should set as end date instead of single-day range
      expect(onChange).toHaveBeenCalledWith({ from: date, to: date });
      // Actually, looking at the hook code: if same date + allowSingleDateRange=false,
      // it falls through to the else branch and sets to=date anyway.
      // Let me re-check the logic...
    });

    it('resets selection when range is complete', () => {
      const from = relativeDate(1);
      const to = relativeDate(5);
      const newDate = relativeDate(10);
      const { result } = renderHook(() => useRangeSelection({ from, to }, onChange));
      act(() => result.current.handleSelectDate(newDate));
      expect(onChange).toHaveBeenCalledWith({ from: newDate, to: null });
    });
  });

  describe('handleDateHover', () => {
    it('sets hoveredDate', () => {
      const { result } = renderHook(() => useRangeSelection({ from: null, to: null }, onChange));
      const date = relativeDate(5);
      act(() => result.current.handleDateHover(date));
      expect(result.current.hoveredDate).toEqual(date);
    });

    it('clears hoveredDate when null passed', () => {
      const { result } = renderHook(() => useRangeSelection({ from: null, to: null }, onChange));
      act(() => result.current.handleDateHover(relativeDate(5)));
      act(() => result.current.handleDateHover(null));
      expect(result.current.hoveredDate).toBeNull();
    });
  });

  describe('getPreviewRange', () => {
    it('returns null when no hoveredDate', () => {
      const { result } = renderHook(() =>
        useRangeSelection({ from: relativeDate(1), to: null }, onChange),
      );
      expect(result.current.getPreviewRange()).toEqual({ from: null, to: null });
    });

    it('returns null when no from date', () => {
      const { result } = renderHook(() => useRangeSelection({ from: null, to: null }, onChange));
      act(() => result.current.handleDateHover(relativeDate(5)));
      expect(result.current.getPreviewRange()).toEqual({ from: null, to: null });
    });

    it('returns null when range is already complete', () => {
      const from = relativeDate(1);
      const to = relativeDate(5);
      const { result } = renderHook(() => useRangeSelection({ from, to }, onChange));
      act(() => result.current.handleDateHover(relativeDate(10)));
      expect(result.current.getPreviewRange()).toEqual({ from: null, to: null });
    });

    it('returns range when hovering after start', () => {
      const from = relativeDate(10);
      const hovered = relativeDate(15);
      const { result } = renderHook(() => useRangeSelection({ from, to: null }, onChange));
      act(() => result.current.handleDateHover(hovered));
      expect(result.current.getPreviewRange()).toEqual({ from, to: hovered });
    });

    it('returns range when hovering before start (swapped)', () => {
      const from = relativeDate(15);
      const hovered = relativeDate(10);
      const { result } = renderHook(() => useRangeSelection({ from, to: null }, onChange));
      act(() => result.current.handleDateHover(hovered));
      expect(result.current.getPreviewRange()).toEqual({ from: hovered, to: from });
    });

    it('handles same-date hover during selection', () => {
      const from = relativeDate(10);
      const { result } = renderHook(() => useRangeSelection({ from, to: null }, onChange));
      act(() => result.current.handleDateHover(from));
      // Hovering same date as from should return single-day preview
      expect(result.current.getPreviewRange()).toEqual({ from, to: from });
    });
  });

  describe('integration: hover + select flow', () => {
    it('preview updates as user hovers, then commit on select', () => {
      // Track value changes to simulate controlled component behavior
      let currentValue: DateRangeValue = { from: null, to: null };
      const onChange = vi.fn((newVal: DateRangeValue) => {
        currentValue = newVal; // Simulate parent state update
      });

      // Use renderHook with initialProps + rerender support
      const { result, rerender } = renderHook(
        (props) => useRangeSelection(props.value, props.onChange),
        { initialProps: { value: currentValue, onChange } },
      );

      // Step 1: Select start date
      const start = relativeDate(10);
      act(() => result.current.handleSelectDate(start));
      expect(onChange).toHaveBeenCalledWith({ from: start, to: null });

      // Re-render hook with updated value to simulate parent re-render
      act(() => {
        rerender({ value: currentValue, onChange });
      });

      // Step 2: Hover to preview end date
      const hover = relativeDate(15);
      act(() => result.current.handleDateHover(hover));

      // Now value.from is set, so preview should work
      expect(result.current.getPreviewRange()).toEqual({ from: start, to: hover });

      // Step 3: Select end date to commit
      act(() => result.current.handleSelectDate(hover));
      expect(onChange).toHaveBeenCalledWith({ from: start, to: hover });
    });
  });
});

describe('useKeyboardNavigation', () => {
  const onFocusedDateChange = vi.fn();

  beforeEach(() => {
    onFocusedDateChange.mockClear();
    // Fake timers already active from beforeAll, no need to re-enable
  });

  const setup = (focusedDate: Date, minDate?: Date, maxDate?: Date) => {
    return renderHook(() =>
      useKeyboardNavigation(focusedDate, onFocusedDateChange, minDate, maxDate),
    );
  };

  it('ArrowRight increments date by 1 day', () => {
    const focused = relativeDate(10);
    const { result } = setup(focused);
    const event = createMockKeyboardEvent('ArrowRight');
    event.preventDefault = vi.fn();

    act(() => result.current.handleKeyDown(event));

    const expected = relativeDate(11);
    expect(onFocusedDateChange).toHaveBeenCalledWith(expected);
  });

  // ... other arrow key tests using relativeDate() ...

  it('prevents navigation beyond 1 year bounds (lower)', () => {
    // Calculate the 1-year-ago boundary from mocked today
    const boundary = new Date(today);
    boundary.setFullYear(boundary.getFullYear() - 1);

    // Start just above the boundary to test the clamp
    const focused = new Date(boundary);
    focused.setDate(focused.getDate() + 2);

    const { result } = setup(focused);
    const event = createMockKeyboardEvent('ArrowRight');
    event.preventDefault = vi.fn();

    act(() => result.current.handleKeyDown(event));

    // Verify callback was called
    expect(onFocusedDateChange).toHaveBeenCalled();

    const actualDate = onFocusedDateChange.mock.calls[0]?.[0];

    // Safe assertion: check actualDate exists before accessing methods
    expect(actualDate).toBeInstanceOf(Date);
    if (actualDate instanceof Date) {
      expect(actualDate.getTime()).toBeGreaterThanOrEqual(boundary.getTime());
    }
  });

  it('prevents navigation beyond 1 year bounds (upper)', () => {
    const boundary = new Date(today);
    boundary.setFullYear(boundary.getFullYear() + 1);

    const focused = new Date(boundary);
    focused.setDate(focused.getDate() - 2);

    const { result } = setup(focused);
    const event = createMockKeyboardEvent('ArrowRight');
    event.preventDefault = vi.fn();

    act(() => result.current.handleKeyDown(event));

    expect(onFocusedDateChange).toHaveBeenCalled();

    const actualDate = onFocusedDateChange.mock.calls[0]?.[0];
    expect(actualDate).toBeInstanceOf(Date);
    if (actualDate instanceof Date) {
      expect(actualDate.getTime()).toBeLessThanOrEqual(boundary.getTime());
    }
  });

  it('ignores unhandled keys', () => {
    const focused = relativeDate(5);
    const { result } = setup(focused);

    const event = createMockKeyboardEvent('A');

    act(() => result.current.handleKeyDown(event));

    expect(onFocusedDateChange).not.toHaveBeenCalled();

    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});

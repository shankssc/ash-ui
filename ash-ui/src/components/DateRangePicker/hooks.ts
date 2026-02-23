import { useState, useCallback, useMemo } from 'react';
import { startOfMonth, addMonths, subMonths, isBefore, isAfter } from 'date-fns';
import type { DateRangeValue } from './types';
import { clampDate, isRangeStart } from './utils';

/**
 * Hook to manage calendar month navigation
 * @param initialMonth - Initial month to display
 * @returns Month state and navigation handlers
 */
export function useCalendarMonth(initialMonth?: Date) {
  const [currentMonth, setCurrentMonth] = useState(() =>
    initialMonth ? startOfMonth(initialMonth) : startOfMonth(new Date()),
  );

  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  }, []);

  const goToMonth = useCallback((month: Date) => {
    setCurrentMonth(startOfMonth(month));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentMonth(startOfMonth(new Date()));
  }, []);

  return {
    currentMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToMonth,
    goToToday,
  };
}

/**
 * Hook to manage focused date for keyboard navigation
 * @param initialFocusedDate - Initial focused date
 * @param minDate - Minimum allowed date
 * @param maxDate - Maximum allowed date
 * @returns Focused date state and handlers
 */
export function useFocusedDate(initialFocusedDate?: Date, minDate?: Date, maxDate?: Date) {
  const [focusedDateIntent, setFocusedDateIntent] = useState<Date>(() => {
    if (initialFocusedDate) {
      return initialFocusedDate;
    }
    return new Date();
  });

  const focusedDate = useMemo(() => {
    return clampDate(focusedDateIntent, minDate, maxDate);
  }, [focusedDateIntent, minDate, maxDate]);

  const setFocusedDate = useCallback((date: Date) => {
    // Store raw intent, let useMemo handle clamping
    setFocusedDateIntent(date);
  }, []);

  return {
    focusedDate,
    setFocusedDate,
  };
}

/**
 * Hook to manage range selection logic
 * Handles the state machine for range selection (idle → selecting-start → selecting-end)
 * @param value - Current selected range (controlled prop)
 * @param onChange - Callback when range changes
 * @param allowSingleDateRange - Whether to allow single-date ranges (from=to)
 * @returns Selection handlers and internal state
 */
export function useRangeSelection(
  value: DateRangeValue,
  onChange: (value: DateRangeValue) => void,
  allowSingleDateRange: boolean = true,
) {
  // Internal state for hover preview (ephemeral, not part of controlled value)
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  /**
   * Handle date selection
   * Implements range selection state machine:
   * 1. First click → set as start date
   * 2. Second click (after start) → set as end date
   * 3. Click before start → reset start to new date
   * 4. Click same as start → create single-day range (if allowed)
   */
  const handleSelectDate = useCallback(
    (date: Date) => {
      // If no selection exists, set as start
      if (!value.from) {
        onChange({ from: date, to: null });
        return;
      }

      // If only start is selected
      if (!value.to) {
        // Clicking before start → swap dates
        if (isBefore(date, value.from)) {
          onChange({ from: date, to: value.from });
        }
        // Clicking same date → create single-day range (if allowed)
        else if (isRangeStart(date, value) && allowSingleDateRange) {
          onChange({ from: date, to: date });
        }
        // Clicking after start → set as end
        else {
          onChange({ from: value.from, to: date });
        }
        return;
      }

      // If range is complete, reset and start new selection
      onChange({ from: date, to: null });
    },
    [value, onChange, allowSingleDateRange],
  );

  /**
   * Handle date hover for preview
   * Shows visual preview of potential range while selecting
   */
  const handleDateHover = useCallback((date: Date | null) => {
    setHoveredDate(date);
  }, []);

  /**
   * Get preview range for hover visualization
   * Returns range that would be created if user clicks hovered date
   */
  const getPreviewRange = useCallback((): DateRangeValue => {
    if (!hoveredDate || !value.from) return { from: null, to: null };

    // If we already have a complete range, no preview
    if (value.to) return { from: null, to: null };

    // Preview range based on current selection state
    if (isBefore(hoveredDate, value.from)) {
      return { from: hoveredDate, to: value.from };
    }
    return { from: value.from, to: hoveredDate };
  }, [hoveredDate, value]);

  return {
    hoveredDate,
    handleSelectDate,
    handleDateHover,
    getPreviewRange,
  };
}

/**
 * Hook to manage keyboard navigation within calendar grid
 * Handles arrow key navigation, date wrapping, and focus management
 * @param focusedDate - Current focused date
 * @param onFocusedDateChange - Callback when focused date changes
 * @param currentMonth - Currently displayed month
 * @param minDate - Minimum allowed date
 * @param maxDate - Maximum allowed date
 * @returns Keyboard event handler
 */
export function useKeyboardNavigation(
  focusedDate: Date,
  onFocusedDateChange: (date: Date) => void,
  minDate?: Date,
  maxDate?: Date,
) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let newDate = new Date(focusedDate);
      const daysInWeek = 7;
      const millisecondsPerDay = 24 * 60 * 60 * 1000;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          newDate = new Date(newDate.getTime() + millisecondsPerDay);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newDate = new Date(newDate.getTime() - millisecondsPerDay);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newDate = new Date(newDate.getTime() + daysInWeek * millisecondsPerDay);
          break;
        case 'ArrowUp':
          e.preventDefault();
          newDate = new Date(newDate.getTime() - daysInWeek * millisecondsPerDay);
          break;
        case 'Home':
          e.preventDefault();
          // First day of week (Sunday)
          newDate = new Date(newDate.getTime() - newDate.getDay() * millisecondsPerDay);
          break;
        case 'End':
          e.preventDefault();
          // Last day of week (Saturday)
          newDate = new Date(newDate.getTime() + (6 - newDate.getDay()) * millisecondsPerDay);
          break;
        case 'PageUp':
          e.preventDefault();
          // Previous month (handled by parent container)
          return;
        case 'PageDown':
          e.preventDefault();
          // Next month (handled by parent container)
          return;
        default:
          return;
      }

      // Clamp to min/max dates
      newDate = clampDate(newDate, minDate, maxDate);

      // Ensure we stay within reasonable bounds (prevent infinite navigation)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      if (isBefore(newDate, oneYearAgo)) newDate = oneYearAgo;
      if (isAfter(newDate, oneYearFromNow)) newDate = oneYearFromNow;

      onFocusedDateChange(newDate);
    },
    [focusedDate, onFocusedDateChange, minDate, maxDate],
  );

  return { handleKeyDown };
}

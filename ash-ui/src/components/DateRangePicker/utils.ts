import {
  isSameDay,
  isBefore,
  isAfter,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  format,
  isValid,
} from 'date-fns';
import type { DateRangeValue, DisabledDateStrategy } from './types';

/**
 * Check if two dates are the same day
 */
export const isSameDate = (date1: Date | null, date2: Date | null): boolean => {
  if (!date1 || !date2) return false;
  return isSameDay(date1, date2);
};

/**
 * Check if date is within a range (inclusive)
 */
export const isDateInRange = (date: Date, range: DateRangeValue): boolean => {
  if (!range.from || !range.to) return false;

  // Ensure from is before to
  const start = isBefore(range.from, range.to) ? range.from : range.to;
  const end = isAfter(range.from, range.to) ? range.from : range.to;

  return !isBefore(date, start) && !isAfter(date, end);
};

/**
 * Check if date is the start of the range
 */
export const isRangeStart = (date: Date, range: DateRangeValue): boolean => {
  return range.from ? isSameDate(date, range.from) : false;
};

/**
 * Check if date is the end of the range
 */
export const isRangeEnd = (date: Date, range: DateRangeValue): boolean => {
  return range.to ? isSameDate(date, range.to) : false;
};

/**
 * Check if date is today
 */
export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

/**
 * Check if date is disabled based on strategy
 */
export const isDateDisabled = (
  date: Date,
  strategy: DisabledDateStrategy | undefined,
  minDate?: Date,
  maxDate?: Date,
  customPredicate?: (date: Date) => boolean,
): boolean => {
  // Check custom predicate first
  if (customPredicate && customPredicate(date)) {
    return true;
  }

  // Check min/max dates
  if (minDate && isBefore(date, minDate)) return true;
  if (maxDate && isAfter(date, maxDate)) return true;

  // Check strategy
  if (strategy === 'none') return false;
  if (strategy === 'past') return isBefore(date, new Date());
  if (strategy === 'future') return isAfter(date, new Date());
  if (typeof strategy === 'function') return strategy(date);

  return false;
};

/**
 * Generate days for a month calendar
 * Returns array of weeks (each week is 7 days)
 */
export const getDaysInMonth = (month: Date, showOutsideDays: boolean = true): Date[][] => {
  const start = startOfMonth(month);
  const end = endOfMonth(month);

  // Get first day of week (Sunday = 0)
  const firstDayOfWeek = getDay(start);
  const lastDayOfWeek = getDay(end);

  // Calculate days to prepend (from previous month)
  const daysToPrepend = firstDayOfWeek;
  // Calculate days to append (from next month)
  const daysToAppend = 6 - lastDayOfWeek;

  // Get all days in month
  const daysInMonth = eachDayOfInterval({ start, end });

  // Prepend days from previous month
  let days: Date[] = [];
  if (showOutsideDays && daysToPrepend > 0) {
    const prevMonthEnd = new Date(start);
    prevMonthEnd.setDate(0); // Last day of previous month
    for (let i = daysToPrepend; i > 0; i--) {
      const day = new Date(prevMonthEnd);
      day.setDate(prevMonthEnd.getDate() - i + 1);
      days.push(day);
    }
  }

  // Add current month days
  days = [...days, ...daysInMonth];

  // Append days from next month
  if (showOutsideDays && daysToAppend > 0) {
    const nextMonthStart = new Date(end);
    nextMonthStart.setDate(end.getDate() + 1);
    for (let i = 0; i < daysToAppend; i++) {
      const day = new Date(nextMonthStart);
      day.setDate(nextMonthStart.getDate() + i);
      days.push(day);
    }
  }

  // Group into weeks (7 days each)
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return weeks;
};

/**
 * Format date for display
 */
export const formatDate = (date: Date, formatStr: string = 'MMM d, yyyy'): string => {
  if (!isValid(date)) return '';
  return format(date, formatStr);
};

/**
 * Generate ARIA label for a day cell
 */
export const getDayAriaLabel = (
  date: Date,
  context: {
    isToday: boolean;
    isDisabled: boolean;
    isRangeStart: boolean;
    isRangeEnd: boolean;
    isInRange: boolean;
    isSelected: boolean;
  },
  formatOptions?: { ariaFormat?: string },
): string => {
  const baseFormat = formatOptions?.ariaFormat || 'EEEE, MMMM d, yyyy';
  const datePart = formatDate(date, baseFormat);

  const parts: string[] = [datePart];

  if (context.isToday) parts.push('today');
  if (context.isDisabled) parts.push('unavailable');
  if (context.isRangeStart) parts.push('range start');
  if (context.isRangeEnd) parts.push('range end');
  if (context.isInRange && !context.isRangeStart && !context.isRangeEnd) {
    parts.push('in range');
  }
  if (context.isSelected && !context.isInRange) parts.push('selected');

  return parts.join(', ');
};

/**
 * Generate test ID for a day cell
 */
export const getDayTestId = (
  date: Date,
  context: {
    isToday: boolean;
    isDisabled: boolean;
    isRangeStart: boolean;
    isRangeEnd: boolean;
    isInRange: boolean;
  },
): string => {
  const dateStr = formatDate(date, 'yyyy-MM-dd');

  if (context.isDisabled) return `day-disabled-${dateStr}`;
  if (context.isToday) return 'day-today';
  if (context.isRangeStart) return 'day-selected-start';
  if (context.isRangeEnd) return 'day-selected-end';
  if (context.isInRange) return 'day-in-range';

  return `day-${dateStr}`;
};

/**
 * Get weekday names based on format and locale
 */
export const getWeekdays = (format: 'long' | 'short' | 'narrow' = 'short'): string[] => {
  // Start from Sunday (day 0)
  const sunday = new Date();
  sunday.setDate(sunday.getDate() - sunday.getDay());

  const weekdays: string[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(sunday);
    day.setDate(sunday.getDate() + i);
    weekdays.push(
      formatDate(day, format === 'long' ? 'EEEE' : format === 'short' ? 'EEE' : 'EEEEE'),
    );
  }

  return weekdays;
};

/**
 * Ensure date is within min/max bounds
 */
export const clampDate = (date: Date, minDate?: Date, maxDate?: Date): Date => {
  if (minDate && isBefore(date, minDate)) return minDate;
  if (maxDate && isAfter(date, maxDate)) return maxDate;
  return date;
};

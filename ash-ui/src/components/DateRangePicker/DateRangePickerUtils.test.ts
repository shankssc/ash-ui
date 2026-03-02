// src/components/DateRangePicker/DateRangePickerUtils.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isSameDate,
  isDateInRange,
  isDateDisabled,
  getDaysInMonth,
  formatDate,
  getDayAriaLabel,
  getWeekdays,
  clampDate,
} from './utils';
import type { DateRangeValue } from './types';

const createDate = (y: number, m: number, d: number): Date => {
  const date = new Date(y, m, d);
  date.setHours(0, 0, 0, 0);
  return date;
};

describe('isSameDate', () => {
  it('returns true for same day', () => {
    const d1 = createDate(2024, 0, 15);
    const d2 = createDate(2024, 0, 15);
    expect(isSameDate(d1, d2)).toBe(true);
  });

  it('returns false for different days', () => {
    const d1 = createDate(2024, 0, 15);
    const d2 = createDate(2024, 0, 16);
    expect(isSameDate(d1, d2)).toBe(false);
  });

  it('returns false when either date is null', () => {
    const d = createDate(2024, 0, 15);
    expect(isSameDate(null, d)).toBe(false);
    expect(isSameDate(d, null)).toBe(false);
    expect(isSameDate(null, null)).toBe(false);
  });
});

describe('isDateInRange', () => {
  it('returns true for date within range', () => {
    const range: DateRangeValue = {
      from: createDate(2024, 0, 10),
      to: createDate(2024, 0, 20),
    };
    expect(isDateInRange(createDate(2024, 0, 15), range)).toBe(true);
  });

  it('returns true for start and end dates (inclusive)', () => {
    const range: DateRangeValue = {
      from: createDate(2024, 0, 10),
      to: createDate(2024, 0, 20),
    };
    expect(isDateInRange(createDate(2024, 0, 10), range)).toBe(true);
    expect(isDateInRange(createDate(2024, 0, 20), range)).toBe(true);
  });

  it('returns false for date outside range', () => {
    const range: DateRangeValue = {
      from: createDate(2024, 0, 10),
      to: createDate(2024, 0, 20),
    };
    expect(isDateInRange(createDate(2024, 0, 5), range)).toBe(false);
    expect(isDateInRange(createDate(2024, 0, 25), range)).toBe(false);
  });

  it('handles reversed from/to order', () => {
    const range: DateRangeValue = {
      from: createDate(2024, 0, 20),
      to: createDate(2024, 0, 10), // reversed
    };
    expect(isDateInRange(createDate(2024, 0, 15), range)).toBe(true);
  });

  it('returns false if from or to is null', () => {
    expect(isDateInRange(createDate(2024, 0, 15), { from: null, to: null })).toBe(false);
    expect(
      isDateInRange(createDate(2024, 0, 15), { from: createDate(2024, 0, 10), to: null }),
    ).toBe(false);
  });
});

describe('isDateDisabled', () => {
  const today = createDate(2024, 5, 15);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(today);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true for custom predicate match', () => {
    const predicate = (d: Date) => d.getDate() === 15;
    expect(
      isDateDisabled(createDate(2024, 5, 15), undefined, undefined, undefined, predicate),
    ).toBe(true);
  });

  it('returns true for date before minDate', () => {
    const min = createDate(2024, 5, 20);
    expect(isDateDisabled(createDate(2024, 5, 10), undefined, min)).toBe(true);
  });

  it('returns true for date after maxDate', () => {
    const max = createDate(2024, 5, 10);
    expect(isDateDisabled(createDate(2024, 5, 20), undefined, undefined, max)).toBe(true);
  });

  it('strategy "none" never disables', () => {
    expect(isDateDisabled(createDate(2020, 0, 1), 'none')).toBe(false);
    expect(isDateDisabled(createDate(2030, 0, 1), 'none')).toBe(false);
  });

  it('strategy "past" disables dates before today', () => {
    expect(isDateDisabled(createDate(2024, 5, 10), 'past')).toBe(true);
    expect(isDateDisabled(createDate(2024, 5, 20), 'past')).toBe(false);
  });

  it('strategy "future" disables dates after today', () => {
    expect(isDateDisabled(createDate(2024, 5, 20), 'future')).toBe(true);
    expect(isDateDisabled(createDate(2024, 5, 10), 'future')).toBe(false);
  });

  it('function strategy delegates to predicate', () => {
    const strategy = (d: Date) => d.getDay() === 0; // Sundays
    expect(isDateDisabled(createDate(2024, 5, 16), strategy)).toBe(true); // Sunday
    expect(isDateDisabled(createDate(2024, 5, 17), strategy)).toBe(false); // Monday
  });
});

describe('getDaysInMonth', () => {
  it('returns 6 weeks for month starting on Saturday', () => {
    // June 2024 starts on Saturday
    const weeks = getDaysInMonth(createDate(2024, 5, 1));
    expect(weeks).toHaveLength(6);
    expect(weeks[0]).toHaveLength(7);
  });

  it('includes outside days by default', () => {
    const weeks = getDaysInMonth(createDate(2024, 5, 1), true);
    // First week should include May dates
    expect(weeks[0][0].getMonth()).toBe(4); // May
  });

  it('excludes outside days when showOutsideDays=false', () => {
    const weeks = getDaysInMonth(createDate(2024, 5, 1), false);
    // All days should be in June
    weeks.flat().forEach((day) => {
      expect(day.getMonth()).toBe(5);
    });
  });

  it('handles February in leap year', () => {
    const weeks = getDaysInMonth(createDate(2024, 1, 1), false); // Feb 2024 (leap)
    const days = weeks.flat().filter((d) => d.getMonth() === 1);
    expect(days).toHaveLength(29);
  });
});

describe('formatDate', () => {
  it('formats valid date with default format', () => {
    const d = createDate(2024, 5, 15);
    expect(formatDate(d)).toBe('Jun 15, 2024');
  });

  it('uses custom format string', () => {
    const d = createDate(2024, 5, 15);
    expect(formatDate(d, 'yyyy-MM-dd')).toBe('2024-06-15');
  });

  it('returns empty string for invalid date', () => {
    expect(formatDate(new Date('invalid'))).toBe('');
  });
});

describe('getDayAriaLabel', () => {
  const date = createDate(2024, 5, 15);

  it('includes base date format', () => {
    const label = getDayAriaLabel(date, {
      isToday: false,
      isDisabled: false,
      isRangeStart: false,
      isRangeEnd: false,
      isInRange: false,
      isSelected: false,
    });
    expect(label).toContain('Saturday, June 15, 2024');
  });

  it('adds "today" when isToday', () => {
    const label = getDayAriaLabel(date, {
      isToday: true,
      isDisabled: false,
      isRangeStart: false,
      isRangeEnd: false,
      isInRange: false,
      isSelected: false,
    });
    expect(label).toContain('today');
  });

  it('adds "unavailable" when disabled', () => {
    const label = getDayAriaLabel(date, {
      isToday: false,
      isDisabled: true,
      isRangeStart: false,
      isRangeEnd: false,
      isInRange: false,
      isSelected: false,
    });
    expect(label).toContain('unavailable');
  });

  it('adds range context flags', () => {
    const label = getDayAriaLabel(date, {
      isToday: false,
      isDisabled: false,
      isRangeStart: true,
      isRangeEnd: false,
      isInRange: true,
      isSelected: true,
    });
    expect(label).toContain('range start');
    expect(label).not.toContain('in range'); // excluded when start/end
  });

  it('uses custom ariaFormat', () => {
    const label = getDayAriaLabel(
      date,
      {
        isToday: false,
        isDisabled: false,
        isRangeStart: false,
        isRangeEnd: false,
        isInRange: false,
        isSelected: false,
      },
      { ariaFormat: 'EEEE' },
    );
    expect(label).toBe('Saturday');
  });
});

describe('clampDate', () => {
  it('returns date when within bounds', () => {
    const d = createDate(2024, 5, 15);
    const min = createDate(2024, 5, 10);
    const max = createDate(2024, 5, 20);
    expect(clampDate(d, min, max)).toEqual(d);
  });

  it('returns minDate when date is before', () => {
    const d = createDate(2024, 5, 5);
    const min = createDate(2024, 5, 10);
    expect(clampDate(d, min)).toEqual(min);
  });

  it('returns maxDate when date is after', () => {
    const d = createDate(2024, 5, 25);
    const max = createDate(2024, 5, 20);
    expect(clampDate(d, undefined, max)).toEqual(max);
  });
});

describe('getWeekdays', () => {
  it('returns 7 weekdays in short format', () => {
    const days = getWeekdays('short');
    expect(days).toHaveLength(7);
    expect(days[0]).toMatch(/^[A-Z][a-z]{2}$/); // e.g., "Sun"
  });

  it('returns long format weekdays', () => {
    const days = getWeekdays('long');
    expect(days[0]).toMatch(/^[A-Z][a-z]+$/); // e.g., "Sunday"
  });

  it('starts with Sunday', () => {
    const days = getWeekdays('short');
    expect(days[0]).toBe('Sun');
  });
});

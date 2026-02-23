import React, { useRef, useEffect } from 'react';
import type { DateRangeValue } from './types';
import { DayCell } from './DayCell';
import {
  getDaysInMonth,
  getWeekdays,
  isSameDate,
  isDateInRange,
  isToday as checkIsToday,
  isDateDisabled,
  isSameMonth,
  isBefore,
  isAfter,
  isRangeStart,
  isRangeEnd,
} from './utils';

export interface CalendarGridProps {
  /** Current month to display */
  currentMonth: Date;
  /** Selected date range */
  value: DateRangeValue;
  /** Hovered date for preview */
  hoveredDate: Date | null;
  /** Currently focused date (keyboard navigation) */
  focusedDate: Date;
  /** Minimum allowed date */
  minDate?: Date;
  /** Maximum allowed date */
  maxDate?: Date;
  /** Disabled date strategy */
  disabledDateStrategy?: 'none' | 'past' | 'future' | ((date: Date) => boolean);
  /** Custom disabled date predicate */
  disabledDates?: (date: Date) => boolean;
  /** Whether to show days from adjacent months */
  showOutsideDays?: boolean;
  /** Weekday format */
  weekdayFormat?: 'long' | 'short' | 'narrow';
  /** Locale for date formatting */
  locale?: string;
  /** Whether keyboard navigation is enabled */
  enableKeyboardNavigation?: boolean;
  /** Callback when date is selected */
  onSelectDate: (date: Date) => void;
  /** Callback when date is hovered */
  onDateHover?: (date: Date | null) => void;
  /** Callback when focused date changes */
  onFocusedDateChange?: (date: Date) => void;
  /** Custom class name */
  className?: string;
  /** Test ID */
  'data-testid'?: string;
}

/**
 * CalendarGrid Component
 *
 * Renders a calendar month as an ARIA grid with full keyboard navigation support.
 * Implements WCAG 2.1 AA compliant grid pattern for screen readers.
 *
 * @param props - Calendar grid properties
 * @returns A fully accessible calendar grid component
 *
 * @internal
 */
export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentMonth,
  value,
  hoveredDate,
  focusedDate,
  minDate,
  maxDate,
  disabledDateStrategy = 'none',
  disabledDates,
  showOutsideDays = true,
  weekdayFormat = 'short',
  enableKeyboardNavigation = true,
  onSelectDate,
  onDateHover,
  onFocusedDateChange,
  className = '',
  'data-testid': dataTestId = 'calendar-grid',
}) => {
  const gridRef = useRef<HTMLTableElement>(null);
  const weeks = getDaysInMonth(currentMonth, showOutsideDays);
  const weekdays = getWeekdays(weekdayFormat);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!enableKeyboardNavigation) return;

    const daysInWeek = 7;
    const totalDays = weeks.flat().length;
    let currentIndex = weeks.flat().findIndex((day) => isSameDate(day, focusedDate));

    if (currentIndex === -1) {
      currentIndex = 0;
    }

    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        newIndex = Math.min(currentIndex + 1, totalDays - 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newIndex = Math.min(currentIndex + daysInWeek, totalDays - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        newIndex = Math.max(currentIndex - daysInWeek, 0);
        break;
      case 'Home':
        e.preventDefault();
        // First day of week
        newIndex = currentIndex - (currentIndex % daysInWeek);
        break;
      case 'End':
        e.preventDefault();
        // Last day of week
        newIndex = currentIndex + (daysInWeek - 1 - (currentIndex % daysInWeek));
        break;
      case 'PageUp':
        e.preventDefault();
        // Previous month (handled by parent)
        break;
      case 'PageDown':
        e.preventDefault();
        // Next month (handled by parent)
        break;
      case 'Enter':
      case ' ': {
        e.preventDefault();
        const selectedDay = weeks.flat()[currentIndex];
        if (selectedDay) {
          onSelectDate(selectedDay);
        }
        break;
      }
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      const newDate = weeks.flat()[newIndex];
      if (newDate) {
        onFocusedDateChange?.(newDate);
      }
    }
  };

  // Auto-focus grid on mount for keyboard navigation
  useEffect(() => {
    if (enableKeyboardNavigation && gridRef.current) {
      // Don't auto-focus on initial mount to avoid stealing focus
      // But ensure tab navigation works
    }
  }, [enableKeyboardNavigation]);

  return (
    <div
      className={`overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700 ${className}`}
      data-testid={dataTestId}
    >
      <table
        ref={gridRef}
        role="grid"
        aria-label="Date selection grid"
        aria-multiselectable="true"
        onKeyDown={handleKeyDown}
        className="w-full border-collapse"
        data-testid="calendar-grid-table"
      >
        <thead>
          <tr>
            {weekdays.map((weekday, index) => (
              <th
                key={index}
                scope="col"
                role="columnheader"
                className="px-1 py-2 text-center text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                aria-label={`Column ${index + 1}, ${weekday}`}
              >
                <span aria-hidden="true">{weekday}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex} role="row">
              {week.map((day, dayIndex) => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isDisabled = isDateDisabled(
                  day,
                  disabledDateStrategy,
                  minDate,
                  maxDate,
                  disabledDates,
                );
                const isToday = checkIsToday(day);
                const inRange = isDateInRange(day, value);
                const rangeStart = isRangeStart(day, value);
                const rangeEnd = isRangeEnd(day, value);

                // Hover preview logic
                const isHovered = hoveredDate ? isSameDate(day, hoveredDate) : false;
                let hoverStart = false;
                let hoverEnd = false;

                if (value.from && hoveredDate && !value.to) {
                  const start = isBefore(value.from, hoveredDate) ? value.from : hoveredDate;
                  const end = isAfter(value.from, hoveredDate) ? value.from : hoveredDate;

                  hoverStart = isSameDate(day, start);
                  hoverEnd = isSameDate(day, end);
                }

                const isFocused = isSameDate(day, focusedDate);
                const isFocusable = !isDisabled && isCurrentMonth;

                return (
                  <DayCell
                    key={`${weekIndex}-${dayIndex}`}
                    date={day}
                    isCurrentMonth={isCurrentMonth}
                    isToday={isToday}
                    isDisabled={isDisabled}
                    isRangeStart={rangeStart}
                    isRangeEnd={rangeEnd}
                    isInRange={inRange}
                    isHovered={isHovered}
                    isHoverStart={hoverStart}
                    isHoverEnd={hoverEnd}
                    isFocused={isFocused}
                    isFocusable={isFocusable}
                    onClick={onSelectDate}
                    onMouseEnter={onDateHover}
                    onMouseLeave={() => onDateHover?.(null)}
                    onFocus={onFocusedDateChange}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

CalendarGrid.displayName = 'CalendarGrid';

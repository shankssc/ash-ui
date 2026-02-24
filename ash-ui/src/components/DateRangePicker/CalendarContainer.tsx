import React, { useCallback } from 'react';
import type { DateRangePickerProps, DateRangeValue } from './types';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { useCalendarMonth, useFocusedDate, useRangeSelection } from './hooks';

export interface CalendarContainerProps extends Pick<
  DateRangePickerProps,
  | 'value'
  | 'onChange'
  | 'initialMonth'
  | 'minDate'
  | 'maxDate'
  | 'disabledDateStrategy'
  | 'disabledDates'
  | 'weekdayFormat'
  | 'showOutsideDays'
  | 'enableKeyboardNavigation'
  | 'size'
  | 'className'
> {
  /** Test ID */
  'data-testid'?: string;
}

/**
 * CalendarContainer Component
 *
 * Container component that orchestrates calendar state, navigation, and selection logic.
 * Composes CalendarHeader and CalendarGrid with full keyboard navigation support.
 *
 * @param props - Calendar container properties
 * @returns Calendar container component
 *
 * @internal
 */
export const CalendarContainer: React.FC<CalendarContainerProps> = ({
  value = { from: null, to: null },
  onChange,
  initialMonth,
  minDate,
  maxDate,
  disabledDateStrategy = 'none',
  disabledDates,
  weekdayFormat = 'short',
  showOutsideDays = true,
  enableKeyboardNavigation = true,
  size = 'md',
  className = '',
  'data-testid': dataTestId = 'calendar-container',
}) => {
  const fallbackMonth = initialMonth || value.from || new Date();

  // Month navigation state
  const { currentMonth, goToPreviousMonth, goToNextMonth, goToToday } =
    useCalendarMonth(fallbackMonth);

  const safeOnChange = useCallback(
    (newValue: DateRangeValue) => {
      if (onChange) {
        onChange(newValue);
      }
    },
    [onChange],
  );

  // Range selection logic
  const { hoveredDate, handleSelectDate, handleDateHover } = useRangeSelection(
    value,
    safeOnChange,
    true, // allow single-date ranges
  );

  // Handle month navigation with keyboard (PageUp/PageDown)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!enableKeyboardNavigation) return;

      if (e.key === 'PageUp') {
        e.preventDefault();
        goToPreviousMonth();
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        goToNextMonth();
      }
    },
    [enableKeyboardNavigation, goToPreviousMonth, goToNextMonth],
  );

  // Handle date focus
  const { focusedDate, setFocusedDate } = useFocusedDate(
    value.from || fallbackMonth,
    minDate,
    maxDate,
  );

  // (Grid handles individual date disabling)
  const disablePrevious = false;
  const disableNext = false;

  return (
    <div
      className={`rounded-lg bg-white shadow-lg dark:bg-neutral-900 ${className}`}
      onKeyDown={handleKeyDown}
      data-testid={dataTestId}
      role="application"
      aria-label="Date range selection calendar"
    >
      {/* Calendar Header */}
      <CalendarHeader
        currentMonth={currentMonth}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
        disablePrevious={disablePrevious}
        disableNext={disableNext}
        size={size}
      />

      {/* Calendar Grid */}
      <div className="p-3">
        <CalendarGrid
          currentMonth={currentMonth}
          value={value}
          hoveredDate={hoveredDate}
          focusedDate={focusedDate}
          minDate={minDate}
          maxDate={maxDate}
          disabledDateStrategy={disabledDateStrategy}
          disabledDates={disabledDates}
          showOutsideDays={showOutsideDays}
          weekdayFormat={weekdayFormat}
          enableKeyboardNavigation={enableKeyboardNavigation}
          onSelectDate={handleSelectDate}
          onDateHover={handleDateHover}
          onFocusedDateChange={setFocusedDate}
        />
      </div>
    </div>
  );
};

CalendarContainer.displayName = 'CalendarContainer';

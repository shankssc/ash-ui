import React from 'react';
import { format } from 'date-fns';
import type { DateRangePickerSize } from './types';

export interface CalendarHeaderProps {
  /** Current month being displayed */
  currentMonth: Date;
  /** Handler for previous month button */
  onPreviousMonth: () => void;
  /** Handler for next month button */
  onNextMonth: () => void;
  /** Handler for today button */
  onToday: () => void;
  /** Whether previous month button should be disabled */
  disablePrevious?: boolean;
  /** Whether next month button should be disabled */
  disableNext?: boolean;
  /** Size variant */
  size?: DateRangePickerSize;
  /** Custom class name */
  className?: string;
  /** Test ID */
  'data-testid'?: string;
}

/**
 * CalendarHeader Component
 *
 * Header section of the calendar with month navigation controls.
 * Provides previous/next month buttons and today button with full accessibility.
 *
 * @param props - Calendar header properties
 * @returns Calendar header component
 *
 * @internal
 */
export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  onToday,
  disablePrevious = false,
  disableNext = false,
  size = 'md',
  className = '',
  'data-testid': dataTestId = 'calendar-header',
}) => {
  // Size configuration
  const sizeClasses = {
    sm: 'px-2 py-1.5 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-2.5 text-lg',
  };

  const monthYear = format(currentMonth, 'MMMM yyyy');

  return (
    <div
      className={`flex items-center justify-between border-b border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800/50 ${className}`}
      data-testid={dataTestId}
    >
      {/* Navigation Controls */}
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={onPreviousMonth}
          disabled={disablePrevious}
          aria-label="Previous month"
          className={`focus:ring-primary-500 rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:hover:bg-neutral-700 dark:hover:text-neutral-200 ${sizeClasses[size]} `}
          data-testid="nav-previous-month"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={onNextMonth}
          disabled={disableNext}
          aria-label="Next month"
          className={`focus:ring-primary-500 rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:hover:bg-neutral-700 dark:hover:text-neutral-200 ${sizeClasses[size]} `}
          data-testid="nav-next-month"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Month and Year Display */}
      <div
        className="text-center font-semibold text-neutral-900 dark:text-neutral-100"
        aria-live="polite"
        aria-label={`Currently viewing ${monthYear}`}
        data-testid={`month-header-${format(currentMonth, 'yyyy-MM')}`}
      >
        {monthYear}
      </div>

      {/* Today Button */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={onToday}
          aria-label="Go to current month"
          className={`focus:ring-primary-500 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 ${size === 'sm' ? 'px-2 py-1 text-xs' : size === 'lg' ? 'px-4 py-2 text-base' : ''} `}
          data-testid="nav-today"
        >
          Today
        </button>
      </div>
    </div>
  );
};

CalendarHeader.displayName = 'CalendarHeader';

import React from 'react';
import type { DayCellContext } from './types';
import { getDayAriaLabel, getDayTestId } from './utils';

export interface DayCellProps extends DayCellContext {
  /** Click handler */
  onClick?: (date: Date) => void;
  /** Mouse enter handler (for hover preview) */
  onMouseEnter?: (date: Date) => void;
  /** Mouse leave handler */
  onMouseLeave?: (date: Date) => void;
  /** Keyboard focus handler */
  onFocus?: (date: Date) => void;
  /** Whether this cell is focusable */
  isFocusable: boolean;
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

/**
 * DayCell Component
 *
 * A single day cell in the calendar grid with full accessibility support.
 * Implements ARIA gridcell pattern with comprehensive keyboard navigation support.
 *
 * @param props - Day cell properties
 * @returns A fully accessible day cell component
 *
 * @internal
 */
export const DayCell: React.FC<DayCellProps> = ({
  date,
  isCurrentMonth,
  isToday,
  isDisabled,
  isRangeStart,
  isRangeEnd,
  isInRange,
  isHovered,
  isHoverStart,
  isHoverEnd,
  isFocused,
  isFocusable,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  className = '',
  style,
}) => {
  // Generate ARIA label
  const ariaLabel = getDayAriaLabel(date, {
    isToday,
    isDisabled,
    isRangeStart,
    isRangeEnd,
    isInRange,
    isSelected: isRangeStart || isRangeEnd,
  });

  // Generate test ID
  const testId = getDayTestId(date, {
    isToday,
    isDisabled,
    isRangeStart,
    isRangeEnd,
    isInRange,
  });

  // Determine visual state classes
  const baseClasses = `
    relative
    w-10 h-10
    sm:w-9 sm:h-9
    flex items-center justify-center
    rounded-full
    text-sm font-medium
    transition-colors duration-150
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    cursor-pointer
    ${className}
  `;

  const stateClasses = [
    // Current month vs outside days
    isCurrentMonth
      ? 'text-neutral-900 dark:text-neutral-100'
      : 'text-neutral-400 dark:text-neutral-500',

    // Today styling
    isToday && 'font-bold',

    // Disabled state
    isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800',

    // Range selection styling
    isRangeStart && 'bg-primary-600 text-white rounded-l-full',
    isRangeEnd && 'bg-primary-600 text-white rounded-r-full',
    isInRange && !isRangeStart && !isRangeEnd && 'bg-primary-100 dark:bg-primary-900/30',

    // Hover preview styling (when selecting range)
    isHoverStart && !isRangeStart && 'bg-primary-500 text-white rounded-l-full',
    isHoverEnd && !isRangeEnd && 'bg-primary-500 text-white rounded-r-full',
    isHovered && !isHoverStart && !isHoverEnd && !isInRange && 'bg-primary-50',

    // Focus styling
    isFocused && 'ring-2 ring-primary-500 ring-offset-2',
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick(date);
    }
  };

  const handleMouseEnter = () => {
    if (!isDisabled && onMouseEnter) {
      onMouseEnter(date);
    }
  };

  const handleMouseLeave = () => {
    if (!isDisabled && onMouseLeave) {
      onMouseLeave(date);
    }
  };

  const handleFocus = () => {
    if (isFocusable && onFocus) {
      onFocus(date);
    }
  };

  return (
    <td
      role="gridcell"
      aria-selected={isRangeStart || isRangeEnd || isInRange ? true : undefined}
      aria-disabled={isDisabled || undefined}
      aria-current={isToday ? 'date' : undefined}
      aria-label={ariaLabel}
      tabIndex={isFocusable ? 0 : -1}
      data-testid={testId}
      className={baseClasses + ' ' + stateClasses}
      style={style}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onKeyDown={(e) => {
        // Allow space/enter to trigger click
        if ((e.key === ' ' || e.key === 'Enter') && !isDisabled) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <time dateTime={date.toISOString().split('T')[0]}>{date.getDate()}</time>

      {/* Visual indicator for today */}
      {isToday && !isRangeStart && !isRangeEnd && (
        <span
          className="absolute inset-0 rounded-full border-2 border-primary-500 dark:border-primary-400"
          aria-hidden="true"
        />
      )}

      {/* Selection indicator dot for range middle days */}
      {isInRange && !isRangeStart && !isRangeEnd && (
        <span className="absolute h-1.5 w-1.5 rounded-full bg-primary-600" aria-hidden="true" />
      )}
    </td>
  );
};

DayCell.displayName = 'DayCell';

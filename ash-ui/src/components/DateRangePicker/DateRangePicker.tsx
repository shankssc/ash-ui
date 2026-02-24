import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { DateRangeValue, DateRangePickerProps } from './types';
import { CalendarContainer } from './CalendarContainer';
import { Modal } from '@/components/Modal/Modal';
import { Button } from '@/components/Button/Button';
import { formatDate } from './utils';
import { isSameDate } from './utils';

/**
 * DateRangePicker Component
 *
 * A fully accessible, responsive date range picker with mobile-optimized modal mode.
 * Implements controlled component pattern with comprehensive keyboard navigation support.
 *
 * @example
 * ```tsx
 * const [range, setRange] = useState<DateRangeValue>({ from: null, to: null });
 *
 * <DateRangePicker
 *   value={range}
 *   onChange={setRange}
 *   minDate={new Date()}
 *   disabledDateStrategy="past"
 * />
 * ```
 *
 * @param props - DateRangePicker component props
 * @returns A fully accessible date range picker component
 *
 * @public
 */
export const DateRangePicker: React.FC<DateRangePickerProps> = ({
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
  variant = 'default',
  size = 'md',
  formatOptions,
  className = '',
  calendarClassName = '',
  'aria-label': ariaLabel = 'Date range picker',
  'aria-describedby': ariaDescribedBy,
  'data-testid': dataTestId = 'date-range-picker',
  disabled = false,
  modalOnMobile = true,
  applyButtonText = 'Apply',
  cancelButtonText = 'Cancel',
}) => {
  // Determine if we're on mobile (modal mode) or desktop (inline mode)
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  // Detect mobile viewport (768px breakpoint = md/tailwind)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Listen for resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Open modal on mobile when input is clicked
  const handleInputClick = () => {
    if (isMobile && modalOnMobile && !disabled) {
      setIsModalOpen(true);
    }
  };

  // Close modal and apply selection
  const handleApply = () => {
    setIsModalOpen(false);
  };

  // Close modal without applying changes
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // Format display value
  const formatDisplayValue = useCallback(
    (range: DateRangeValue): string => {
      if (!range.from && !range.to) return 'Select dates';

      if (range.from && range.to) {
        const fromStr = formatDate(range.from, formatOptions?.displayFormat || 'MMM d, yyyy');
        const toStr = formatDate(range.to, formatOptions?.displayFormat || 'MMM d, yyyy');

        // Single day range
        if (isSameDate(range.from, range.to)) {
          return fromStr;
        }

        return `${fromStr} – ${toStr}`;
      }

      if (range.from) {
        return `${formatDate(range.from, formatOptions?.displayFormat || 'MMM d, yyyy')} –`;
      }

      return 'Select dates';
    },
    [formatOptions],
  );

  // Determine size classes
  const sizeClasses = {
    sm: 'text-sm px-2.5 py-1.5',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-2.5',
  };

  // Determine variant classes
  const variantClasses = {
    default: 'border-neutral-300 focus:ring-primary-500 focus:border-primary-500',
    minimal: 'border-transparent focus:ring-primary-500 focus:border-primary-500',
    compact: 'border-neutral-300 focus:ring-primary-500 focus:border-primary-500',
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      data-testid={dataTestId}
      aria-disabled={disabled || undefined}
    >
      {/* Input Display */}
      <div
        ref={inputRef}
        role="button"
        aria-haspopup="dialog"
        aria-expanded={isMobile && modalOnMobile ? isModalOpen : undefined}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        tabIndex={disabled ? -1 : 0}
        onClick={handleInputClick}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleInputClick();
          }
        }}
        className={`w-full cursor-pointer rounded-md border bg-white text-neutral-900 shadow-sm transition-colors duration-200 dark:bg-neutral-800 dark:text-neutral-100 ${sizeClasses[size]} ${variantClasses[variant]} ${
          disabled
            ? 'cursor-not-allowed bg-neutral-100 opacity-50 dark:bg-neutral-700'
            : 'hover:border-neutral-400 dark:hover:border-neutral-600'
        } `}
        data-testid={disabled ? `${dataTestId}-disabled` : undefined}
      >
        <div className="flex items-center justify-between">
          <span className="truncate">{formatDisplayValue(value)}</span>
          <svg
            className={`h-4 w-4 flex-shrink-0 text-neutral-400 transition-transform duration-200 ${isModalOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Desktop Mode: Inline Calendar */}
      {!isMobile && !disabled && (
        <div className={`mt-2 ${calendarClassName}`} data-testid="date-range-picker-inline">
          <CalendarContainer
            value={value}
            onChange={onChange}
            initialMonth={initialMonth}
            minDate={minDate}
            maxDate={maxDate}
            disabledDateStrategy={disabledDateStrategy}
            disabledDates={disabledDates}
            weekdayFormat={weekdayFormat}
            showOutsideDays={showOutsideDays}
            enableKeyboardNavigation={enableKeyboardNavigation}
            size={size}
          />
        </div>
      )}

      {/* Mobile Mode: Modal Calendar */}
      {isMobile && modalOnMobile && !disabled && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCancel}
          size="full"
          closeOnOverlayClick={true}
          closeOnEsc={true}
          trapFocus={true}
          lockScroll={true}
          data-testid="date-range-picker-modal"
        >
          <Modal.Header>
            <Modal.Title>Select Date Range</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body className="p-0">
            <CalendarContainer
              value={value}
              onChange={onChange}
              initialMonth={initialMonth}
              minDate={minDate}
              maxDate={maxDate}
              disabledDateStrategy={disabledDateStrategy}
              disabledDates={disabledDates}
              weekdayFormat={weekdayFormat}
              showOutsideDays={showOutsideDays}
              enableKeyboardNavigation={enableKeyboardNavigation}
              size={size}
              className="rounded-none border-0 shadow-none"
            />
          </Modal.Body>
          <Modal.Footer className="flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={handleCancel} fullWidth data-testid="modal-cancel">
              {cancelButtonText}
            </Button>
            <Button
              variant="primary"
              onClick={handleApply}
              fullWidth
              disabled={!value.from || !value.to}
              data-testid="modal-apply"
            >
              {applyButtonText}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Loading State (for async data fetching) */}
      {disabled && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-md bg-white/70 dark:bg-neutral-800/70"
          aria-live="polite"
          data-testid={`${dataTestId}-loading`}
        >
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      )}
    </div>
  );
};

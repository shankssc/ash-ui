/**
 * Date Picker Variants
 * @public
 */
export type DateRangePickerVariant = 'default' | 'minimal' | 'compact';

/**
 * Date Picker Size
 * @public
 */
export type DateRangePickerSize = 'sm' | 'md' | 'lg';

/**
 * Disabled Date Strategy
 * @public
 */
export type DisabledDateStrategy =
  | 'none' // No disabled dates
  | 'past' // Disable dates before today
  | 'future' // Disable dates after today
  | ((date: Date) => boolean); // Custom predicate function

/**
 * Date Format Options
 * @public
 */
export interface DateFormatOptions {
  /** Format for input/display (e.g., 'MM/dd/yyyy') */
  displayFormat?: string;
  /** Format for aria-labels (more verbose for screen readers) */
  ariaFormat?: string;
  /** Locale for date formatting (e.g., 'en-US', 'fr-FR') */
  locale?: string;
}

/**
 * Date Range Value
 * @public
 */
export interface DateRangeValue {
  /** Start date of range (inclusive) */
  from: Date | null;
  /** End date of range (inclusive) */
  to: Date | null;
}

/**
 * Day Cell Context (passed to custom renderers)
 * @public
 */
export interface DayCellContext {
  /** The date represented by this cell */
  date: Date;
  /** Whether this date is in the currently displayed month */
  isCurrentMonth: boolean;
  /** Whether this date is today */
  isToday: boolean;
  /** Whether this date is disabled */
  isDisabled: boolean;
  /** Whether this date is the start of the selected range */
  isRangeStart: boolean;
  /** Whether this date is the end of the selected range */
  isRangeEnd: boolean;
  /** Whether this date is within the selected range (but not start/end) */
  isInRange: boolean;
  /** Whether this date is being hovered (preview state) */
  isHovered: boolean;
  /** Whether this date is the start of the hover preview range */
  isHoverStart: boolean;
  /** Whether this date is the end of the hover preview range */
  isHoverEnd: boolean;
  /** Keyboard focus state */
  isFocused: boolean;
}

/**
 * Custom Day Cell Renderer
 * @public
 */
export type DayCellRenderer = (context: DayCellContext) => React.ReactNode;

/**
 * DateRangePicker Props
 * @public
 */
export interface DateRangePickerProps {
  /**
   * Currently selected date range
   * @default { from: null, to: null }
   */
  value?: DateRangeValue;

  /**
   * Callback when date range changes
   * @param value - New date range value
   */
  onChange?: (value: DateRangeValue) => void;

  /**
   * Initial month to display when no value is selected
   */
  initialMonth?: Date;

  /**
   * Minimum allowed date (disables dates before this)
   */
  minDate?: Date;

  /**
   * Maximum allowed date (disables dates after this)
   */
  maxDate?: Date;

  /**
   * Strategy for disabling dates
   * @default 'none'
   */
  disabledDateStrategy?: DisabledDateStrategy;

  /**
   * Custom predicate to disable specific dates
   * Combined with disabledDateStrategy (AND logic)
   */
  disabledDates?: (date: Date) => boolean;

  /**
   * Number of months to display side-by-side
   * @default 1 (MVP: single month only)
   */
  numberOfMonths?: number;

  /**
   * Whether to show weekday headers (Su, Mo, Tu, etc.)
   * @default true
   */
  showWeekdays?: boolean;

  /**
   * Custom weekday format (e.g., 'short' → 'Sun', 'narrow' → 'S')
   * @default 'short'
   */
  weekdayFormat?: 'long' | 'short' | 'narrow';

  /**
   * Whether to enable keyboard navigation
   * @default true
   */
  enableKeyboardNavigation?: boolean;

  /**
   * Whether to show outside days (days from adjacent months)
   * @default true
   */
  showOutsideDays?: boolean;

  /**
   * Custom renderer for day cells
   * Allows complete control over day cell content/styling
   */
  dayCellRenderer?: DayCellRenderer;

  /**
   * Format options for date display
   */
  formatOptions?: DateFormatOptions;

  /**
   * Variant styling
   * @default 'default'
   */
  variant?: DateRangePickerVariant;

  /**
   * Size variant
   * @default 'md'
   */
  size?: DateRangePickerSize;

  /**
   * Custom class name for the root element
   */
  className?: string;

  /**
   * Custom class name for the calendar container
   */
  calendarClassName?: string;

  /**
   * ARIA label for the entire date picker
   */
  'aria-label'?: string;

  /**
   * ARIA describedby ID (references element with description)
   */
  'aria-describedby'?: string;

  /**
   * Test ID for testing purposes
   * @default 'date-range-picker'
   */
  'data-testid'?: string;

  /**
   * Whether to disable the entire picker
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether to show the picker in a modal on mobile devices
   * @default true
   */
  modalOnMobile?: boolean;

  /**
   * Custom label for the "Apply" button in modal mode
   * @default 'Apply'
   */
  applyButtonText?: string;

  /**
   * Custom label for the "Cancel" button in modal mode
   * @default 'Cancel'
   */
  cancelButtonText?: string;
}

/**
 * Internal State (managed by useRangeSelection hook)
 * @internal
 */
export interface RangeSelectionState {
  /** Current focused date (for keyboard navigation) */
  focusedDate: Date;
  /** Hovered date (for preview during mouse movement) */
  hoveredDate: Date | null;
  /** Selection phase: 'idle' | 'selecting-start' | 'selecting-end' */
  selectionPhase: 'idle' | 'selecting-start' | 'selecting-end';
  /** Currently displayed month (for navigation) */
  currentMonth: Date;
}

/**
 * Weekday configuration
 * @internal
 */
export interface WeekdayConfig {
  /** Short name (e.g., 'Sun') */
  short: string;
  /** Long name (e.g., 'Sunday') */
  long: string;
  /** Narrow name (e.g., 'S') */
  narrow: string;
}

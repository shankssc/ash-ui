// ash-ui/src/components/virtualized-table/sub-components/selection-checkbox.tsx
import * as React from 'react';
import { cn } from '@/utils/cn';

export interface SelectionCheckboxProps {
  /** Checkbox checked state */
  checked: boolean;
  /** Checkbox indeterminate state (some but not all selected) */
  indeterminate?: boolean;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
  className?: string;
  /** Test ID */
  'data-testid'?: string;
}

/**
 * SelectionCheckbox - Accessible checkbox for row selection
 *
 * Supports checked, unchecked, and indeterminate states.
 * Implements proper ARIA attributes for screen readers.
 *
 * @example
 * ```tsx
 * <SelectionCheckbox
 *   checked={isSelected}
 *   indeterminate={isPartialSelection}
 *   onChange={handleChange}
 * />
 * ```
 */
export const SelectionCheckbox = (props: SelectionCheckboxProps) => {
  const {
    checked,
    indeterminate = false,
    onChange,
    disabled = false,
    className,
    'data-testid': dataTestId = 'selection-checkbox',
  } = props;

  const inputRef = React.useRef<HTMLInputElement>(null);

  // Set indeterminate state on the input element
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled && onChange) {
        onChange(event);
      }
    },
    [disabled, onChange],
  );

  return (
    <label
      className={cn(
        'inline-flex cursor-pointer items-center justify-center',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          'focus:ring-primary-500 dark:focus:ring-primary-600 h-4 w-4 rounded border-neutral-300 bg-neutral-100 text-primary-600 focus:ring-2 dark:border-neutral-600 dark:bg-neutral-700 dark:ring-offset-neutral-800',
          'transition-colors',
        )}
        data-testid={dataTestId}
        aria-checked={indeterminate ? 'mixed' : checked}
      />
    </label>
  );
};

SelectionCheckbox.displayName = 'SelectionCheckbox';

import * as React from 'react';
import type { RowData, SortState } from '../types';
import { sortData, toggleSortDirection, getAriaSortValue } from '../utils/sort-utils';

export interface UseSortingOptions<T extends RowData> {
  /** Initial sort state */
  initialSortState?: SortState<T>;
  /** Enable sorting */
  sortable?: boolean;
  /** Callback when sort changes */
  onSortChange?: (sortState: SortState<T> | undefined) => void;
}

export interface UseSortingReturn<T extends RowData> {
  /** Sorted data array */
  sortedData: T[];
  /** Current sort state */
  sortState: SortState<T> | undefined;
  /** Get ARIA sort value for a column */
  getAriaSort: (columnId: keyof T) => 'ascending' | 'descending' | 'none' | undefined;
  /** Handle column header click to sort */
  onSort: (columnId: keyof T) => void;
  /** Clear current sort */
  clearSort: () => void;
  /** Check if column is currently sorted */
  isSorted: (columnId: keyof T) => boolean;
}

/**
 * Hook for managing table sorting state and logic
 *
 * @param data - Original data array to sort
 * @param options - Sorting configuration options
 * @returns Sorting state and handlers
 *
 * @example
 * ```tsx
 * const { sortedData, sortState, onSort, getAriaSort } = useSorting(data, {
 *   sortable: true,
 *   onSortChange: (state) => console.log(state)
 * })
 * ```
 */
export function useSorting<T extends RowData>(
  data: T[],
  options: UseSortingOptions<T> = {},
): UseSortingReturn<T> {
  const { initialSortState, sortable = false, onSortChange } = options;

  // Sort state
  const [sortState, setSortState] = React.useState<SortState<T> | undefined>(initialSortState);

  // Sort data when sortState changes
  const sortedData = React.useMemo(() => {
    if (!sortState || !sortable) {
      return data;
    }

    return sortData(data, sortState.columnId, sortState.direction);
  }, [data, sortState, sortable]);

  // Get ARIA sort value for a specific column
  const getAriaSort = React.useCallback(
    (columnId: keyof T): 'ascending' | 'descending' | 'none' | undefined => {
      if (!sortable || !sortState || sortState.columnId !== columnId) {
        return 'none';
      }
      return getAriaSortValue(sortState.direction);
    },
    [sortable, sortState],
  );

  // Handle sort toggle
  const onSort = React.useCallback(
    (columnId: keyof T) => {
      if (!sortable) return;

      setSortState((prev) => {
        // If clicking the same column, toggle direction
        if (prev && prev.columnId === columnId) {
          const newDirection = toggleSortDirection(prev.direction);

          const newState = newDirection ? { columnId, direction: newDirection } : undefined;

          onSortChange?.(newState);
          return newState;
        }

        // New column, start with ascending
        const newState: SortState<T> = { columnId, direction: 'asc' };
        onSortChange?.(newState);
        return newState;
      });
    },
    [sortable, onSortChange],
  );

  // Clear current sort
  const clearSort = React.useCallback(() => {
    setSortState(undefined);
    onSortChange?.(undefined);
  }, [onSortChange]);

  // Check if column is currently sorted
  const isSorted = React.useCallback(
    (columnId: keyof T): boolean => {
      return sortable && sortState?.columnId === columnId && sortState.direction !== undefined;
    },
    [sortable, sortState],
  );

  return {
    sortedData,
    sortState,
    getAriaSort,
    onSort,
    clearSort,
    isSorted,
  };
}

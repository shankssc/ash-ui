import { useState, useCallback } from 'react';
import type { SortState, SortDirection } from './types';

/**
 * Hook to manage table sorting state
 * @param initialSort - Initial sort configuration
 * @param onSortChange - Callback when sort changes
 * @returns Sort state and handlers
 */
export function useSort<T>(
  initialSort?: { key: keyof T; direction: SortDirection },
  onSortChange?: (sort: SortState) => void,
) {
  const [sort, setSort] = useState<SortState>(
    initialSort
      ? { key: String(initialSort.key), direction: initialSort.direction }
      : { key: '', direction: null },
  );

  const handleSort = useCallback(
    (key: string) => {
      setSort((prev) => {
        let newDirection: SortDirection;

        if (prev.key !== key) {
          newDirection = 'asc';
        } else {
          newDirection = prev.direction === 'asc' ? 'desc' : 'asc';
        }

        const newSort = { key, direction: newDirection as SortDirection };
        onSortChange?.(newSort);
        return newSort;
      });
    },
    [onSortChange],
  );

  return {
    sort,
    onSort: handleSort,
    isSorted: (key: string) => sort.key === key && sort.direction !== null,
    getSortDirection: (key: string) => (sort.key === key ? sort.direction : null),
  };
}

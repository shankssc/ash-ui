import type { RowData, SortDirection } from '../types';

/**
 * Compares two values for sorting
 * Handles strings, numbers, dates, and null/undefined
 */
export function compareValues(a: unknown, b: unknown): number {
  // Handle null/undefined
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  // Handle numbers
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  // Handle dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }

  // Handle strings (case-insensitive)
  const aStr = String(a).toLowerCase();
  const bStr = String(b).toLowerCase();

  return aStr.localeCompare(bStr, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Sort data by column
 *
 * @param data - Array of row data to sort
 * @param columnId - The column key to sort by
 * @param direction - Sort direction ('asc' | 'desc')
 * @returns New sorted array (does not mutate original)
 *
 * @example
 * ```ts
 * const sorted = sortData(users, 'name', 'asc')
 * ```
 */
export function sortData<T extends RowData>(
  data: T[],
  columnId: keyof T,
  direction: SortDirection,
): T[] {
  // No sorting needed
  if (!direction || direction === undefined) {
    return [...data];
  }

  return [...data].sort((a, b) => {
    const aValue = a[columnId];
    const bValue = b[columnId];

    const comparison = compareValues(aValue, bValue);

    return direction === 'asc' ? comparison : -comparison;
  });
}

/**
 * Toggle sort direction
 *
 * @param currentDirection - Current sort direction
 * @returns New sort direction (asc → desc → undefined → asc)
 *
 * @example
 * ```ts
 * const next = toggleSortDirection('asc') // returns 'desc'
 * ```
 */
export function toggleSortDirection(currentDirection: SortDirection): SortDirection {
  if (currentDirection === 'asc') return 'desc';
  if (currentDirection === 'desc') return undefined;
  return 'asc';
}

/**
 * Get ARIA sort attribute value
 *
 * @param direction - Sort direction
 * @returns ARIA-compatible sort value for accessibility
 *
 * @example
 * ```ts
 * const ariaSort = getAriaSortValue('asc') // returns 'ascending'
 * ```
 */
export function getAriaSortValue(
  direction: SortDirection,
): 'ascending' | 'descending' | 'none' | undefined {
  if (direction === 'asc') return 'ascending';
  if (direction === 'desc') return 'descending';
  return 'none';
}

/**
 * Check if a column is sortable
 *
 * @param sortable - Column or table sortable flag
 * @param direction - Current sort direction
 * @returns Whether sorting is currently active
 */
export function isSortingActive(sortable: boolean | undefined, direction: SortDirection): boolean {
  return sortable === true && direction !== undefined;
}

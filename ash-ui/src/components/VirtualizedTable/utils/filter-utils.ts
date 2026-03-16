import type { RowData } from '../types';

/**
 * Filter function type for custom filtering
 */
export type FilterFunction<T extends RowData = RowData> = (
  row: T,
  filterValue: unknown,
  columnId: keyof T,
) => boolean;

/**
 * Default text filter (case-insensitive substring match)
 *
 * @param value - Cell value to check
 * @param filterValue - Filter text to match
 * @returns Whether value matches filter
 */
export function defaultTextFilter(value: unknown, filterValue: string): boolean {
  if (value == null) return false;
  return String(value).toLowerCase().includes(filterValue.toLowerCase());
}

/**
 * Default number filter (exact match or range)
 *
 * @param value - Cell value to check
 * @param filterValue - Filter value (number or { min, max })
 * @returns Whether value matches filter
 */
export function defaultNumberFilter(
  value: unknown,
  filterValue: number | { min?: number; max?: number },
): boolean {
  if (typeof value !== 'number') return false;

  if (typeof filterValue === 'number') {
    return value === filterValue;
  }

  const { min, max } = filterValue;
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

/**
 * Filter data by column value
 *
 * @param data - Array of row data to filter
 * @param columnId - The column key to filter by
 * @param filterValue - Value to filter by
 * @param filterFn - Custom filter function (optional)
 * @returns New filtered array (does not mutate original)
 *
 * @example
 * ```ts
 * // Text filter
 * const filtered = filterData(users, 'name', 'john')
 *
 * // Number filter
 * const filtered = filterData(users, 'age', { min: 18, max: 65 })
 *
 * // Custom filter
 * const filtered = filterData(users, 'status', 'active', (row, value) => row.status === value)
 * ```
 */
export function filterData<T extends RowData>(
  data: T[],
  columnId: keyof T,
  filterValue: unknown,
  filterFn?: FilterFunction<T>,
): T[] {
  // No filter value = return all data
  if (filterValue == null || filterValue === '') {
    return [...data];
  }

  return data.filter((row) => {
    const cellValue = row[columnId];

    // Use custom filter if provided
    if (filterFn) {
      return filterFn(row, filterValue, columnId);
    }

    // Auto-detect filter type
    if (typeof filterValue === 'string') {
      return defaultTextFilter(cellValue, filterValue);
    }

    if (typeof filterValue === 'number' || typeof filterValue === 'object') {
      return defaultNumberFilter(cellValue, filterValue as number | { min?: number; max?: number });
    }

    // Default: strict equality
    return cellValue === filterValue;
  });
}

/**
 * Filter data by multiple columns
 *
 * @param data - Array of row data to filter
 * @param filters - Object of columnId -> filterValue pairs
 * @returns New filtered array (does not mutate original)
 *
 * @example
 * ```ts
 * const filtered = filterDataByColumns(users, {
 *   name: 'john',
 *   age: { min: 18 },
 *   status: 'active'
 * })
 * ```
 */
export function filterDataByColumns<T extends RowData>(
  data: T[],
  filters: Partial<Record<keyof T, unknown>>,
): T[] {
  const filterEntries = Object.entries(filters).filter(
    ([, value]) => value != null && value !== '',
  );

  // No active filters
  if (filterEntries.length === 0) {
    return [...data];
  }

  return data.filter((row) => {
    return filterEntries.every(([columnId, filterValue]) => {
      return filterData([row], columnId as keyof T, filterValue).length > 0;
    });
  });
}

/**
 * Check if any filters are active
 *
 * @param filters - Object of columnId -> filterValue pairs
 * @returns Whether any filters have values
 */
export function hasActiveFilters(filters: Record<string, unknown>): boolean {
  return Object.values(filters).some((value) => value != null && value !== '');
}

/**
 * Clear all filters
 *
 * @param filters - Object of columnId -> filterValue pairs
 * @returns New object with all values cleared
 *
 * * @example
 * ```ts
 * const cleared = clearFilters({ name: 'john', age: 30 })
 * // Returns: { name: '', age: '' }
 * ```
 */
export function clearFilters<T extends Record<string, unknown>>(
  filters: T,
): Record<keyof T, string> {
  const cleared = {} as Record<keyof T, string>;

  for (const key in filters) {
    if (Object.prototype.hasOwnProperty.call(filters, key)) {
      cleared[key] = '';
    }
  }
  return cleared;
}

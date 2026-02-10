/**
 * Get cell value from row data using column accessor
 * @param row - Row data object
 * @param accessor - Column accessor (key or function)
 * @returns Cell value
 */
export function getCellValue<T>(
  row: T,
  accessor: keyof T | ((row: T) => React.ReactNode),
): React.ReactNode {
  if (typeof accessor === 'function') {
    return accessor(row);
  }
  return row[accessor] as unknown as React.ReactNode;
}

/**
 * Check if a value is empty (for empty state detection)
 * @param value - Value to check
 * @returns True if value is empty
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Generate a unique ID for components
 * @param prefix - Prefix for the ID
 * @returns Unique ID string
 */
export function generateId(prefix: string = 'datatable'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Format number with commas for large numbers
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Deep equality check for objects/arrays
 * @param a - First value
 * @param b - Second value
 * @returns True if values are deeply equal
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (typeof a !== 'object' || typeof b !== 'object' || a == null || b == null) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (
      !keysB.includes(key) ||
      !deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Create a stable identity for React.memo
 * Prevents unnecessary re-renders of memoized components
 * @param obj - Object to create identity for
 * @returns String identity
 */
export function createStableIdentity(obj: unknown): string {
  try {
    // Handle non-object values safely
    if (typeof obj !== 'object' || obj === null) {
      return String(obj);
    }
    return JSON.stringify(obj, Object.keys(obj).sort());
  } catch {
    return String(obj);
  }
}

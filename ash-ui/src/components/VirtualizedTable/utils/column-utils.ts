import type { RowData, Column } from '../types';

/**
 * Get total width of all columns
 *
 * @param columns - Array of column definitions
 * @param columnWidths - Optional map of custom column widths
 * @returns Total width in pixels
 */
export function getTotalColumnsWidth<T extends RowData>(
  columns: Column<T>[],
  columnWidths?: Record<string, number>,
): number {
  return columns.reduce((total, column) => {
    const width = columnWidths?.[column.id] ?? column.width ?? 150;
    return total + width;
  }, 0);
}

/**
 * Get visible columns (excluding disabled)
 *
 * @param columns - Array of column definitions
 * @returns Filtered array of enabled columns
 */
export function getVisibleColumns<T extends RowData>(columns: Column<T>[]): Column<T>[] {
  return columns.filter((column) => !column.disabled);
}

/**
 * Get sortable columns
 *
 * @param columns - Array of column definitions
 * @returns Filtered array of sortable columns
 */
export function getSortableColumns<T extends RowData>(columns: Column<T>[]): Column<T>[] {
  return columns.filter((column) => column.sortable === true);
}

/**
 * Get resizable columns
 *
 * @param columns - Array of column definitions
 * @returns Filtered array of resizable columns
 */
export function getResizableColumns<T extends RowData>(columns: Column<T>[]): Column<T>[] {
  return columns.filter((column) => column.resizable === true);
}

/**
 * Get pinned columns (left or right)
 *
 * @param columns - Array of column definitions
 * @param pinPosition - Pin position ('left' | 'right')
 * @returns Filtered array of pinned columns
 */
export function getPinnedColumns<T extends RowData>(
  columns: Column<T>[],
  pinPosition: 'left' | 'right',
): Column<T>[] {
  return columns.filter((column) => column.pin === pinPosition);
}

/**
 * Get unpinned columns
 *
 * @param columns - Array of column definitions
 * @returns Filtered array of non-pinned columns
 */
export function getUnpinnedColumns<T extends RowData>(columns: Column<T>[]): Column<T>[] {
  return columns.filter((column) => !column.pin);
}

/**
 * Get column order with pinning applied
 *
 * @param columns - Array of column definitions
 * @param columnPinning - Pinning configuration
 * @returns Columns in correct order (left pinned → unpinned → right pinned)
 *
 * @example
 * ```ts
 * const ordered = getColumnOrderWithPinning(columns, {
 *   left: ['actions'],
 *   right: ['status']
 * })
 * ```
 */
export function getColumnOrderWithPinning<T extends RowData>(
  columns: Column<T>[],
  columnPinning?: { left?: string[]; right?: string[] },
): Column<T>[] {
  if (!columnPinning) {
    return columns;
  }

  const { left = [], right = [] } = columnPinning;

  const leftPinned = columns.filter((col) => left.includes(col.id));
  const rightPinned = columns.filter((col) => right.includes(col.id));
  const unpinned = columns.filter((col) => !left.includes(col.id) && !right.includes(col.id));

  return [...leftPinned, ...unpinned, ...rightPinned];
}

/**
 * Resize column width with min/max constraints
 *
 * @param newWidth - Requested new width
 * @param minWidth - Minimum allowed width
 * @param maxWidth - Maximum allowed width
 * @returns Constrained width value
 *
 * @example
 * ```ts
 * const width = resizeColumnWidth(150, 100, 80, 300) // returns 100
 * const width = resizeColumnWidth(150, 50, 80, 300)  // returns 80 (min)
 * ```
 */
export function resizeColumnWidth(
  newWidth: number,
  minWidth: number = 80,
  maxWidth: number = 500,
): number {
  if (newWidth < minWidth) return minWidth;
  if (newWidth > maxWidth) return maxWidth;
  return newWidth;
}

/**
 * Get column by ID
 *
 * @param columns - Array of column definitions
 * @param columnId - Column ID to find
 * @returns Column or undefined if not found
 */
export function getColumnById<T extends RowData>(
  columns: Column<T>[],
  columnId: string,
): Column<T> | undefined {
  return columns.find((column) => column.id === columnId);
}

/**
 * Validate column definitions
 *
 * @param columns - Array of column definitions to validate
 * @returns Whether all columns are valid
 *
 * @throws Error if validation fails (in development mode)
 */
export function validateColumns<T extends RowData>(columns: Column<T>[]): boolean {
  if (!Array.isArray(columns)) {
    console.error('VirtualizedTable: columns must be an array');
    return false;
  }

  const ids = new Set<string>();
  for (const column of columns) {
    // Check for required fields
    if (!column.id) {
      console.error('VirtualizedTable: column missing required "id" field', column);
      return false;
    }

    // Check for duplicate IDs
    if (ids.has(column.id)) {
      console.error('VirtualizedTable: duplicate column id:', column.id);
      return false;
    }
    ids.add(column.id);

    // Check for cell renderer
    if (typeof column.cell !== 'function') {
      console.error('VirtualizedTable: column "cell" must be a function', column);
      return false;
    }
  }

  return true;
}

/**
 * Get default column width
 *
 * @param column - Column definition
 * @param defaultWidth - Fallback default width
 * @returns Column width or default
 */
export function getColumnWidth<T extends RowData>(
  column: Column<T>,
  defaultWidth: number = 150,
): number {
  return column.width ?? defaultWidth;
}

/**
 * Calculate left offset for pinned columns
 *
 * @param columns - Array of columns (ordered)
 * @param columnId - Target column ID
 * @param columnWidths - Map of column widths
 * @returns Left offset in pixels
 */
export function getPinnedColumnLeftOffset<T extends RowData>(
  columns: Column<T>[],
  columnId: string,
  columnWidths: Record<string, number> = {},
): number | undefined {
  const columnIndex = columns.findIndex((col) => col.id === columnId);
  if (columnIndex === -1) return undefined;

  // Check if column is left-pinned
  const column = columns[columnIndex];
  if (column.pin !== 'left') return undefined;

  // Sum widths of all columns before this one
  let offset = 0;
  for (let i = 0; i < columnIndex; i++) {
    const prevColumn = columns[i];
    if (prevColumn.pin === 'left') {
      offset += columnWidths[prevColumn.id] ?? prevColumn.width ?? 150;
    }
  }

  return offset;
}

/**
 * Calculate right offset for right-pinned columns
 *
 * @param columns - Array of columns (ordered)
 * @param columnId - Target column ID
 * @param columnWidths - Map of column widths
 * @returns Right offset in pixels
 */
export function getPinnedColumnRightOffset<T extends RowData>(
  columns: Column<T>[],
  columnId: string,
  columnWidths: Record<string, number> = {},
): number | undefined {
  const columnIndex = columns.findIndex((col) => col.id === columnId);
  if (columnIndex === -1) return undefined;

  // Check if column is right-pinned
  const column = columns[columnIndex];
  if (column.pin !== 'right') return undefined;

  // Sum widths of all columns after this one
  let offset = 0;
  for (let i = columnIndex + 1; i < columns.length; i++) {
    const nextColumn = columns[i];
    if (nextColumn.pin === 'right') {
      offset += columnWidths[nextColumn.id] ?? nextColumn.width ?? 150;
    }
  }

  return offset;
}

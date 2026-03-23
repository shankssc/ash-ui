// ash-ui/src/components/virtualized-table/sub-components/table-cell.tsx
import * as React from 'react';
import { cn } from '@/utils/cn';
import type { Column, RowData } from '../types';

export interface TableCellProps<T extends RowData> {
  /** Column definition */
  column: Column<T>;
  /** Row data */
  row: T;
  /** Cell value */
  value: T[keyof T];
  /** Cell width in pixels */
  width: number;
  /** Row index */
  rowIndex: number;
  /** Column index */
  colIndex: number;
  /** Custom cell className */
  cellClassName?: string | ((row: T, column: Column<T>, index: number) => string);
}

/**
 * TableCell - Individual cell renderer with proper ARIA
 *
 * Renders cell content using the column's cell renderer function.
 * Implements ARIA gridcell role for accessibility.
 *
 * @example
 * ```tsx
 * <TableCell
 *   column={column}
 *   row={rowData}
 *   value={cellValue}
 *   width={150}
 *   rowIndex={0}
 *   colIndex={0}
 * />
 * ```
 */
export const TableCell = <T extends RowData>(props: TableCellProps<T>) => {
  const { column, row, value, width, rowIndex, colIndex, cellClassName } = props;

  // Compute cell class
  const computedCellClass = React.useMemo(() => {
    if (typeof cellClassName === 'function') {
      return cellClassName(row, column, colIndex);
    }
    return cellClassName;
  }, [cellClassName, row, column, colIndex]);

  return (
    <div
      className={cn(
        'flex-shrink-0 overflow-hidden truncate border-r border-neutral-200 px-4 py-3 text-sm text-neutral-900 last:border-r-0 dark:border-neutral-700 dark:text-neutral-100',
        column.cellClassName,
        computedCellClass,
      )}
      role="gridcell"
      style={{ width }}
      data-testid={`cell-${rowIndex}-${column.id}`}
    >
      {column.cell({
        row,
        value,
        column,
      })}
    </div>
  );
};

TableCell.displayName = 'TableCell';

// ash-ui/src/components/virtualized-table/sub-components/table-row.tsx
import * as React from 'react';
import { cn } from '@/utils/cn';
import type { Column, RowData } from '../types';
import { SelectionCheckbox } from './selection-checkbox';
import { TableCell } from './table-cell';

export interface TableRowProps<T extends RowData> {
  /** Row data */
  row: T;
  /** Row index */
  rowIndex: number;
  /** Column definitions */
  columns: Column<T>[];
  /** Column widths */
  columnWidths: Record<string, number>;
  /** Row height in pixels */
  rowHeight: number;
  /** Vertical offset in pixels */
  offsetY: number;
  /** Check if row is selected */
  isSelected: boolean;
  /** Toggle row selection */
  onToggleSelect: (rowId: string | number, row: T) => void;
  /** Handle row click */
  onRowClick?: (row: T, index: number, event: React.MouseEvent) => void;
  /** Enable row selection */
  selectable?: 'single' | 'multi' | 'none';
  /** Get row ID */
  getRowId?: (row: T, index: number) => string | number;
  /** Custom className */
  className?: string;
  /** Custom row className */
  rowClassName?: string | ((row: T, index: number) => string);
  /** Custom cell className */
  cellClassName?: string | ((row: T, column: Column<T>, index: number) => string);
  /** Is row focused */
  isFocused?: boolean;
  /** Is row hovered */
  isHovered?: boolean;
}

/**
 * TableRow - Virtualized row with selection support
 *
 * Renders a single row with absolute positioning for virtualization.
 * Implements ARIA row role with proper indexing.
 *
 * @example
 * ```tsx
 * <TableRow
 *   row={rowData}
 *   rowIndex={0}
 *   columns={columns}
 *   rowHeight={48}
 *   offsetY={0}
 *   isSelected={false}
 *   onToggleSelect={handleToggleSelect}
 * />
 * ```
 */
export const TableRow = <T extends RowData>(props: TableRowProps<T>) => {
  const {
    row,
    rowIndex,
    columns,
    columnWidths,
    rowHeight,
    offsetY,
    isSelected,
    onToggleSelect,
    onRowClick,
    selectable = 'none',
    getRowId,
    className,
    rowClassName,
    cellClassName,
    isFocused = false,
  } = props;

  // Get row ID
  const rowId = React.useMemo(() => {
    if (getRowId) {
      return getRowId(row, rowIndex);
    }
    return rowIndex;
  }, [row, rowIndex, getRowId]);

  // Handle row click
  const handleClick = React.useCallback(
    (event: React.MouseEvent) => {
      onRowClick?.(row, rowIndex, event);
    },
    [row, rowIndex, onRowClick],
  );

  // Handle checkbox change
  const handleCheckboxChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.stopPropagation();
      onToggleSelect(rowId, row);
    },
    [rowId, row, onToggleSelect],
  );

  // Compute row class
  const computedRowClass = React.useMemo(() => {
    if (typeof rowClassName === 'function') {
      return rowClassName(row, rowIndex);
    }
    return rowClassName;
  }, [rowClassName, row, rowIndex]);

  return (
    <div
      className={cn(
        'absolute left-0 right-0 border-b border-neutral-200 transition-colors dark:border-neutral-700',
        isSelected && 'bg-primary-50 dark:bg-primary-900/20',
        isFocused && 'ring-primary-500 ring-2 ring-inset',
        !isSelected && 'hover:bg-neutral-50 dark:hover:bg-neutral-800',
        className,
        computedRowClass,
      )}
      role="row"
      aria-rowindex={rowIndex + 2} // +2 because header is row 1
      aria-selected={isSelected}
      style={{
        transform: `translateY(${offsetY}px)`,
        height: `${rowHeight}px`,
      }}
      data-testid={`row-${rowIndex}`}
      onClick={handleClick}
      tabIndex={-1}
    >
      <div className="flex h-full">
        {/* Selection checkbox */}
        {selectable !== 'none' && (
          <div
            className={cn(
              'flex w-12 flex-shrink-0 items-center border-r border-neutral-200 px-4 dark:border-neutral-700',
              cellClassName,
            )}
            role="gridcell"
            aria-label="Select row"
          >
            <SelectionCheckbox checked={isSelected} onChange={handleCheckboxChange} />
          </div>
        )}

        {/* Cells */}
        {columns.map((column, colIndex) => {
          const width = columnWidths[column.id] ?? column.width ?? 150;
          const value = row[column.id as keyof T];

          return (
            <TableCell
              key={column.id}
              column={column}
              row={row}
              value={value}
              width={width}
              rowIndex={rowIndex}
              colIndex={colIndex}
              cellClassName={cellClassName}
            />
          );
        })}
      </div>
    </div>
  );
};

TableRow.displayName = 'TableRow';

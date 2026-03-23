// ash-ui/src/components/virtualized-table/sub-components/table-header.tsx
import * as React from 'react';
import { cn } from '@/utils/cn';
import type { Column, SortDirection } from '../types';
import { ResizeHandle } from './resize-handle';
import { SelectionCheckbox } from './selection-checkbox';

export interface TableHeaderProps<T extends Record<string, unknown>> {
  /** Column definitions */
  columns: Column<T>[];
  /** Current sort state */
  sortState: { columnId: keyof T; direction: SortDirection } | undefined;
  /** Get ARIA sort value for a column */
  getAriaSort: (columnId: keyof T) => 'ascending' | 'descending' | 'none' | undefined;
  /** Handle column sort */
  onSort: (columnId: keyof T) => void;
  /** Check if column is sorted */
  isSorted: (columnId: keyof T) => boolean;
  /** Column widths */
  columnWidths: Record<string, number>;
  /** Start column resize */
  onResizeStart: (columnId: string, event: React.MouseEvent) => void;
  /** Enable column resizing */
  resizable?: boolean;
  /** Enable column sorting */
  sortable?: boolean;
  /** Enable row selection */
  selectable?: 'single' | 'multi' | 'none';
  /** Select all rows */
  onSelectAll?: () => void;
  /** Clear selection */
  onClearSelection?: () => void;
  /** Check if all rows selected */
  isAllSelected?: boolean;
  /** Selection count */
  selectionCount?: number;
  /** Total row count */
  totalRows?: number;
  /** Custom className */
  className?: string;
  /** Custom cell className */
  cellClassName?: string;
}

/**
 * TableHeader - Accessible column header row with sorting and resizing
 *
 * Implements ARIA columnheader role with proper sort indicators.
 *
 * @example
 * ```tsx
 * <TableHeader
 *   columns={columns}
 *   sortState={sortState}
 *   onSort={handleSort}
 *   getAriaSort={getAriaSort}
 *   resizable
 *   sortable
 * />
 * ```
 */
export const TableHeader = <T extends Record<string, unknown>>(props: TableHeaderProps<T>) => {
  const {
    columns,
    sortState,
    getAriaSort,
    onSort,
    isSorted,
    columnWidths,
    onResizeStart,
    resizable = false,
    sortable = false,
    selectable = 'none',
    onSelectAll,
    onClearSelection,
    isAllSelected = false,
    selectionCount = 0,
    totalRows = 0,
    className,
    cellClassName,
  } = props;

  const handleHeaderClick = React.useCallback(
    (columnId: keyof T, event: React.MouseEvent) => {
      if (sortable) {
        event.stopPropagation();
        onSort(columnId);
      }
    },
    [sortable, onSort],
  );

  const handleKeyDown = React.useCallback(
    (columnId: keyof T, event: React.KeyboardEvent) => {
      if (sortable && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onSort(columnId);
      }
    },
    [sortable, onSort],
  );

  return (
    <div
      className={cn(
        'sticky top-0 z-10 flex border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800',
        className,
      )}
      role="row"
      aria-rowindex={1}
    >
      {/* Selection checkbox column */}
      {selectable !== 'none' && (
        <div
          className={cn(
            'w-12 flex-shrink-0 border-r border-neutral-200 px-4 py-3 dark:border-neutral-700',
            cellClassName,
          )}
          role="columnheader"
          aria-label="Select rows"
        >
          <SelectionCheckbox
            checked={isAllSelected}
            indeterminate={selectionCount > 0 && selectionCount < totalRows}
            onChange={isAllSelected ? onClearSelection : onSelectAll}
            disabled={totalRows === 0}
          />
        </div>
      )}

      {/* Column headers */}
      {columns.map((column) => {
        const width = columnWidths[column.id] ?? column.width ?? 150;
        const ariaSort = getAriaSort(column.id);
        const sorted = isSorted(column.id);

        return (
          <div
            key={column.id}
            className={cn(
              'flex-shrink-0 border-r border-neutral-200 px-4 py-3 text-left text-sm font-semibold text-neutral-700 last:border-r-0 dark:border-neutral-700 dark:text-neutral-300',
              sortable &&
                column.sortable &&
                'cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700',
              cellClassName,
              column.headerClassName,
            )}
            role="columnheader"
            aria-sort={ariaSort}
            aria-label={
              column.ariaLabel || (typeof column.header === 'string' ? column.header : column.id)
            }
            style={{ width }}
            onClick={(e) => handleHeaderClick(column.id, e)}
            onKeyDown={(e) => handleKeyDown(column.id, e)}
            tabIndex={sortable && column.sortable ? 0 : -1}
          >
            <div className="flex items-center justify-between">
              {/* Header content */}
              <span className="flex-1 truncate">
                {typeof column.header === 'string' ? column.header : column.header({ column })}
              </span>

              {/* Sort indicator */}
              {sortable && column.sortable && (
                <span
                  className={cn(
                    'ml-2 flex-shrink-0 text-neutral-400',
                    sorted && 'text-primary-600 dark:text-primary-400',
                  )}
                  aria-hidden="true"
                >
                  {sorted && sortState?.direction === 'asc' ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  ) : sorted && sortState?.direction === 'desc' ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  )}
                </span>
              )}
            </div>

            {/* Resize handle */}
            {resizable && column.resizable && (
              <ResizeHandle columnId={column.id} onResizeStart={onResizeStart} />
            )}
          </div>
        );
      })}
    </div>
  );
};

TableHeader.displayName = 'TableHeader';

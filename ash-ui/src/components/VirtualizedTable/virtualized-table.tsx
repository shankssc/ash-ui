// ash-ui/src/components/virtualized-table/virtualized-table.tsx
import React, { useEffect, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/utils/cn';
import type { VirtualizedTableProps, RowData } from './types';
import { useVirtualizedTable } from './hooks/use-virtualized-table';
import { TableHeader } from './sub-components/table-header';
import { TableRow } from './sub-components/table-row';
import { validateColumns, getTotalColumnsWidth } from './utils/column-utils';

/**
 * VirtualizedTable - High-performance table with virtual scrolling
 *
 * Supports 100k+ rows with efficient rendering, sorting, selection, and accessibility.
 * Implements ARIA Grid pattern for screen reader compatibility.
 *
 * @example
 * ```tsx
 * <VirtualizedTable
 *   data={users}
 *   columns={userColumns}
 *   height={600}
 *   rowHeight={48}
 *   sortable
 *   selectable="multi"
 *   resizable
 * />
 * ```
 */
export const VirtualizedTable = <T extends RowData>(props: VirtualizedTableProps<T>) => {
  const {
    columns,
    height,
    rowHeight = 48,
    estimatedRowHeight,
    overscan = 5,
    className,
    tableClassName,
    headerClassName,
    rowClassName,
    cellClassName,
    'aria-label': ariaLabel = 'Data table',
    'data-testid': dataTestId = 'virtualized-table',
    loading = false,
    disabled = false,
    emptyState = 'No data available',
    style,
    sortable = false,
    selectable = 'none',
    resizable = false,
    getRowId,
  } = props;

  // Validate columns in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      validateColumns(columns);
    }
  }, [columns]);

  // Core table state (sorting, selection, resizing)
  const {
    processedData,
    sortState,
    onSort,
    getAriaSort,
    isSelected,
    onToggleSelect,
    onSelectAll,
    onClearSelection,
    onRowClick: handleRowClick,
    columnWidths,
    startResize,
    orderedColumns,
    isSorted,
    selectionCount,
    isAllSelected,
  } = useVirtualizedTable(props);

  // Virtualization setup
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: processedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedRowHeight ?? rowHeight,
    overscan,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  // Calculate total table width
  const totalWidth = useMemo(() => {
    return getTotalColumnsWidth(orderedColumns, columnWidths);
  }, [orderedColumns, columnWidths]);

  const headerCellClassName = useMemo(() => {
    if (typeof cellClassName === 'string') {
      return cellClassName;
    }
    return undefined;
  }, [cellClassName]);

  const handleTableRowClick = React.useCallback(
    (row: T, rowIndex: number, event: React.MouseEvent) => {
      const rowId = getRowId ? getRowId(row, rowIndex) : rowIndex;
      // Call the hook's onRowClick with adapted signature
      handleRowClick(rowId, row, event);
    },
    [getRowId, handleRowClick],
  );

  // Loading state overlay
  if (loading) {
    return (
      <div
        className={cn(
          'relative flex items-center justify-center rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900',
          className,
        )}
        style={{ height, ...style }}
        data-testid={`${dataTestId}-loading`}
        role="status"
        aria-label="Loading data"
        aria-busy="true"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (processedData.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400',
          className,
        )}
        style={{ height, ...style }}
        data-testid={`${dataTestId}-empty`}
        role="status"
        aria-label="No data available"
      >
        <div className="flex flex-col items-center gap-2">
          <svg
            className="h-12 w-12 text-neutral-300 dark:text-neutral-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-sm">{emptyState}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={cn(
        'relative overflow-auto rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
      style={{ height, ...style }}
      data-testid={dataTestId}
      role="grid"
      aria-label={ariaLabel}
      aria-rowcount={processedData.length + 1} // +1 for header
      tabIndex={0}
    >
      {/* Table container with full width */}
      <div
        className={cn('relative', tableClassName)}
        style={{
          height: `${totalSize + rowHeight}px`, // +rowHeight for header
          width: totalWidth,
          minWidth: '100%',
        }}
        role="rowgroup"
      >
        {/* Table Header */}
        <TableHeader
          columns={orderedColumns}
          sortState={sortState}
          getAriaSort={getAriaSort}
          onSort={onSort}
          isSorted={isSorted}
          columnWidths={columnWidths}
          onResizeStart={startResize}
          resizable={resizable}
          sortable={sortable}
          selectable={selectable}
          onSelectAll={onSelectAll}
          onClearSelection={onClearSelection}
          isAllSelected={isAllSelected}
          selectionCount={selectionCount}
          totalRows={processedData.length}
          className={headerClassName}
          cellClassName={headerCellClassName}
        />

        {/* Virtualized Rows */}
        {virtualRows.map((virtualRow) => {
          const row = processedData[virtualRow.index];
          const rowIndex = virtualRow.index;

          return (
            <TableRow
              key={virtualRow.key}
              row={row}
              rowIndex={rowIndex}
              columns={orderedColumns}
              columnWidths={columnWidths}
              rowHeight={rowHeight}
              offsetY={virtualRow.start}
              isSelected={isSelected(getRowId ? getRowId(row, rowIndex) : rowIndex)}
              onToggleSelect={onToggleSelect}
              onRowClick={handleTableRowClick}
              selectable={selectable}
              getRowId={getRowId}
              rowClassName={rowClassName}
              cellClassName={cellClassName}
            />
          );
        })}
      </div>

      {/* Selection summary (for multi-select) */}
      {selectable === 'multi' && selectionCount > 0 && (
        <div
          className="sticky bottom-0 left-0 right-0 border-t border-primary-200 bg-primary-50 px-4 py-2 text-sm text-primary-700 dark:border-primary-800 dark:bg-primary-900/20 dark:text-primary-300"
          role="status"
          aria-live="polite"
          aria-label={`${selectionCount} rows selected`}
        >
          <span className="font-medium">{selectionCount}</span> row{selectionCount !== 1 ? 's' : ''}{' '}
          selected
        </div>
      )}
    </div>
  );
};

VirtualizedTable.displayName = 'VirtualizedTable';

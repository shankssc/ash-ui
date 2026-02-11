import { useMemo, useEffect } from 'react';
import type { DataTableProps, ColumnDef, DataTableInstance } from './types';
import { useSort, usePagination, useRowSelection, useProcessedData } from './hooks';
import { getCellValue } from './utils';

/**
 * DataTable Component
 *
 * A highly customizable, accessible data table component with sorting,
 * pagination, row selection, and loading states.
 *
 * * @note Header and cell render functions receive a MINIMAL table context
 * containing only `sort` and `onSort` properties. Other DataTableInstance
 * properties (rows, columns, pagination, selection) are intentionally
 * unavailable in render functions for performance reasons.
 *
 * This prevents performance anti-patterns where render functions would
 * access full table state on every cell render. For advanced use cases:
 * - Use parent component state
 * - Create a custom wrapper component
 * - Access full state via closure in column definitions
 *
 * @example
 * ```tsx
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 *   role: string;
 * }
 *
 * const columns: ColumnDef<User>[] = [
 *   { id: 'name', header: 'Name', cell: 'name', sortable: true },
 *   { id: 'email', header: 'Email', cell: 'email', sortable: true },
 *   { id: 'role', header: 'Role', cell: 'role' },
 * ];
 *
 * const data: User[] = [
 *   { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
 *   // ... more data
 * ];
 *
 * <DataTable
 *   data={data}
 *   columns={columns}
 *   pagination={{
 *     page: 1,
 *     pageSize: 10,
 *     total: data.length,
 *     onPageChange: setPage,
 *     onPageSizeChange: setPageSize,
 *   }}
 *   enableSelection={true}
 *   onSelectionChange={handleSelectionChange}
 * />
 * ```
 *
 * @param props - DataTable component props
 * @returns A fully featured, accessible data table component
 *
 * @public
 */
export const DataTable = <T extends object>({
  data,
  columns,
  loading = false,
  emptyState = 'No data available',
  skeletonRows = 5,
  pagination: externalPagination,
  initialSort,
  onSortChange,
  enableSelection = false,
  onSelectionChange,
  getRowKey,
  className = '',
  containerClassName = '',
  'data-testid': dataTestId = 'data-table',
}: DataTableProps<T>) => {
  // ===== STATE MANAGEMENT =====

  // Sorting state
  const { sort, onSort, isSorted, getSortDirection } = useSort(initialSort, onSortChange);

  // Pagination state (controlled or uncontrolled)
  const pagination = usePagination(externalPagination);

  // Row selection state
  const { selectedRowKeys, toggleRow, toggleAllRows, clearSelection, isRowSelected } =
    useRowSelection<T>(enableSelection, getRowKey);

  const tableContext = useMemo(() => {
    const context: DataTableInstance<T> = {
      rows: [] as T[],
      columns: [] as ColumnDef<T>[],
      sort,
      pagination: undefined,
      selection: undefined,
      onSort,
    };
    return context;
  }, [sort, onSort]);

  // Process data (sort + paginate)
  const { rows, isEmpty: isDataEmpty } = useProcessedData<T>(
    data,
    sort,
    externalPagination ? { page: pagination.page, pageSize: pagination.pageSize } : undefined,
    getRowKey,
  );

  // ===== SELECTION EFFECTS =====

  // Notify parent when selection changes
  useEffect(() => {
    if (!enableSelection || !onSelectionChange) return;

    // Map selected keys back to actual row objects
    const selectedRows = data.filter((row, index) => {
      const key = getRowKey ? getRowKey(row, index) : index;
      return selectedRowKeys.has(key);
    });

    onSelectionChange(selectedRows);
  }, [selectedRowKeys, enableSelection, onSelectionChange, data, getRowKey]);

  // Clear selection when page changes (for per-page selection)
  useEffect(() => {
    if (enableSelection && externalPagination) {
      clearSelection();
    }
  }, [pagination.page, enableSelection, clearSelection, externalPagination]);

  // ===== HELPER FUNCTIONS =====

  // Get visible columns (filter out hidden columns)
  const visibleColumns = useMemo(() => columns.filter((col) => !col.hidden), [columns]);

  // Check if all rows on current page are selected
  const allRowsSelected = useMemo(() => {
    if (!enableSelection || rows.length === 0) return false;
    return rows.every((rowWithKey) => isRowSelected(rowWithKey.row, rowWithKey.key as number));
  }, [enableSelection, rows, isRowSelected]);

  // Handle select all toggle
  const handleSelectAll = () => {
    if (!enableSelection) return;
    toggleAllRows(
      rows.map((r) => r.row),
      !allRowsSelected,
    );
  };

  // Render header cell
  const renderHeader = (column: ColumnDef<T>) => {
    if (typeof column.header === 'function') {
      return column.header({ table: tableContext });
    }
    return column.header;
  };

  // Render cell content
  const renderCell = (column: ColumnDef<T>, row: T) => {
    if (typeof column.cell === 'function') {
      return column.cell({ row, table: tableContext });
    }
    return getCellValue(row, column.cell);
  };

  // Get sort indicator icon
  const getSortIndicator = (columnId: string) => {
    const direction = getSortDirection(columnId);
    if (!direction) return null;

    return (
      <span className="ml-1 inline-block h-4 w-4 align-middle">
        {direction === 'asc' ? (
          <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </span>
    );
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div
        className={`overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700 ${containerClassName}`}
        data-testid={`${dataTestId}-loading`}
      >
        <table className={`min-w-full ${className}`}>
          <thead>
            <tr className="bg-neutral-50 dark:bg-neutral-800/50">
              {enableSelection && (
                <th className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
                  <div className="h-5 w-5 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                </th>
              )}
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  className={`border-b border-neutral-200 px-4 py-3 dark:border-neutral-700 ${column.headerClassName || ''}`}
                >
                  <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: skeletonRows }).map((_, index) => (
              <tr key={index} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                {enableSelection && (
                  <td className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
                    <div className="h-5 w-5 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                  </td>
                )}
                {visibleColumns.map((column) => (
                  <td
                    key={`${index}-${column.id}`}
                    className={`border-b border-neutral-200 px-4 py-3 dark:border-neutral-700 ${column.cellClassName || ''}`}
                  >
                    <div className="h-4 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ===== EMPTY STATE =====
  if (isDataEmpty) {
    return (
      <div
        className={`rounded-lg border-2 border-dashed border-neutral-200 p-12 text-center dark:border-neutral-700 ${containerClassName}`}
        data-testid={`${dataTestId}-empty`}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
          <svg
            className="h-6 w-6 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p className="mt-4 text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {typeof emptyState === 'string' ? emptyState : emptyState}
        </p>
      </div>
    );
  }

  // ===== MAIN TABLE RENDER =====
  return (
    <div
      className={`overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700 ${containerClassName}`}
      data-testid={dataTestId}
    >
      <div className="overflow-x-auto">
        <table className={`min-w-full ${className}`}>
          <thead>
            <tr className="bg-neutral-50 dark:bg-neutral-800/50">
              {/* Selection Column */}
              {enableSelection && (
                <th className="w-12 border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
                  <input
                    type="checkbox"
                    checked={allRowsSelected}
                    onChange={handleSelectAll}
                    className="focus:ring-primary-500 h-4 w-4 rounded border-neutral-300 text-primary-600"
                    aria-label="Select all rows"
                  />
                </th>
              )}

              {/* Data Columns */}
              {visibleColumns.map((column) => {
                const isColumnSorted = isSorted(column.id);
                const sortDir = getSortDirection(column.id);

                return (
                  <th
                    key={column.id}
                    className={`border-b border-neutral-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:border-neutral-700 dark:text-neutral-400 ${column.headerClassName || ''} ${column.sortable ? 'cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800' : ''} ${isColumnSorted ? 'bg-neutral-100 dark:bg-neutral-800' : ''} `}
                    onClick={column.sortable ? () => onSort(column.id) : undefined}
                    aria-sort={
                      isColumnSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined
                    }
                    aria-sortable={column.sortable ? 'true' : undefined}
                  >
                    <div className="flex items-center">
                      {renderHeader(column)}
                      {column.sortable && getSortIndicator(column.id)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white dark:divide-neutral-800 dark:bg-neutral-900">
            {rows.map((rowWithKey) => {
              const isSelected = enableSelection
                ? isRowSelected(rowWithKey.row, rowWithKey.key as number)
                : false;

              return (
                <tr
                  key={rowWithKey.key}
                  className={`transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''} `}
                  aria-selected={isSelected || undefined}
                >
                  {/* Selection Cell */}
                  {enableSelection && (
                    <td className="w-12 border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) =>
                          toggleRow(rowWithKey.row, rowWithKey.key as number, e.target.checked)
                        }
                        className="focus:ring-primary-500 h-4 w-4 rounded border-neutral-300 text-primary-600"
                        aria-label={`Select row ${rowWithKey.key}`}
                      />
                    </td>
                  )}

                  {/* Data Cells */}
                  {visibleColumns.map((column) => (
                    <td
                      key={`${rowWithKey.key}-${column.id}`}
                      className={`border-b border-neutral-200 px-4 py-3 text-sm text-neutral-900 dark:border-neutral-700 dark:text-neutral-100 ${column.cellClassName || ''} `}
                    >
                      {renderCell(column, rowWithKey.row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION FOOTER */}
      {externalPagination && (
        <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800/50">
          <div className="text-sm text-neutral-700 dark:text-neutral-300">
            Showing <span className="font-medium">{pagination.startIndex}</span> to{' '}
            <span className="font-medium">{pagination.endIndex}</span> of{' '}
            <span className="font-medium">{pagination.total}</span> entries
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={pagination.prevPage}
              disabled={!pagination.canPrevPage}
              className={`focus:ring-primary-500 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700`}
              aria-label="Previous page"
            >
              Previous
            </button>

            <div className="text-sm text-neutral-700 dark:text-neutral-300">
              Page <span className="font-medium">{pagination.page}</span> of{' '}
              <span className="font-medium">{pagination.totalPages}</span>
            </div>

            <button
              onClick={pagination.nextPage}
              disabled={!pagination.canNextPage}
              className={`focus:ring-primary-500 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700`}
              aria-label="Next page"
            >
              Next
            </button>

            <select
              value={pagination.pageSize}
              onChange={(e) => pagination.setPageSize(Number(e.target.value))}
              className={`focus:ring-primary-500 ml-2 block rounded-md border-neutral-300 bg-white py-1.5 pl-3 pr-10 text-base text-neutral-900 focus:border-primary-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100`}
              aria-label="Items per page"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

DataTable.displayName = 'DataTable';

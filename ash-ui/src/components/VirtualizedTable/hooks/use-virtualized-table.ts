// ash-ui/src/components/virtualized-table/hooks/use-virtualized-table.ts
import React from 'react';
import type { RowData, VirtualizedTableProps, SortState, Column } from '../types';
import { useSorting } from './use-sorting';
import { useSelection } from './use-selection';
import { useResizableColumns } from './use-resizable-columns';
import { getColumnOrderWithPinning } from '../utils/column-utils';

export interface UseVirtualizedTableReturn<T extends RowData> {
  /** Processed data (sorted, filtered) */
  processedData: T[];
  /** Current sort state */
  sortState: SortState<T> | undefined;
  /** Sort handler */
  onSort: (columnId: keyof T) => void;
  /** Get ARIA sort value */
  getAriaSort: (columnId: keyof T) => 'ascending' | 'descending' | 'none' | undefined;
  /** Selected rows */
  selectedRows: T[];
  /** Check if row is selected */
  isSelected: (rowId: string | number) => boolean;
  /** Toggle row selection */
  onToggleSelect: (rowId: string | number, row: T) => void;
  /** Select all rows */
  onSelectAll: () => void;
  /** Clear selection */
  onClearSelection: () => void;
  /** Row click handler */
  onRowClick: (rowId: string | number, row: T, event: React.MouseEvent) => void;
  /** Column widths */
  columnWidths: Record<string, number>;
  /** Start column resize */
  startResize: (columnId: string, event: React.MouseEvent) => void;
  /** Get column width */
  getColumnWidth: (columnId: string) => number;
  /** Ordered columns (with pinning applied) */
  orderedColumns: Column<T>[];
  /** Check if column is sorted */
  isSorted: (columnId: keyof T) => boolean;
  /** Selection count */
  selectionCount: number;
  /** Check if all selected */
  isAllSelected: boolean;
}

/**
 * Core hook that orchestrates all table state and logic
 *
 * Combines sorting, selection, filtering, and column management into a single interface.
 *
 * @param props - Table props from VirtualizedTable component
 * @returns Unified table state and handlers
 *
 * @example
 * ```tsx
 * const {
 *   processedData,
 *   sortState,
 *   onSort,
 *   selectedRows,
 *   onToggleSelect,
 *   columnWidths,
 *   orderedColumns
 * } = useVirtualizedTable(props)
 * ```
 */
export function useVirtualizedTable<T extends RowData>(
  props: VirtualizedTableProps<T>,
): UseVirtualizedTableReturn<T> {
  const {
    data,
    columns,
    sortable,
    selectable,
    resizable,
    columnPinning,
    onSortChange,
    onSelectionChange,
    onColumnResize,
    getRowId,
  } = props;

  // Sorting hook
  const {
    sortedData,
    sortState,
    getAriaSort,
    onSort,
    isSorted,
    // clearSort - removed (not used)
  } = useSorting(data, {
    sortable,
    onSortChange,
  });

  // Selection hook (operates on sorted data)
  const {
    // selectedIds - removed (not used)
    selectedRows,
    isSelected,
    onToggleSelect,
    onSelectAll,
    onClearSelection,
    onRowClick,
    selectionCount,
    isAllSelected,
  } = useSelection(sortedData, {
    selectable,
    getRowId,
    onSelectionChange,
  });

  // Resizable columns hook
  const {
    columnWidths,
    startResize,
    getColumnWidth: getColumnWidthFromHook,
  } = useResizableColumns(columns, {
    resizable,
    onColumnResize,
  });

  // Get column width helper
  const getColumnWidth = React.useCallback(
    (columnId: string): number => {
      const column = columns.find((col) => col.id === columnId);
      return column ? getColumnWidthFromHook(column) : 150;
    },
    [columns, getColumnWidthFromHook],
  );

  // Apply column pinning order
  const orderedColumns = React.useMemo(() => {
    return getColumnOrderWithPinning(columns, columnPinning);
  }, [columns, columnPinning]);

  // Apply filtering (after sorting)
  const processedData = React.useMemo(() => {
    // Note: Add filter state management if you implement filtering
    // For now, return sorted data
    return sortedData;
  }, [sortedData]);

  return {
    processedData,
    sortState,
    onSort,
    getAriaSort,
    selectedRows,
    isSelected,
    onToggleSelect,
    onSelectAll,
    onClearSelection,
    onRowClick,
    columnWidths,
    startResize,
    getColumnWidth,
    orderedColumns,
    isSorted,
    selectionCount,
    isAllSelected,
  };
}

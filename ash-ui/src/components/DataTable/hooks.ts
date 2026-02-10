import { useState, useCallback, useMemo } from 'react';
import type { SortState, SortDirection } from './types';

/**
 * Hook to manage table sorting state
 * @param initialSort - Initial sort configuration
 * @param onSortChange - Callback when sort changes
 * @returns Sort state and handlers
 */
export function useSort<T>(
  initialSort?: { key: keyof T; direction: SortDirection },
  onSortChange?: (sort: SortState) => void,
) {
  const [sort, setSort] = useState<SortState>(
    initialSort
      ? { key: String(initialSort.key), direction: initialSort.direction }
      : { key: '', direction: null },
  );

  const handleSort = useCallback(
    (key: string) => {
      setSort((prev) => {
        let newDirection: SortDirection;

        if (prev.key !== key) {
          newDirection = 'asc';
        } else {
          newDirection = prev.direction === 'asc' ? 'desc' : 'asc';
        }

        const newSort = { key, direction: newDirection as SortDirection };
        onSortChange?.(newSort);
        return newSort;
      });
    },
    [onSortChange],
  );

  return {
    sort,
    onSort: handleSort,
    isSorted: (key: string) => sort.key === key && sort.direction !== null,
    getSortDirection: (key: string) => (sort.key === key ? sort.direction : null),
  };
}

/**
 * Hook to manage table pagination state
 * @param config - Pagination configuration
 * @returns Pagination state and handlers
 */
export function usePagination(config?: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const [localPage, setLocalPage] = useState(1);
  const [localPageSize, setLocalPageSize] = useState(10);

  // Use external config if provided, otherwise use local state
  const page = config?.page ?? localPage;
  const pageSize = config?.pageSize ?? localPageSize;
  const total = config?.total ?? 0;

  const totalPages = useMemo(() => Math.ceil(total / pageSize), [total, pageSize]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      const clampedPage = Math.max(1, Math.min(newPage, totalPages));
      if (config) {
        config.onPageChange(clampedPage);
      } else {
        setLocalPage(clampedPage);
      }
    },
    [config, totalPages],
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      if (config) {
        config.onPageSizeChange(newSize);
        // Reset to first page when page size changes
        config.onPageChange(1);
      } else {
        setLocalPageSize(newSize);
        setLocalPage(1);
      }
    },
    [config],
  );

  const handleNextPage = useCallback(() => {
    if (page < totalPages) handlePageChange(page + 1);
  }, [page, totalPages, handlePageChange]);

  const handlePrevPage = useCallback(() => {
    if (page > 1) handlePageChange(page - 1);
  }, [page, handlePageChange]);

  return {
    page,
    pageSize,
    total,
    totalPages,
    setPage: handlePageChange,
    setPageSize: handlePageSizeChange,
    nextPage: handleNextPage,
    prevPage: handlePrevPage,
    canNextPage: page < totalPages,
    canPrevPage: page > 1,
    startIndex: (page - 1) * pageSize + 1,
    endIndex: Math.min(page * pageSize, total),
  };
}

/**
 * Hook to manage row selection state
 * @param enableSelection - Whether selection is enabled
 * @param onSelectionChange - Callback when selection changes
 * @param getRowKey - Function to get unique row key
 * @returns Selection state and handlers
 */
export function useRowSelection<T>(
  enableSelection: boolean,
  getRowKey?: (row: T, index: number) => string | number,
) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string | number>>(new Set());

  const toggleRow = useCallback(
    (row: T, index: number, isSelected?: boolean) => {
      if (!enableSelection) return;

      const key = getRowKey ? getRowKey(row, index) : index;
      const newSelection = new Set(selectedRowKeys);

      if (isSelected === undefined) {
        // Toggle selection
        if (newSelection.has(key)) {
          newSelection.delete(key);
        } else {
          newSelection.add(key);
        }
      } else if (isSelected) {
        // Force select
        newSelection.add(key);
      } else {
        // Force deselect
        newSelection.delete(key);
      }

      setSelectedRowKeys(newSelection);
      return newSelection;
    },
    [enableSelection, getRowKey, selectedRowKeys],
  );

  const toggleAllRows = useCallback(
    (rows: T[], isSelected: boolean) => {
      if (!enableSelection) return;

      const newSelection = new Set<string | number>();
      if (isSelected) {
        rows.forEach((row, index) => {
          const key = getRowKey ? getRowKey(row, index) : index;
          newSelection.add(key);
        });
      }

      setSelectedRowKeys(newSelection);
      return newSelection;
    },
    [enableSelection, getRowKey],
  );

  const clearSelection = useCallback(() => {
    setSelectedRowKeys(new Set());
  }, []);

  const isRowSelected = useCallback(
    (row: T, index: number) => {
      if (!enableSelection) return false;
      const key = getRowKey ? getRowKey(row, index) : index;
      return selectedRowKeys.has(key);
    },
    [enableSelection, getRowKey, selectedRowKeys],
  );

  return {
    selectedRowKeys,
    toggleRow,
    toggleAllRows,
    clearSelection,
    isRowSelected,
  };
}

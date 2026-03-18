// ash-ui/src/components/virtualized-table/hooks/use-selection.ts
import * as React from 'react';
import type { RowData, SelectionMode } from '../types';

export interface UseSelectionOptions<T extends RowData> {
  /** Initial selected row IDs */
  initialSelectedIds?: (string | number)[];
  /** Selection mode ('single' | 'multi' | 'none') */
  selectable?: SelectionMode;
  /** Custom row ID extractor */
  getRowId?: (row: T, index: number) => string | number;
  /** Callback when selection changes */
  onSelectionChange?: (selectedRows: T[]) => void;
}

export interface UseSelectionReturn<T extends RowData> {
  /** Set of selected row IDs */
  selectedIds: Set<string | number>;
  /** Array of selected rows */
  selectedRows: T[];
  /** Check if row is selected */
  isSelected: (rowId: string | number) => boolean;
  /** Toggle row selection */
  onToggleSelect: (rowId: string | number, row: T) => void;
  /** Select all rows */
  onSelectAll: () => void;
  /** Clear all selections */
  onClearSelection: () => void;
  /** Handle row click with modifier keys */
  onRowClick: (rowId: string | number, row: T, event: React.MouseEvent) => void;
  /** Number of selected rows */
  selectionCount: number;
  /** Check if all rows are selected */
  isAllSelected: boolean;
}

/**
 * Hook for managing table row selection state and logic
 *
 * Supports single, multi, and range selection with keyboard modifiers.
 *
 * @param data - Data array for selection
 * @param options - Selection configuration options
 * @returns Selection state and handlers
 *
 * @example
 * ```tsx
 * const { selectedRows, onToggleSelect, onSelectAll, isSelected } = useSelection(data, {
 *   selectable: 'multi',
 *   onSelectionChange: (rows) => console.log(rows)
 * })
 * ```
 */
export function useSelection<T extends RowData>(
  data: T[],
  options: UseSelectionOptions<T> = {},
): UseSelectionReturn<T> {
  const { initialSelectedIds = [], selectable = 'none', getRowId, onSelectionChange } = options;

  // Get row ID (custom or index-based)
  const getRowIdCallback = React.useCallback(
    (row: T, index: number): string | number => {
      if (getRowId) {
        return getRowId(row, index);
      }
      // Fallback to index if no custom ID extractor
      return index;
    },
    [getRowId],
  );

  // Selection state
  const [selectedIds, setSelectedIds] = React.useState<Set<string | number>>(
    new Set(initialSelectedIds),
  );

  // Track last selected index for range selection
  const [lastSelectedIndex, setLastSelectedIndex] = React.useState<number | undefined>(undefined);

  // Get selected rows array
  const selectedRows = React.useMemo(() => {
    return data.filter((row, index) => {
      const rowId = getRowIdCallback(row, index);
      return selectedIds.has(rowId);
    });
  }, [data, selectedIds, getRowIdCallback]);

  // Notify parent of selection changes
  React.useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedRows);
    }
  }, [selectedRows, onSelectionChange]);

  // Check if row is selected
  const isSelected = React.useCallback(
    (rowId: string | number): boolean => {
      return selectedIds.has(rowId);
    },
    [selectedIds],
  );

  // Toggle single row selection
  const onToggleSelect = React.useCallback(
    (rowId: string | number, _row: T) => {
      if (selectable === 'none') return;

      setSelectedIds((prev) => {
        const next = new Set(prev);

        if (selectable === 'single') {
          // Single selection: clear all and select only this one
          next.clear();
          next.add(rowId);
        } else {
          // Multi selection: toggle this row
          if (next.has(rowId)) {
            next.delete(rowId);
          } else {
            next.add(rowId);
          }
        }

        return next;
      });
    },
    [selectable],
  );

  // Select all rows
  const onSelectAll = React.useCallback(() => {
    if (selectable === 'none' || selectable === 'single') return;

    const allIds = data.map((row, index) => getRowIdCallback(row, index));
    setSelectedIds(new Set(allIds));
  }, [data, selectable, getRowIdCallback]);

  // Clear all selections
  const onClearSelection = React.useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedIndex(undefined);
  }, []);

  // Handle row click with modifier keys (Ctrl/Cmd, Shift)
  const onRowClick = React.useCallback(
    (rowId: string | number, row: T, event: React.MouseEvent) => {
      if (selectable === 'none') return;

      const rowIndex = data.findIndex((r) => {
        const id = getRowIdCallback(r, data.indexOf(r));
        return id === rowId;
      });

      if (rowIndex === -1) return;

      // Shift + Click: Range selection
      if (event.shiftKey && selectable === 'multi' && lastSelectedIndex !== undefined) {
        const start = Math.min(lastSelectedIndex, rowIndex);
        const end = Math.max(lastSelectedIndex, rowIndex);

        setSelectedIds((prev) => {
          const next = new Set(prev);
          for (let i = start; i <= end; i++) {
            const id = getRowIdCallback(data[i], i);
            next.add(id);
          }
          return next;
        });
        return;
      }

      // Ctrl/Cmd + Click: Multi-toggle
      if ((event.ctrlKey || event.metaKey) && selectable === 'multi') {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(rowId)) {
            next.delete(rowId);
          } else {
            next.add(rowId);
          }
          return next;
        });
        setLastSelectedIndex(rowIndex);
        return;
      }

      // Regular click: Single select or toggle
      onToggleSelect(rowId, row);
      setLastSelectedIndex(rowIndex);
    },
    [data, selectable, lastSelectedIndex, getRowIdCallback, onToggleSelect],
  );

  // Selection count
  const selectionCount = selectedIds.size;

  // Check if all rows are selected
  const isAllSelected = data.length > 0 && selectionCount === data.length;

  return {
    selectedIds,
    selectedRows,
    isSelected,
    onToggleSelect,
    onSelectAll,
    onClearSelection,
    onRowClick,
    selectionCount,
    isAllSelected,
  };
}

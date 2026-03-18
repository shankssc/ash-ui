import * as React from 'react';
import type { RowData, Column } from '../types';
import { resizeColumnWidth } from '../utils/column-utils';

export interface UseResizableColumnsOptions {
  /** Enable column resizing */
  resizable?: boolean;
  /** Initial column widths */
  initialColumnWidths?: Record<string, number>;
  /** Minimum column width */
  minWidth?: number;
  /** Maximum column width */
  maxWidth?: number;
  /** Callback when column is resized */
  onColumnResize?: (columnId: string, width: number) => void;
}

export interface UseResizableColumnsReturn<T extends RowData> {
  /** Map of column ID to current width */
  columnWidths: Record<string, number>;
  /** Start resizing a column */
  startResize: (columnId: string, event: React.MouseEvent) => void;
  /** Stop resizing */
  stopResize: () => void;
  /** Check if currently resizing */
  isResizing: boolean;
  /** Currently resizing column ID */
  resizingColumnId: string | null;
  /** Get width for a specific column */
  getColumnWidth: (column: Column<T>) => number;
}

interface ResizeState {
  columnId: string;
  startX: number;
  startWidth: number;
}

/**
 * Hook for managing column resizing state and logic
 *
 * Handles mouse drag events for resizing column widths.
 *
 * @param columns - Column definitions array
 * @param options - Resizing configuration options
 * @returns Resizing state and handlers
 *
 * @example
 * ```tsx
 * const { columnWidths, startResize, stopResize, getColumnWidth } = useResizableColumns(columns, {
 *   resizable: true,
 *   minWidth: 80,
 *   maxWidth: 500,
 *   onColumnResize: (id, width) => console.log(id, width)
 * })
 * ```
 */
export function useResizableColumns<T extends RowData>(
  columns: Column<T>[],
  options: UseResizableColumnsOptions,
): UseResizableColumnsReturn<T> {
  const {
    resizable = false,
    initialColumnWidths = {},
    minWidth = 80,
    maxWidth = 500,
    onColumnResize,
  } = options;

  // Column widths state
  const [columnWidths, setColumnWidths] =
    React.useState<Record<string, number>>(initialColumnWidths);

  // Resize state
  const [resizeState, setResizeState] = React.useState<ResizeState | null>(null);

  // Get width for a specific column
  const getColumnWidth = React.useCallback(
    (column: Column<T>): number => {
      return columnWidths[column.id] ?? column.width ?? 150;
    },
    [columnWidths],
  );

  // Start resizing
  const startResize = React.useCallback(
    (columnId: string, event: React.MouseEvent) => {
      if (!resizable) return;

      event.preventDefault();
      event.stopPropagation();

      const column = columns.find((col) => col.id === columnId);
      if (!column) return;

      const currentWidth = getColumnWidth(column);

      setResizeState({
        columnId,
        startX: event.clientX,
        startWidth: currentWidth,
      });
    },
    [resizable, columns, getColumnWidth],
  );

  // Handle mouse move during resize
  React.useEffect(() => {
    if (!resizeState) return;

    const handleMouseMove = (event: MouseEvent) => {
      const deltaX = event.clientX - resizeState.startX;
      const newWidth = resizeColumnWidth(resizeState.startWidth + deltaX, minWidth, maxWidth);

      setColumnWidths((prev) => ({
        ...prev,
        [resizeState.columnId]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      if (resizeState) {
        onColumnResize?.(resizeState.columnId, columnWidths[resizeState.columnId]);
      }
      setResizeState(null);
    };

    // Add global event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizeState, minWidth, maxWidth, onColumnResize, columnWidths]);

  // Stop resizing
  const stopResize = React.useCallback(() => {
    setResizeState(null);
  }, []);

  // Check if currently resizing
  const isResizing = resizeState !== null;

  // Currently resizing column ID
  const resizingColumnId = resizeState?.columnId ?? null;

  return {
    columnWidths,
    startResize,
    stopResize,
    isResizing,
    resizingColumnId,
    getColumnWidth,
  };
}

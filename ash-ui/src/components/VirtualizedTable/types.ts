// ash-ui/src/components/virtualized-table/types.ts
import type { ReactNode, CSSProperties } from 'react';

// ───────────────────────────────────────────────────────────
// Core Types
// ───────────────────────────────────────────────────────────

export type RowData = Record<string, unknown>;

export interface Column<T extends RowData = RowData> {
  /** Unique identifier for the column */
  id: string;

  /** Header content (string or render function) */
  header: string | ((props: { column: Column<T> }) => ReactNode);

  /** Cell content renderer */
  cell: (props: { row: T; value: T[keyof T]; column: Column<T> }) => ReactNode;

  /** Column width in pixels (for resizing) */
  width?: number;

  /** Minimum column width */
  minWidth?: number;

  /** Maximum column width */
  maxWidth?: number;

  /** Whether column is sortable */
  sortable?: boolean;

  /** Whether column can be resized */
  resizable?: boolean;

  /** Whether column can be pinned (left/right) */
  pin?: 'left' | 'right' | undefined;

  /** Custom cell className */
  cellClassName?: string;

  /** Custom header className */
  headerClassName?: string;

  /** Disable column */
  disabled?: boolean;

  /** ARIA label for header (accessibility) */
  ariaLabel?: string;
}

// ───────────────────────────────────────────────────────────
// Sort Types
// ───────────────────────────────────────────────────────────
export type SortDirection = 'asc' | 'desc' | undefined;

export interface SortState<T extends RowData = RowData> {
  columnId: keyof T;
  direction: SortDirection;
}

// ───────────────────────────────────────────────────────────
// Selection Types
// ───────────────────────────────────────────────────────────
export type SelectionMode = 'single' | 'multi' | 'none';

export interface SelectionState {
  selectedRowIds: Set<string | number>;
  lastSelectedIndex?: number;
}

// ───────────────────────────────────────────────────────────
// Component Props
// ───────────────────────────────────────────────────────────
export interface VirtualizedTableProps<T extends RowData = RowData> {
  /** Data rows to display */
  data: T[];

  /** Column definitions */
  columns: Column<T>[];

  /** Container height in pixels (required for virtualization) */
  height: number;

  /** Row height in pixels (fixed) */
  rowHeight?: number;

  /** Estimated row height for dynamic sizing */
  estimatedRowHeight?: number;

  /** Number of rows to render outside viewport (performance) */
  overscan?: number;

  /** Enable column sorting */
  sortable?: boolean;

  /** Enable column resizing */
  resizable?: boolean;

  /** Row selection mode */
  selectable?: SelectionMode;

  /** Enable sticky headers */
  stickyHeaders?: boolean;

  /** Pinned columns configuration */
  columnPinning?: {
    left?: string[];
    right?: string[];
  };

  /** Custom className for table container */
  className?: string;

  /** Custom className for table element */
  tableClassName?: string;

  /** Custom className for header row */
  headerClassName?: string;

  /** Custom className for body rows */
  rowClassName?: string | ((row: T, index: number) => string);

  /** Custom className for cells */
  cellClassName?: string | ((row: T, column: Column<T>, index: number) => string);

  /** Row click handler */
  onRowClick?: (row: T, index: number, event: React.MouseEvent) => void;

  /** Selection change handler */
  onSelectionChange?: (selectedRows: T[]) => void;

  /** Sort change handler */
  onSortChange?: (sortState: SortState<T> | undefined) => void;

  /** Column resize handler */
  onColumnResize?: (columnId: string, width: number) => void;

  /** Loading state */
  loading?: boolean;

  /** Empty state content */
  emptyState?: ReactNode;

  /** ARIA label for the table */
  'aria-label'?: string;

  /** Test ID for testing */
  'data-testid'?: string;

  /** Disable all interactions */
  disabled?: boolean;

  /** Enable keyboard navigation */
  enableKeyboardNavigation?: boolean;

  /** Custom row key extractor (for selection/sorting stability) */
  getRowId?: (row: T, index: number) => string | number;

  /** Custom style for table container */
  style?: CSSProperties;
}

// ───────────────────────────────────────────────────────────
// Internal State (for hooks)
// ───────────────────────────────────────────────────────────
export interface VirtualizedTableState<T extends RowData = RowData> {
  sortState: SortState<T> | undefined;
  selectionState: SelectionState;
  columnWidths: Record<string, number>;
  focusedRowIndex: number | null;
  focusedColumnIndex: number | null;
}

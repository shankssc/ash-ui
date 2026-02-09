/**
 * Column Definition Interface
 * @public
 */
export interface ColumnDef<TData> {
  /** Unique column identifier */
  id: string;
  
  /** Header display text or custom renderer */
  header: string | React.ReactNode | ((props: { table: DataTableInstance<TData> }) => React.ReactNode);
  
  /** Cell content accessor or custom renderer */
  cell: keyof TData | ((props: { row: TData; table: DataTableInstance<TData> }) => React.ReactNode);
  
  /** Whether column is sortable */
  sortable?: boolean;
  
  /** Custom header class names */
  headerClassName?: string;
  
  /** Custom cell class names */
  cellClassName?: string;
  
  /** Column width (CSS value) */
  width?: string;
  
  /** Whether column is hidden */
  hidden?: boolean;
}

/**
 * Sort Direction
 * @public
 */
export type SortDirection = 'asc' | 'desc' | null;

/**
 * Sort State
 * @public
 */
export interface SortState {
  key: string;
  direction: SortDirection;
}

/**
 * Pagination State
 * @public
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

/**
 * Row Selection State
 * @public
 */
export interface RowSelectionState<TData> {
  selectedRows: TData[];
  onSelectRow: (row: TData, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
  isRowSelected: (row: TData) => boolean;
  clearSelection: () => void;
}

/**
 * DataTable Props
 * @public
 */
export interface DataTableProps<TData> {
  /** Array of data objects to display */
  data: TData[];
  
  /** Column definitions */
  columns: ColumnDef<TData>[];
  
  /** Loading state */
  loading?: boolean;
  
  /** Empty state message or custom component */
  emptyState?: string | React.ReactNode;
  
  /** Loading skeleton rows count */
  skeletonRows?: number;
  
  /** Pagination configuration */
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  
  /** Initial sort state */
  initialSort?: SortState;
  
  /** Callback when sort changes */
  onSortChange?: (sort: SortState) => void;
  
  /** Enable row selection */
  enableSelection?: boolean;
  
  /** Callback when row selection changes */
  onSelectionChange?: (selectedRows: TData[]) => void;
  
  /** Custom row key function */
  getRowKey?: (row: TData, index: number) => string | number;
  
  /** Custom class names for table */
  className?: string;
  
  /** Custom class names for table container */
  containerClassName?: string;
  
  /** Test ID for testing */
  'data-testid'?: string;
}

/**
 * DataTable Instance (for context)
 * @public
 */
export interface DataTableInstance<TData> {
  rows: TData[];
  columns: ColumnDef<TData>[];
  sort: SortState;
  pagination?: PaginationState;
  selection?: RowSelectionState<TData>;
  onSort: (key: string) => void;
}
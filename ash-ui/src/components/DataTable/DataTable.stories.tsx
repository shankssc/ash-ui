import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, useMemo } from 'react';
import { DataTable } from './DataTable';
import type { ColumnDef } from './types';
import { Button } from '@/components/Button';

// Sample data type
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// Generate sample data
const generateUsers = (count: number): User[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Charlie Brown'][i % 5],
    email: `user${i + 1}@example.com`,
    role: ['Admin', 'User', 'Editor', 'Manager', 'Guest'][i % 5],
    status: ['active', 'inactive'][i % 2] as 'active' | 'inactive',
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
  }));
};

const sampleData = generateUsers(50);

const meta: Meta<typeof DataTable> = {
  title: 'Components/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    loading: { control: 'boolean' },
    enableSelection: { control: 'boolean' },
    skeletonRows: { control: 'number', min: 1, max: 20 },
  },
};

export default meta;
type Story = StoryObj<typeof DataTable<User>>;

/**
 * Basic Table - Sorting and simple data display
 */
export const Basic: Story = {
  render: () => {
    const columns: ColumnDef<User>[] = [
      { id: 'name', header: 'Name', cell: 'name', sortable: true },
      { id: 'email', header: 'Email', cell: 'email', sortable: true },
      { id: 'role', header: 'Role', cell: 'role', sortable: true },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              row.status === 'active'
                ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-200'
                : 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-200'
            }`}
          >
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </span>
        ),
      },
    ];

    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Basic DataTable
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            A simple data table with sorting capabilities. Click column headers to sort.
          </p>
        </div>
        <DataTable data={sampleData.slice(0, 10)} columns={columns} />
      </div>
    );
  },
};

/**
 * Loading State - Skeleton UI during data fetching
 */
export const Loading: Story = {
  render: () => {
    const columns: ColumnDef<User>[] = [
      { id: 'name', header: 'Name', cell: 'name' },
      { id: 'email', header: 'Email', cell: 'email' },
      { id: 'role', header: 'Role', cell: 'role' },
      { id: 'status', header: 'Status', cell: 'status' },
    ];

    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Loading State
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Skeleton UI displayed while data is being fetched from the server.
          </p>
        </div>
        <DataTable data={[]} columns={columns} loading={true} skeletonRows={8} />
      </div>
    );
  },
};

/**
 * Empty State - Custom empty state message
 */
export const Empty: Story = {
  render: () => {
    const columns: ColumnDef<User>[] = [
      { id: 'name', header: 'Name', cell: 'name' },
      { id: 'email', header: 'Email', cell: 'email' },
      { id: 'role', header: 'Role', cell: 'role' },
    ];

    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Empty State</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Custom empty state displayed when no data is available.
          </p>
        </div>
        <DataTable
          data={[]}
          columns={columns}
          emptyState={
            <div className="py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                <svg
                  className="h-8 w-8 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-neutral-100">
                No users found
              </h3>
              <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                Get started by creating a new user.
              </p>
              <div className="mt-6">
                <Button variant="primary">Create User</Button>
              </div>
            </div>
          }
        />
      </div>
    );
  },
};

/**
 * Pagination - Controlled pagination with external state
 */
export const Pagination: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const paginatedData = useMemo(() => {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return sampleData.slice(start, end);
    }, [page]);

    const columns: ColumnDef<User>[] = [
      { id: 'name', header: 'Name', cell: 'name', sortable: true },
      { id: 'email', header: 'Email', cell: 'email' },
      { id: 'role', header: 'Role', cell: 'role' },
      {
        id: 'createdAt',
        header: 'Joined',
        cell: ({ row }) => (
          <span className="font-mono text-sm text-neutral-500 dark:text-neutral-400">
            {row.createdAt}
          </span>
        ),
        sortable: true,
      },
    ];

    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Pagination</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Controlled pagination with external state management. Handles large datasets
            efficiently.
          </p>
        </div>
        <DataTable
          data={paginatedData}
          columns={columns}
          pagination={{
            page,
            pageSize,
            total: sampleData.length,
            onPageChange: setPage,
            onPageSizeChange: () => {
              setPage(1); // Reset to first page when page size changes
            },
          }}
        />
      </div>
    );
  },
};

/**
 * Row Selection - Single and multiple row selection
 */
export const Selection: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const paginatedData = useMemo(() => {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return sampleData.slice(start, end);
    }, [page]);

    const [selectedRows, setSelectedRows] = useState<User[]>([]);

    const columns: ColumnDef<User>[] = [
      { id: 'name', header: 'Name', cell: 'name' },
      { id: 'email', header: 'Email', cell: 'email' },
      { id: 'role', header: 'Role', cell: 'role' },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              row.status === 'active'
                ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-200'
                : 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-200'
            }`}
          >
            {row.status}
          </span>
        ),
      },
    ];

    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Row Selection
              </h1>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                Select rows for batch actions. Selection is cleared when changing pages.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button
                variant="primary"
                disabled={selectedRows.length === 0}
                onClick={() => {
                  alert(`Performing action on ${selectedRows.length} selected users`);
                  setSelectedRows([]);
                }}
              >
                Action on {selectedRows.length} selected
              </Button>
            </div>
          </div>
        </div>
        <DataTable
          data={paginatedData}
          columns={columns}
          enableSelection={true}
          onSelectionChange={setSelectedRows}
          pagination={{
            page,
            pageSize,
            total: sampleData.length,
            onPageChange: setPage,
            onPageSizeChange: () => setPage(1),
          }}
        />
        <div className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          Selected rows: {selectedRows.length} (IDs: {selectedRows.map((r) => r.id).join(', ')})
        </div>
      </div>
    );
  },
};

/**
 * Custom Rendering - Advanced cell and header customization
 */
export const CustomRendering: Story = {
  render: () => {
    const columns: ColumnDef<User>[] = [
      {
        id: 'name',
        header: ({ table }) => (
          <div className="flex items-center space-x-2">
            <span>Name</span>
            {table.sort.key === 'name' && (
              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                ({table.sort.direction})
              </span>
            )}
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            <div>
              <div className="font-medium text-neutral-900 dark:text-neutral-100">{row.name}</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">ID: {row.id}</div>
            </div>
          </div>
        ),
        sortable: true,
        width: '30%',
      },
      {
        id: 'email',
        header: 'Contact',
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="text-neutral-900 dark:text-neutral-100">{row.email}</div>
            <div className="flex space-x-2">
              <button className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
                Email
              </button>
              <button className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
                Message
              </button>
            </div>
          </div>
        ),
        width: '35%',
      },
      {
        id: 'role',
        header: 'Role & Status',
        cell: ({ row }) => (
          <div className="space-y-1">
            <span className="inline-flex rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-200">
              {row.role}
            </span>
            <div
              className={`h-2 w-2 rounded-full ${
                row.status === 'active' ? 'bg-success-500' : 'bg-neutral-400'
              }`}
            />
          </div>
        ),
        width: '20%',
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end space-x-2">
            <button
              aria-label={`Edit user ${row.name}`}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              aria-label={`Delete user ${row.name}`}
              className="text-neutral-400 hover:text-danger-600 dark:hover:text-danger-400"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        ),
        width: '15%',
      },
    ];

    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Custom Rendering
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Advanced customization of headers and cells with React components, icons, and complex
            layouts.
          </p>
        </div>
        <DataTable data={sampleData.slice(0, 8)} columns={columns} />
      </div>
    );
  },
};

/**
 * Column Configuration - Width, hidden columns, and responsive behavior
 */
export const ColumnConfiguration: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const paginatedData = useMemo(() => {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return sampleData.slice(start, end);
    }, [page]);

    const [showStatus, setShowStatus] = useState(true);
    const [showCreatedAt, setShowCreatedAt] = useState(true);

    const columns: ColumnDef<User>[] = [
      { id: 'name', header: 'Name', cell: 'name', sortable: true, width: '25%' },
      { id: 'email', header: 'Email', cell: 'email', width: '35%' },
      { id: 'role', header: 'Role', cell: 'role', width: '15%' },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              row.status === 'active'
                ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-200'
                : 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-200'
            }`}
          >
            {row.status}
          </span>
        ),
        hidden: !showStatus,
        width: '15%',
      },
      {
        id: 'createdAt',
        header: 'Joined',
        cell: ({ row }) => (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">{row.createdAt}</span>
        ),
        hidden: !showCreatedAt,
        width: '15%',
      },
    ];

    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Column Configuration
              </h1>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                Control column visibility, width, and responsive behavior. Resize your browser to
                see horizontal scrolling on mobile.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
              <Button
                variant={showStatus ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setShowStatus(!showStatus)}
              >
                {showStatus ? 'Hide' : 'Show'} Status
              </Button>
              <Button
                variant={showCreatedAt ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setShowCreatedAt(!showCreatedAt)}
              >
                {showCreatedAt ? 'Hide' : 'Show'} Joined Date
              </Button>
            </div>
          </div>
        </div>
        <div className="mb-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            <strong>Tip:</strong> On mobile devices, swipe horizontally to view all columns. Column
            widths are responsive and adapt to available space.
          </p>
        </div>
        <DataTable
          data={paginatedData}
          columns={columns}
          containerClassName="border-neutral-200 dark:border-neutral-700"
          pagination={{
            page,
            pageSize,
            total: sampleData.length,
            onPageChange: setPage,
            onPageSizeChange: () => setPage(1),
          }}
        />
      </div>
    );
  },
};

/**
 * Playground - Interactive controls for all props
 */
export const Playground: Story = {
  render: (args) => {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const paginatedData = useMemo(() => {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return sampleData.slice(start, end);
    }, [page]);

    const columns: ColumnDef<User>[] = [
      { id: 'name', header: 'Name', cell: 'name', sortable: true },
      { id: 'email', header: 'Email', cell: 'email', sortable: true },
      { id: 'role', header: 'Role', cell: 'role' },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              row.status === 'active'
                ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-200'
                : 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-200'
            }`}
          >
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </span>
        ),
      },
    ];

    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            DataTable Playground
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Interact with controls in the Storybook panel to see how different props affect the
            table behavior.
          </p>
        </div>
        <DataTable
          {...args}
          data={args.loading ? [] : paginatedData}
          columns={columns}
          pagination={
            args.loading
              ? undefined
              : {
                  page,
                  pageSize,
                  total: sampleData.length,
                  onPageChange: setPage,
                  onPageSizeChange: () => setPage(1),
                }
          }
        />
      </div>
    );
  },
  args: {
    loading: false,
    enableSelection: true,
    skeletonRows: 5,
    containerClassName: '',
    className: '',
  },
};

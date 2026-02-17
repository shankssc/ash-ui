import { render, screen, waitFor /*fireEvent*/ } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DataTable } from './DataTable';
import type { ColumnDef } from './types';

// Test data type
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

// Sample data
const sampleData: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'inactive' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor', status: 'active' },
];

// Common column definitions
const columns: ColumnDef<User>[] = [
  { id: 'name', header: 'Name', cell: 'name', sortable: true },
  { id: 'email', header: 'Email', cell: 'email', sortable: true },
  { id: 'role', header: 'Role', cell: 'role' },
  { id: 'status', header: 'Status', cell: 'status', hidden: true },
];

const user = userEvent.setup();

describe('DataTable Component', () => {
  const user = userEvent.setup();

  describe('Rendering', () => {
    it('renders table with data', () => {
      render(<DataTable data={sampleData} columns={columns} />);

      // Check headers
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();

      // Check data rows
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('Editor')).toBeInTheDocument();

      // Hidden column should not render
      expect(screen.queryByText('Status')).not.toBeInTheDocument();
    });

    it('renders loading screen when loading is true', () => {
      render(<DataTable data={[]} columns={columns} loading={true} skeletonRows={3} />);

      expect(screen.getByTestId('data-table-loading')).toBeInTheDocument();

      // Should have skeleton rows (3 rows + 1 header row = 4 tr elements)
      const skeletonRows = screen.getAllByRole('row');
      expect(skeletonRows).toHaveLength(4);
    });

    it('renders empty state when data is empty', () => {
      render(<DataTable data={[]} columns={columns} />);

      expect(screen.getByTestId('data-table-empty')).toBeInTheDocument();
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('renders custom empty state', () => {
      render(
        <DataTable
          data={[]}
          columns={columns}
          emptyState={<div data-testid="custom-empty">Custom Empty</div>}
        />,
      );

      expect(screen.getByTestId('custom-empty')).toBeInTheDocument();
      expect(screen.getByText('Custom Empty')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('sorts column when header is clicked', async () => {
      const onSortChange = vi.fn();
      render(<DataTable data={sampleData} columns={columns} onSortChange={onSortChange} />);

      // Click Name header
      const nameHeader = screen.getByText('Name').closest('th');
      await user.click(nameHeader!);

      // Should trigger sort callback
      expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'asc' });

      // Click again to toggle direction
      await user.click(nameHeader!);
      expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'desc' });
    });

    it('shows sort indicators for sorted columns', () => {
      render(
        <DataTable
          data={sampleData}
          columns={columns}
          initialSort={{ key: 'name', direction: 'asc' }}
        />,
      );

      // Sort indicator should be present on sorted column
      const nameHeader = screen.getByText('Name').closest('th');
      expect(nameHeader).toHaveClass('bg-neutral-100'); // Sorted column has bg color

      // Should have sort icon (SVG path for ascending)
      const svg = nameHeader!.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('does not show sort indicators for unsorted columns', () => {
      render(<DataTable data={sampleData} columns={columns} />);

      const emailHeader = screen.getByText('Email').closest('th');
      expect(emailHeader).not.toHaveClass('bg-neutral-100');
      expect(emailHeader).not.toHaveAttribute('aria-sort');
    });
  });

  describe('Pagination', () => {
    it('renders pagination control when pagination is provided', () => {
      render(
        <DataTable
          data={sampleData}
          columns={columns}
          pagination={{
            page: 1,
            pageSize: 10,
            total: 50,
            onPageChange: vi.fn(),
            onPageSizeChange: vi.fn(),
          }}
        />,
      );

      const paginationContainer = screen.getByText(/Showing/i).parentElement;
      expect(paginationContainer?.textContent).toMatch(/Showing 1 to 10 of 50 entries/i);

      expect(screen.getByRole('button', { name: /Previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
    });

    it('disables previous button on first page', () => {
      render(
        <DataTable
          data={sampleData}
          columns={columns}
          pagination={{
            page: 1,
            pageSize: 10,
            total: 50,
            onPageChange: vi.fn(),
            onPageSizeChange: vi.fn(),
          }}
        />,
      );

      const prevButton = screen.getByRole('button', { name: /Previous/i });
      expect(prevButton).toBeDisabled();
    });

    it('enables next button when not on last page', () => {
      render(
        <DataTable
          data={sampleData}
          columns={columns}
          pagination={{
            page: 1,
            pageSize: 10,
            total: 50,
            onPageChange: vi.fn(),
            onPageSizeChange: vi.fn(),
          }}
        />,
      );

      const nextButton = screen.getByRole('button', { name: /Next/i });
      expect(nextButton).not.toBeDisabled();
    });

    it('calls onPageChange when next button is clicked', async () => {
      const onPageChange = vi.fn();
      render(
        <DataTable
          data={sampleData}
          columns={columns}
          pagination={{
            page: 1,
            pageSize: 10,
            total: 50,
            onPageChange,
            onPageSizeChange: vi.fn(),
          }}
        />,
      );

      const nextButton = screen.getByRole('button', { name: /Next/i });
      await user.click(nextButton);

      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageSizeChange when page size is changed', async () => {
      const onPageSizeChange = vi.fn();
      render(
        <DataTable
          data={sampleData}
          columns={columns}
          pagination={{
            page: 1,
            pageSize: 10,
            total: 50,
            onPageChange: vi.fn(),
            onPageSizeChange,
          }}
        />,
      );

      const select = screen.getByRole('combobox', { name: /Items per page/i });
      await user.selectOptions(select, '25');

      expect(onPageSizeChange).toHaveBeenCalledWith(25);
    });
  });

  describe('Row Selection', () => {
    it('renders selection checkboxes when enableSelection is true', () => {
      render(<DataTable data={sampleData} columns={columns} enableSelection={true} />);

      // Should have checkbox in header and each row
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(4); // 1 header + 3 rows
    });

    it('selects single row when checkbox is clicked', async () => {
      const onSelectionChange = vi.fn();
      render(
        <DataTable
          data={sampleData}
          columns={columns}
          enableSelection={true}
          onSelectionChange={onSelectionChange}
        />,
      );

      // Click first row checkbox
      const rowCheckboxes = screen.getAllByRole('checkbox');
      await user.click(rowCheckboxes[1]); // First data row (index 1, after header)

      // Should trigger selection callback with selected row
      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalledWith([sampleData[0]]);
      });
    });

    it('selects all rows when header checkbox is clicked', async () => {
      const onSelectionChange = vi.fn();
      render(
        <DataTable
          data={sampleData}
          columns={columns}
          enableSelection={true}
          onSelectionChange={onSelectionChange}
        />,
      );

      // Click header checkbox
      const headerCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(headerCheckbox);

      // Should select all rows
      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalledWith(sampleData);
      });
    });

    it('deselects all rows when header checkbox is clicked again', async () => {
      const onSelectionChange = vi.fn();
      render(
        <DataTable
          data={sampleData}
          columns={columns}
          enableSelection={true}
          onSelectionChange={onSelectionChange}
        />,
      );

      const headerCheckbox = screen.getAllByRole('checkbox')[0];

      // Select all
      await user.click(headerCheckbox);
      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalledWith(sampleData);
      });

      // Clear calls
      onSelectionChange.mockClear();

      // Deselect all
      await user.click(headerCheckbox);
      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalledWith([]);
      });
    });
  });

  it('highlights selected rows with background color', async () => {
    render(<DataTable data={sampleData} columns={columns} enableSelection={true} />);

    const rowCheckboxes = screen.getAllByRole('checkbox');
    await user.click(rowCheckboxes[1]); // Select first row

    // First row should have selection background class
    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1]; // First data row (after header)
    expect(firstDataRow).toHaveClass('bg-primary-50');
  });
});

describe('Custom Rendering', () => {
  it('renders custom header content', () => {
    const customColumns: ColumnDef<User>[] = [
      {
        id: 'name',
        header: () => <span data-testid="custom-header">Custom Name</span>,
        cell: 'name',
      },
    ];

    render(<DataTable data={sampleData} columns={customColumns} />);

    expect(screen.getByTestId('custom-header')).toBeInTheDocument();
    expect(screen.getByText('Custom Name')).toBeInTheDocument();
  });

  it('renders custom cell content with row data', () => {
    const customColumns: ColumnDef<User>[] = [
      {
        id: 'name',
        header: 'Name',
        cell: ({ row }) => <strong data-testid={`name-${row.id}`}>{row.name}</strong>,
      },
    ];

    render(<DataTable data={sampleData} columns={customColumns} />);

    expect(screen.getByTestId('name-1')).toHaveTextContent('John Doe');
    expect(screen.getByTestId('name-2')).toHaveTextContent('Jane Smith');
  });

  it('passes table context to custom renderers', () => {
    const customColumns: ColumnDef<User>[] = [
      {
        id: 'name',
        header: ({ table }) => (
          <span data-testid="header-sort">{table.sort.direction || 'none'}</span>
        ),
        cell: ({ row, table }) => <span data-testid={`cell-${row.id}`}>{table.sort.key}</span>,
      },
    ];

    render(
      <DataTable
        data={sampleData}
        columns={customColumns}
        initialSort={{ key: 'name', direction: 'asc' }}
      />,
    );

    expect(screen.getByTestId('header-sort')).toHaveTextContent('asc');
    expect(screen.getByTestId('cell-1')).toHaveTextContent('name');
  });
});

describe('Accessibility', () => {
  it('has proper ARIA attributes for sorted columns', () => {
    render(
      <DataTable
        data={sampleData}
        columns={columns}
        initialSort={{ key: 'name', direction: 'asc' }}
      />,
    );

    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    expect(nameHeader).toHaveAttribute('aria-sortable', 'true');
  });

  it('has proper ARIA attributes for selection checkboxes', () => {
    render(<DataTable data={sampleData} columns={columns} enableSelection={true} />);

    const checkboxes = screen.getAllByRole('checkbox');

    // Header checkbox
    expect(checkboxes[0]).toHaveAttribute('aria-label', 'Select all rows');

    // Row checkboxes
    expect(checkboxes[1]).toHaveAttribute('aria-label', 'Select row 0');
    expect(checkboxes[2]).toHaveAttribute('aria-label', 'Select row 1');
  });

  it('has proper ARIA attributes for pagination buttons', () => {
    render(
      <DataTable
        data={sampleData}
        columns={columns}
        pagination={{
          page: 1,
          pageSize: 10,
          total: 50,
          onPageChange: vi.fn(),
          onPageSizeChange: vi.fn(),
        }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Items per page' })).toBeInTheDocument();
  });

  it('sets aria-selected on selected rows', async () => {
    render(<DataTable data={sampleData} columns={columns} enableSelection={true} />);

    const rowCheckboxes = screen.getAllByRole('checkbox');
    await user.click(rowCheckboxes[1]);

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveAttribute('aria-selected', 'true');
  });
});

describe('Responsive Design', () => {
  it('wraps table in overflow container for horizontal scrolling', () => {
    render(<DataTable data={sampleData} columns={columns} />);

    // Should have overflow-hidden div wrapping the table
    const container = screen.getByTestId('data-table').closest('div');
    expect(container).toHaveClass('overflow-hidden');
  });
});

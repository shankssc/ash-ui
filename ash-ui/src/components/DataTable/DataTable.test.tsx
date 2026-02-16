import { render, screen /*fireEvent, waitFor*/ } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import { describe, it, expect /*, vi*/ } from 'vitest';
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

describe('DataTable Component', () => {
  // const user = userEvent.setup();

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
});

import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Table, type TableColumn, type TableRow } from './Table.js';

const COLUMNS: TableColumn[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'role', header: 'Role' },
];
const ROWS: TableRow[] = [
  { id: '1', name: 'Ada', role: 'Engineer' },
  { id: '2', name: 'Grace', role: 'Admiral' },
];

describe('Table', () => {
  it('renders headers and cells', () => {
    render(<Table columns={COLUMNS} rows={ROWS} caption="Team" />);
    expect(screen.getByRole('table', { name: 'Team' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Ada' })).toBeInTheDocument();
  });

  it('marks a sortable column with aria-sort and emits sort intent', async () => {
    const onSortChange = vi.fn();
    render(<Table columns={COLUMNS} rows={ROWS} onSortChange={onSortChange} />);
    const nameHeader = screen.getByRole('columnheader', { name: /Name/ });
    expect(nameHeader).toHaveAttribute('aria-sort', 'none');
    await userEvent.click(within(nameHeader).getByRole('button'));
    expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'asc' });
  });

  it('reflects the current sort direction via aria-sort', () => {
    render(<Table columns={COLUMNS} rows={ROWS} sort={{ key: 'name', direction: 'desc' }} />);
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute(
      'aria-sort',
      'descending',
    );
  });

  it('shows selection checkboxes and toggles a row', async () => {
    const onSelectionChange = vi.fn();
    render(
      <Table
        columns={COLUMNS}
        rows={ROWS}
        selectedIds={[]}
        onSelectionChange={onSelectionChange}
      />,
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
    expect(onSelectionChange).toHaveBeenCalledWith(['1']);
  });

  it('select-all toggles every row', async () => {
    const onSelectionChange = vi.fn();
    render(
      <Table
        columns={COLUMNS}
        rows={ROWS}
        selectedIds={[]}
        onSelectionChange={onSelectionChange}
      />,
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
    expect(onSelectionChange).toHaveBeenCalledWith(['1', '2']);
  });
});

import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
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
    renderWithTheme(<Table columns={COLUMNS} rows={ROWS} caption="Team" testID="t" />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('Admiral')).toBeInTheDocument();
  });

  it('emits sort intent when a sortable header is pressed', () => {
    const onSortChange = vi.fn();
    renderWithTheme(<Table columns={COLUMNS} rows={ROWS} onSortChange={onSortChange} />);
    fireEvent.click(screen.getByText('Name'));
    expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'asc' });
  });

  it('emits selection intent when a row checkbox is pressed', () => {
    const onSelectionChange = vi.fn();
    renderWithTheme(
      <Table
        columns={COLUMNS}
        rows={ROWS}
        selectedIds={[]}
        onSelectionChange={onSelectionChange}
      />,
    );
    fireEvent.click(screen.getByLabelText('Select row 1'));
    expect(onSelectionChange).toHaveBeenCalledWith(['1']);
  });
});

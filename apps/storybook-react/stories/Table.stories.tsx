import { Table, type TableColumn, type TableRow, type TableSort } from '@ghds/react/table';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';

const COLUMNS: TableColumn[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'role', header: 'Role', sortable: true },
  { key: 'commits', header: 'Commits', sortable: true, align: 'right' },
];
const DATA: TableRow[] = [
  { id: '1', name: 'Ada', role: 'Engineer', commits: 128 },
  { id: '2', name: 'Grace', role: 'Admiral', commits: 342 },
  { id: '3', name: 'Alan', role: 'Researcher', commits: 87 },
];

const meta = {
  title: 'Components/Table',
  component: Table,
  args: { columns: COLUMNS, rows: DATA, caption: 'Contributors' },
} satisfies Meta<typeof Table>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Interactive: sortable headers reorder rows; checkboxes select. */
export const SortableSelectable: Story = {
  render: (args) => {
    const [sort, setSort] = useState<TableSort>({ key: 'name', direction: 'asc' });
    const [selected, setSelected] = useState<string[]>([]);
    const rows = useMemo(() => {
      const sorted = [...DATA].sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        const cmp =
          typeof av === 'number' && typeof bv === 'number'
            ? av - bv
            : String(av).localeCompare(String(bv));
        return sort.direction === 'asc' ? cmp : -cmp;
      });
      return sorted;
    }, [sort]);
    return (
      <Table
        {...args}
        rows={rows}
        sort={sort}
        onSortChange={setSort}
        selectedIds={selected}
        onSelectionChange={setSelected}
      />
    );
  },
};

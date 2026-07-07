import { Table, type TableRow, type TableSort } from '@ghds/react';
import { useMemo, useState } from 'react';

const DATA: TableRow[] = [
  { id: '1', name: 'Ada', role: 'Engineer', commits: 128 },
  { id: '2', name: 'Grace', role: 'Admiral', commits: 342 },
  { id: '3', name: 'Alan', role: 'Researcher', commits: 87 },
];

/** Live, sortable + selectable Table demo (React). */
export default function TableDemo(): React.JSX.Element {
  const [sort, setSort] = useState<TableSort>({ key: 'name', direction: 'asc' });
  const [selected, setSelected] = useState<string[]>([]);
  const rows = useMemo(
    () =>
      [...DATA].sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        const cmp =
          typeof av === 'number' && typeof bv === 'number'
            ? av - bv
            : String(av).localeCompare(String(bv));
        return sort.direction === 'asc' ? cmp : -cmp;
      }),
    [sort],
  );
  return (
    <Table
      caption="Contributors"
      columns={[
        { key: 'name', header: 'Name', sortable: true },
        { key: 'role', header: 'Role', sortable: true },
        { key: 'commits', header: 'Commits', sortable: true, align: 'right' },
      ]}
      rows={rows}
      sort={sort}
      onSortChange={setSort}
      selectedIds={selected}
      onSelectionChange={setSelected}
    />
  );
}

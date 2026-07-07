import type { Meta, StoryObj } from '@storybook/web-components';
import '@ghds/web-components';
import type { GhTableColumn, GhTableRow, GhTableSort } from '@ghds/web-components';

const COLUMNS: GhTableColumn[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'role', header: 'Role', sortable: true },
  { key: 'commits', header: 'Commits', sortable: true, align: 'right' },
];
const DATA: GhTableRow[] = [
  { id: '1', name: 'Ada', role: 'Engineer', commits: 128 },
  { id: '2', name: 'Grace', role: 'Admiral', commits: 342 },
  { id: '3', name: 'Alan', role: 'Researcher', commits: 87 },
];

const meta: Meta = {
  title: 'Components/Table',
  tags: ['autodocs'],
  render: () => {
    const el = document.createElement('gh-table');
    const t = el as HTMLElement & {
      columns: GhTableColumn[];
      rows: GhTableRow[];
      caption: string;
      sort?: GhTableSort;
      selectedIds?: string[];
    };
    t.columns = COLUMNS;
    t.caption = 'Contributors';
    t.selectedIds = [];
    const render = () => {
      const sort = t.sort;
      const rows = [...DATA].sort((a, b) => {
        if (!sort) return 0;
        const av = a[sort.key];
        const bv = b[sort.key];
        const cmp =
          typeof av === 'number' && typeof bv === 'number'
            ? av - bv
            : String(av).localeCompare(String(bv));
        return sort.direction === 'asc' ? cmp : -cmp;
      });
      t.rows = rows;
    };
    el.addEventListener('sort-change', (e) => {
      t.sort = (e as CustomEvent<GhTableSort>).detail;
      render();
    });
    el.addEventListener('selection-change', (e) => {
      t.selectedIds = (e as CustomEvent<string[]>).detail;
    });
    render();
    return el;
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

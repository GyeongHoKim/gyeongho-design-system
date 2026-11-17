import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@ghds/web-components/table';
import type { GhTableColumn, GhTableRow, GhTableSort } from '@ghds/web-components/table';

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

const SWATCH_ROWS: GhTableRow[] = [
  {
    id: 'primary',
    token: 'sys.color.bg.primary.default',
    cssVar: '--sys-color-bg-primary-default',
  },
  {
    id: 'success',
    token: 'sys.color.bg.success.default',
    cssVar: '--sys-color-bg-success-default',
  },
  { id: 'danger', token: 'sys.color.bg.danger.default', cssVar: '--sys-color-bg-danger-default' },
];

/**
 * Rich cell content: a column `render(value, row)` returns a Lit
 * `TemplateResult` — here a `<code>` token name and a colour swatch.
 * Row values stay `string | number`.
 */
export const RichCells: Story = {
  render: () => {
    const el = document.createElement('gh-table') as HTMLElement & {
      columns: GhTableColumn[];
      rows: GhTableRow[];
      caption: string;
    };
    el.caption = 'Semantic colours';
    el.columns = [
      {
        key: 'cssVar',
        header: 'Preview',
        render: (value) =>
          html`<span
            aria-hidden="true"
            style=${`display:inline-block;width:var(--sys-spacing-lg);height:var(--sys-spacing-lg);border-radius:var(--sys-radius-sm);border:var(--sys-border-width-default) solid var(--sys-color-border-default);background:var(${value})`}
          ></span>`,
      },
      { key: 'token', header: 'Token', render: (value) => html`<code>${value}</code>` },
    ];
    el.rows = SWATCH_ROWS;
    return el;
  },
};

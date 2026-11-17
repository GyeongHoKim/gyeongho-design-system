import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhTable, type GhTableColumn } from '../components/table.js';
import { cleanup, mount } from './fixture.js';

const COLUMNS = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'role', header: 'Role' },
];
const ROWS = [
  { id: '1', name: 'Ada', role: 'Engineer' },
  { id: '2', name: 'Grace', role: 'Admiral' },
];

async function mountTable(props: Partial<GhTable> = {}): Promise<GhTable> {
  const el = await mount(new GhTable());
  el.columns = COLUMNS;
  el.rows = ROWS;
  Object.assign(el, props);
  await el.updateComplete;
  return el;
}

describe('gh-table', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-table')).toBe(GhTable);
  });

  it('renders headers and cells', async () => {
    const el = await mountTable();
    const headers = [...(el.shadowRoot?.querySelectorAll('th') ?? [])].map((h) =>
      h.textContent?.trim(),
    );
    expect(headers.join(' ')).toContain('Name');
    expect(el.shadowRoot?.querySelector('tbody')?.textContent).toContain('Ada');
  });

  it('marks a sortable header and dispatches sort-change', async () => {
    const el = await mountTable();
    const handler = vi.fn();
    el.addEventListener('sort-change', handler);
    const nameTh = el.shadowRoot?.querySelector('th[aria-sort]');
    expect(nameTh?.getAttribute('aria-sort')).toBe('none');
    nameTh?.querySelector('button')?.click();
    expect((handler.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      key: 'name',
      direction: 'asc',
    });
  });

  it('reflects the current sort direction', async () => {
    const el = await mountTable({ sort: { key: 'name', direction: 'desc' } });
    expect(el.shadowRoot?.querySelector('th[aria-sort]')?.getAttribute('aria-sort')).toBe(
      'descending',
    );
  });

  it('shows selection checkboxes and emits selection-change', async () => {
    const el = await mountTable({ selectedIds: [] });
    const handler = vi.fn();
    el.addEventListener('selection-change', handler);
    const boxes = el.shadowRoot?.querySelectorAll('tbody gh-checkbox');
    (boxes?.[0] as HTMLElement).dispatchEvent(
      new Event('change', { bubbles: true, composed: true }),
    );
    expect((handler.mock.calls[0]?.[0] as CustomEvent).detail).toEqual(['1']);
  });

  it('renders a column through its render function', async () => {
    const render = vi.fn(
      (value: string | number, row: { id: string }) =>
        html`<code data-row=${row.id}>${value}</code>`,
    );
    const columns: GhTableColumn[] = [{ key: 'name', header: 'Name', render }, ...COLUMNS.slice(1)];
    const el = await mountTable({ columns });
    const cells = el.shadowRoot?.querySelectorAll('tbody tr:first-child td');
    const code = cells?.[0]?.querySelector('code');
    expect(code?.textContent).toBe('Ada');
    expect(code?.dataset.row).toBe('1');
    expect(render).toHaveBeenCalledWith('Ada', ROWS[0]);
    expect(render).toHaveBeenCalledWith('Grace', ROWS[1]);
    // Columns without `render` still show the raw value.
    expect(cells?.[1]?.querySelector('code')).toBeNull();
    expect(cells?.[1]?.textContent?.trim()).toBe('Engineer');
  });

  it('renders raw primitive values when no column has render', async () => {
    const el = await mountTable();
    const cells = [...(el.shadowRoot?.querySelectorAll('tbody tr:first-child td') ?? [])];
    expect(cells.map((c) => c.textContent?.trim())).toEqual(['Ada', 'Engineer']);
    expect(el.shadowRoot?.querySelector('tbody code')).toBeNull();
  });
});

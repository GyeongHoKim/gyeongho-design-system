import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhTable } from '../components/table.js';
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
    expect((handler.mock.calls[0][0] as CustomEvent).detail).toEqual({
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
    expect((handler.mock.calls[0][0] as CustomEvent).detail).toEqual(['1']);
  });
});

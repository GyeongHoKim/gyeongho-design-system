import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhAttachment } from '../components/attachment.js';
import { cleanup, mount, setSize } from './fixture.js';

async function mountAttachment(props: Partial<GhAttachment> = {}): Promise<GhAttachment> {
  const el = new GhAttachment();
  el.name = 'report.pdf';
  Object.assign(el, props);
  await mount(el);
  await el.updateComplete;
  return el;
}

describe('gh-attachment', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-attachment')).toBe(GhAttachment);
  });

  it('renders the name and optional meta', async () => {
    const el = await mountAttachment({ meta: '2.4 MB' });
    expect(el.shadowRoot?.querySelector('.name')?.textContent).toContain('report.pdf');
    expect(el.shadowRoot?.querySelector('.meta')?.textContent).toContain('2.4 MB');
  });

  it('omits meta and icon when not provided', async () => {
    const el = await mountAttachment();
    expect(el.shadowRoot?.querySelector('.meta')).toBeNull();
    expect(el.shadowRoot?.querySelector('.icon')).toBeNull();
  });

  it('renders a leading icon when set', async () => {
    const el = await mountAttachment({ icon: 'mail' });
    const icon = el.shadowRoot?.querySelector('.icon gh-icon');
    expect(icon?.getAttribute('name')).toBe('mail');
  });

  it('shows a remove button that emits gh-remove when removable', async () => {
    const el = await mountAttachment({ removable: true });
    expect(el.hasAttribute('removable')).toBe(true);
    const handler = vi.fn();
    el.addEventListener('gh-remove', handler);
    const button = el.shadowRoot?.querySelector<HTMLButtonElement>('.remove');
    expect(button?.getAttribute('aria-label')).toBe('Remove report.pdf');
    button?.click();
    expect(handler).toHaveBeenCalledOnce();
  });

  it('has no remove button by default', async () => {
    const el = await mountAttachment();
    expect(el.shadowRoot?.querySelector('.remove')).toBeNull();
  });

  it('draws the sketch border box once measured', async () => {
    const el = await mountAttachment();
    await setSize(el, 200, 48);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length ?? 0).toBeGreaterThan(0);
  });
});

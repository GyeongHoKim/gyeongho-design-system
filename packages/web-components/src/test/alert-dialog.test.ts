import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhAlertDialog } from '../components/alert-dialog.js';
import { cleanup, mount } from './fixture.js';

describe('gh-alert-dialog', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-alert-dialog')).toBe(GhAlertDialog);
  });

  it('renders an alertdialog with title and description wiring', async () => {
    const el = await mount(new GhAlertDialog());
    el.heading = 'Delete file?';
    el.description = 'This cannot be undone.';
    el.open = true;
    await el.updateComplete;
    const dialog = el.shadowRoot?.querySelector('dialog');
    expect(dialog?.getAttribute('role')).toBe('alertdialog');
    expect(dialog?.getAttribute('aria-labelledby')).toBe(
      el.shadowRoot?.querySelector('.title')?.id,
    );
    expect(dialog?.getAttribute('aria-describedby')).toBeTruthy();
  });

  it('dispatches confirm and cancel from the action buttons', async () => {
    const el = await mount(new GhAlertDialog());
    el.open = true;
    await el.updateComplete;
    const confirm = vi.fn();
    const cancel = vi.fn();
    el.addEventListener('confirm', confirm);
    el.addEventListener('cancel', cancel);
    const buttons = el.shadowRoot?.querySelectorAll('gh-button');
    (buttons?.[0] as HTMLElement).click();
    (buttons?.[1] as HTMLElement).click();
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(confirm).toHaveBeenCalledTimes(1);
  });

  it('uses the danger variant for the confirm button', async () => {
    const el = await mount(new GhAlertDialog());
    el.variant = 'danger';
    el.open = true;
    await el.updateComplete;
    const confirmButton = el.shadowRoot?.querySelectorAll('gh-button')[1];
    expect(confirmButton?.getAttribute('variant')).toBe('danger');
  });

  it('cancels (does not confirm) on Escape', async () => {
    const el = await mount(new GhAlertDialog());
    el.open = true;
    await el.updateComplete;
    const cancel = vi.fn();
    el.addEventListener('cancel', cancel);
    const evt = new Event('cancel', { cancelable: true });
    el.shadowRoot?.querySelector('dialog')?.dispatchEvent(evt);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(evt.defaultPrevented).toBe(true);
  });
});

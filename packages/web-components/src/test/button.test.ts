import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhButton } from '../components/button.js';
import { cleanup, mount, setSize } from './fixture.js';

describe('gh-button', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-button')).toBe(GhButton);
  });

  it('renders a real <button> exposing the slotted label', async () => {
    const el = await mount(new GhButton());
    el.textContent = 'Save';
    await el.updateComplete;
    const button = el.shadowRoot?.querySelector('button');
    expect(button).not.toBeNull();
    expect(el.textContent).toBe('Save');
  });

  it('exposes an implicit button role', async () => {
    const el = await mount(new GhButton());
    expect(el.shadowRoot?.querySelector('button')).not.toBeNull();
  });

  it('reflects the variant attribute', async () => {
    const el = await mount(new GhButton());
    el.variant = 'danger';
    await el.updateComplete;
    expect(el.getAttribute('variant')).toBe('danger');
  });

  it('fires click when activated', async () => {
    const el = await mount(new GhButton());
    const onClick = vi.fn();
    el.addEventListener('click', onClick);
    el.shadowRoot?.querySelector('button')?.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not emit click when disabled', async () => {
    const el = await mount(new GhButton());
    el.disabled = true;
    await el.updateComplete;
    const onClick = vi.fn();
    el.addEventListener('click', onClick);
    el.shadowRoot?.querySelector('button')?.click();
    expect(onClick).not.toHaveBeenCalled();
    expect(el.shadowRoot?.querySelector('button')?.disabled).toBe(true);
  });

  it('requests submit on the associated form when type="submit"', async () => {
    const form = document.createElement('form');
    const el = new GhButton();
    el.type = 'submit';
    form.append(el);
    document.body.append(form);
    await el.updateComplete;
    const requestSubmit = vi.spyOn(form, 'requestSubmit').mockImplementation(() => {});
    el.shadowRoot?.querySelector('button')?.click();
    expect(requestSubmit).toHaveBeenCalledTimes(1);
  });

  it('draws a sketchy outline once sized', async () => {
    const el = await mount(new GhButton());
    await setSize(el, 140, 44);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length).toBeGreaterThan(0);
  });
});

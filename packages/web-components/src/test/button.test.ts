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

  describe('as a link (href)', () => {
    it('renders an <a href> instead of a <button> when href is set', async () => {
      const el = await mount(new GhButton());
      el.href = '/ko/';
      await el.updateComplete;
      const anchor = el.shadowRoot?.querySelector('a');
      expect(anchor).not.toBeNull();
      expect(anchor?.getAttribute('href')).toBe('/ko/');
      expect(el.shadowRoot?.querySelector('button')).toBeNull();
    });

    it('exposes the slotted label inside the anchor', async () => {
      const el = new GhButton();
      el.href = '/ko/';
      el.textContent = '한국어';
      await mount(el);
      await el.updateComplete;
      expect(el.shadowRoot?.querySelector('a .label')).not.toBeNull();
      expect(el.textContent).toBe('한국어');
    });

    it('forwards target and rel to the anchor, omitting them when unset', async () => {
      const el = await mount(new GhButton());
      el.href = 'https://example.com/';
      el.target = '_blank';
      el.rel = 'noopener';
      await el.updateComplete;
      const anchor = el.shadowRoot?.querySelector('a');
      expect(anchor?.getAttribute('target')).toBe('_blank');
      expect(anchor?.getAttribute('rel')).toBe('noopener');

      const plain = await mount(new GhButton());
      plain.href = '/ko/';
      await plain.updateComplete;
      const plainAnchor = plain.shadowRoot?.querySelector('a');
      expect(plainAnchor?.hasAttribute('target')).toBe(false);
      expect(plainAnchor?.hasAttribute('rel')).toBe(false);
    });

    it('moves semantics to the inner <a> when it becomes a link', async () => {
      const el = await mount(new GhButton());
      expect(el.shadowRoot?.querySelector('button')).not.toBeNull();
      el.href = '/ko/';
      await el.updateComplete;
      // The link's role now comes from the inner <a>, not a host role="button".
      expect(el.shadowRoot?.querySelector('a')).not.toBeNull();
      expect(el.shadowRoot?.querySelector('button')).toBeNull();
    });

    it('still renders a <button> when disabled even if href is set', async () => {
      const el = await mount(new GhButton());
      el.href = '/ko/';
      el.disabled = true;
      await el.updateComplete;
      expect(el.shadowRoot?.querySelector('a')).toBeNull();
      expect(el.shadowRoot?.querySelector('button')?.disabled).toBe(true);
    });

    it('reverts to a <button> when href is cleared', async () => {
      const el = await mount(new GhButton());
      el.href = '/ko/';
      await el.updateComplete;
      expect(el.shadowRoot?.querySelector('a')).not.toBeNull();
      el.href = undefined;
      await el.updateComplete;
      expect(el.shadowRoot?.querySelector('a')).toBeNull();
      expect(el.shadowRoot?.querySelector('button')).not.toBeNull();
    });
  });
});

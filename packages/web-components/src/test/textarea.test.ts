import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhTextarea } from '../components/textarea.js';
import { cleanup, mount, setSize } from './fixture.js';

function typeInto(el: GhTextarea, value: string): void {
  const textarea = el.shadowRoot?.querySelector('textarea');
  if (!textarea) {
    throw new Error('textarea not rendered');
  }
  textarea.value = value;
  textarea.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
}

function mockScrollHeight(el: HTMLElement, value: number): void {
  Object.defineProperty(el, 'scrollHeight', { configurable: true, value });
}

describe('gh-textarea', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-textarea')).toBe(GhTextarea);
  });

  it('renders a native textarea', async () => {
    const el = await mount(new GhTextarea());
    expect(el.shadowRoot?.querySelector('textarea')).not.toBeNull();
  });

  it('associates a visible label with the textarea', async () => {
    const el = await mount(new GhTextarea());
    el.label = 'Bio';
    await el.updateComplete;
    const label = el.shadowRoot?.querySelector('label');
    const textarea = el.shadowRoot?.querySelector('textarea');
    expect(label?.getAttribute('for')).toBe(textarea?.id);
  });

  it('falls back to an aria-label from the placeholder', async () => {
    const el = await mount(new GhTextarea());
    el.placeholder = 'Tell us about yourself';
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('textarea')?.getAttribute('aria-label')).toBe(
      'Tell us about yourself',
    );
  });

  it('updates value and emits input on typing', async () => {
    const el = await mount(new GhTextarea());
    const onInput = vi.fn();
    el.addEventListener('input', onInput);
    typeInto(el, 'hello');
    expect(el.value).toBe('hello');
    expect(onInput).toHaveBeenCalled();
  });

  it('is form-associated (resolves its owning form)', async () => {
    const form = document.createElement('form');
    const el = new GhTextarea();
    el.name = 'bio';
    form.append(el);
    document.body.append(form);
    await el.updateComplete;
    typeInto(el, 'hello world');
    expect(el.form).toBe(form);
    expect(el.value).toBe('hello world');
  });

  it('reports a valueMissing validity error when required and empty', async () => {
    const el = await mount(new GhTextarea());
    el.required = true;
    await el.updateComplete;
    expect(el.validity.valueMissing).toBe(true);
    typeInto(el, 'x');
    await el.updateComplete;
    expect(el.validity.valueMissing).toBe(false);
  });

  it('restores its authored default value via the form reset callback', async () => {
    const el = new GhTextarea();
    el.value = 'initial';
    await mount(el);
    typeInto(el, 'edited');
    expect(el.value).toBe('edited');
    el.formResetCallback();
    await el.updateComplete;
    expect(el.value).toBe('initial');
  });

  it('mirrors the form-disabled callback to the disabled property', async () => {
    const el = await mount(new GhTextarea());
    el.formDisabledCallback(true);
    await el.updateComplete;
    expect(el.disabled).toBe(true);
  });

  it('draws a sketchy outline once sized', async () => {
    const el = await mount(new GhTextarea());
    await setSize(el, 220, 60);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length).toBeGreaterThan(0);
  });

  it('grows to fit its content when autoResize is set', async () => {
    const el = await mount(new GhTextarea());
    el.autoResize = true;
    await el.updateComplete;
    const textarea = el.shadowRoot?.querySelector('textarea');
    if (!textarea) {
      throw new Error('textarea not rendered');
    }
    mockScrollHeight(textarea, 120);
    typeInto(el, 'line1\nline2\nline3');
    await el.updateComplete;
    expect(textarea.style.height).toBe('120px');
  });

  it('does not touch height when autoResize is unset', async () => {
    const el = await mount(new GhTextarea());
    const textarea = el.shadowRoot?.querySelector('textarea');
    if (!textarea) {
      throw new Error('textarea not rendered');
    }
    mockScrollHeight(textarea, 120);
    typeInto(el, 'line1\nline2\nline3');
    await el.updateComplete;
    expect(textarea.style.height).toBe('');
  });

  it('resets the JS-set height back to the rows-based default when autoResize toggles off', async () => {
    const el = await mount(new GhTextarea());
    el.autoResize = true;
    await el.updateComplete;
    const textarea = el.shadowRoot?.querySelector('textarea');
    if (!textarea) {
      throw new Error('textarea not rendered');
    }
    mockScrollHeight(textarea, 200);
    typeInto(el, 'line1\nline2\nline3');
    await el.updateComplete;
    expect(textarea.style.height).toBe('200px');

    el.autoResize = false;
    await el.updateComplete;
    expect(textarea.style.height).toBe('');
  });

  it('syncs height on mount when autoResize is set (not just after the first keystroke)', async () => {
    const el = new GhTextarea();
    el.autoResize = true;
    el.value = 'line1\nline2\nline3';
    await mount(el);
    const textarea = el.shadowRoot?.querySelector('textarea');
    // jsdom's scrollHeight is always 0, but a non-empty height proves the sync
    // ran on mount — before this fix it stayed unset until the user's first keystroke.
    expect(textarea?.style.height).toBe('0px');
  });
});

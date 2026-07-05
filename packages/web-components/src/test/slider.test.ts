import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhSlider } from '../components/slider.js';
import { cleanup, mount, setSize } from './fixture.js';

function inputEl(el: GhSlider): HTMLInputElement {
  const input = el.shadowRoot?.querySelector('input');
  if (!input) {
    throw new Error('input not rendered');
  }
  return input;
}

function setInputValue(el: GhSlider, value: string): void {
  const input = inputEl(el);
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
}

describe('gh-slider', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-slider')).toBe(GhSlider);
  });

  it('renders a native input with type=range', async () => {
    const el = await mount(new GhSlider());
    expect(inputEl(el).type).toBe('range');
  });

  it('defaults min/max/step to 0/100/1', async () => {
    const el = await mount(new GhSlider());
    const input = inputEl(el);
    expect(input.min).toBe('0');
    expect(input.max).toBe('100');
    expect(input.step).toBe('1');
  });

  it('reaches custom min/max/step as native attributes', async () => {
    const el = new GhSlider();
    el.min = 10;
    el.max = 20;
    el.step = 5;
    await mount(el);
    const input = inputEl(el);
    expect(input.min).toBe('10');
    expect(input.max).toBe('20');
    expect(input.step).toBe('5');
  });

  it('associates a visible label with the input', async () => {
    const el = await mount(new GhSlider());
    el.label = 'Volume';
    await el.updateComplete;
    const label = el.shadowRoot?.querySelector('label');
    expect(label?.getAttribute('for')).toBe(inputEl(el).id);
  });

  it('updates value and emits input/change on native interaction', async () => {
    const el = await mount(new GhSlider());
    const onInput = vi.fn();
    const onChange = vi.fn();
    el.addEventListener('input', onInput);
    el.addEventListener('change', onChange);

    setInputValue(el, '60');
    await el.updateComplete;
    expect(el.value).toBe(60);
    expect(onInput).toHaveBeenCalled();

    inputEl(el).dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    expect(onChange).toHaveBeenCalled();
  });

  it('is form-associated (resolves its owning form)', async () => {
    const form = document.createElement('form');
    const el = new GhSlider();
    el.name = 'volume';
    form.append(el);
    document.body.append(form);
    await el.updateComplete;
    expect(el.form).toBe(form);
  });

  it('restores its authored default value via the form reset callback', async () => {
    const el = new GhSlider();
    el.value = 20;
    await mount(el);
    setInputValue(el, '80');
    await el.updateComplete;
    expect(el.value).toBe(80);
    el.formResetCallback();
    await el.updateComplete;
    expect(el.value).toBe(20);
  });

  it('mirrors the form-disabled callback to the disabled property', async () => {
    const el = await mount(new GhSlider());
    el.formDisabledCallback(true);
    await el.updateComplete;
    expect(el.disabled).toBe(true);
  });

  it('resyncs the form value when `value` is set programmatically', async () => {
    // jsdom's `ElementInternals.setFormValue()` doesn't actually wire into
    // `FormData` (confirmed directly — a real jsdom limitation, not this
    // component), so this spies on the internal call itself rather than
    // reading it back through a real form submission.
    const el = await mount(new GhSlider());
    const internals = (el as unknown as { internals: ElementInternals }).internals;
    const setFormValueSpy = vi.spyOn(internals, 'setFormValue');

    el.value = 42;
    await el.updateComplete;
    expect(setFormValueSpy).toHaveBeenCalledWith('42');
  });

  it('clamps an out-of-range value to min/max', async () => {
    const el = new GhSlider();
    el.max = 100;
    await mount(el);

    el.value = 150;
    await el.updateComplete;
    expect(el.value).toBe(100);
    expect(inputEl(el).value).toBe('100');
  });

  it('draws a sketchy rail once sized', async () => {
    const el = await mount(new GhSlider());
    await setSize(el, 160, 24);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length).toBeGreaterThan(0);
  });

  it('moves the fill and thumb paths when value changes', async () => {
    const el = await mount(new GhSlider());
    await setSize(el, 160, 24);
    const thumbAtZero = el.shadowRoot?.querySelector('.thumb path')?.getAttribute('d');
    setInputValue(el, '80');
    await el.updateComplete;
    const thumbAtEighty = el.shadowRoot?.querySelector('.thumb path')?.getAttribute('d');
    expect(thumbAtEighty).not.toBe(thumbAtZero);
    expect(el.shadowRoot?.querySelector('.fill path')).not.toBeNull();
  });
});

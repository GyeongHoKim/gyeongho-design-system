import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhInputOtp, GhInputOtpCell } from '../components/input-otp.js';
import { cleanup, mount, setSize } from './fixture.js';

function inputs(el: GhInputOtp): HTMLInputElement[] {
  return [...(el.shadowRoot?.querySelectorAll<HTMLInputElement>('.cell input') ?? [])];
}

function cells(el: GhInputOtp): GhInputOtpCell[] {
  return [...(el.shadowRoot?.querySelectorAll<GhInputOtpCell>('gh-input-otp-cell') ?? [])];
}

async function type(el: GhInputOtp, index: number, char: string): Promise<void> {
  const input = inputs(el)[index];
  input.value = char;
  input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  await el.updateComplete;
}

describe('gh-input-otp', () => {
  afterEach(cleanup);

  it('registers the element and its internal cell', () => {
    expect(customElements.get('gh-input-otp')).toBe(GhInputOtp);
    expect(customElements.get('gh-input-otp-cell')).toBe(GhInputOtpCell);
  });

  it('renders `length` cells (default 6)', async () => {
    const el = await mount(new GhInputOtp());
    expect(inputs(el)).toHaveLength(6);
    const four = await mount(new GhInputOtp());
    four.length = 4;
    await four.updateComplete;
    expect(inputs(four)).toHaveLength(4);
  });

  it('exposes a labelled group', async () => {
    const el = await mount(new GhInputOtp());
    const group = el.shadowRoot?.querySelector('[role="group"]');
    expect(group?.getAttribute('aria-label')).toBe('One-time code');
    expect(inputs(el)[0].getAttribute('aria-label')).toBe('Digit 1');
  });

  it('advances to the next cell as characters are typed and emits gh-change', async () => {
    const el = await mount(new GhInputOtp());
    const changed = vi.fn();
    el.addEventListener('gh-change', changed);
    await type(el, 0, '1');
    expect(el.value).toBe('1');
    expect((changed.mock.calls[0][0] as CustomEvent).detail).toEqual({ value: '1' });
    await type(el, 1, '2');
    expect(el.value).toBe('12');
  });

  it('ignores non-numeric input in numeric mode but accepts it in text mode', async () => {
    const numeric = await mount(new GhInputOtp());
    await type(numeric, 0, 'a');
    expect(numeric.value).toBe('');

    const text = await mount(new GhInputOtp());
    text.mode = 'text';
    await text.updateComplete;
    await type(text, 0, 'a');
    expect(text.value).toBe('a');
  });

  it('deletes the last character on Backspace', async () => {
    const el = await mount(new GhInputOtp());
    el.value = '123';
    await el.updateComplete;
    inputs(el)[2].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, composed: true }),
    );
    await el.updateComplete;
    expect(el.value).toBe('12');
  });

  it('distributes a pasted code across cells and fires gh-complete when full', async () => {
    const el = await mount(new GhInputOtp());
    el.length = 4;
    await el.updateComplete;
    const completed = vi.fn();
    el.addEventListener('gh-complete', completed);
    const paste = new Event('paste', { bubbles: true, composed: true }) as ClipboardEvent;
    Object.defineProperty(paste, 'clipboardData', {
      value: { getData: () => '4821' },
    });
    inputs(el)[0].dispatchEvent(paste);
    await el.updateComplete;
    expect(el.value).toBe('4821');
    expect((completed.mock.calls[0][0] as CustomEvent).detail).toEqual({ value: '4821' });
  });

  it('reflects disabled and invalid, and flags every cell danger when invalid', async () => {
    const el = await mount(new GhInputOtp());
    el.disabled = true;
    el.invalid = true;
    await el.updateComplete;
    expect(el.hasAttribute('disabled')).toBe(true);
    expect(el.hasAttribute('invalid')).toBe(true);
    expect(cells(el).every((cell) => cell.getAttribute('state') === 'danger')).toBe(true);
  });

  it('marks filled cells and draws each cell border once measured', async () => {
    const el = await mount(new GhInputOtp());
    el.value = '12';
    await el.updateComplete;
    const all = cells(el);
    // Cell 0 is the focused (active) cell by default; cell 1 is filled, the rest default.
    expect(all[0].getAttribute('state')).toBe('active');
    expect(all[1].getAttribute('state')).toBe('filled');
    expect(all[2].getAttribute('state')).toBe('default');
    await setSize(all[1], 40, 40);
    expect(all[1].shadowRoot?.querySelectorAll('path.sketch-stroke').length ?? 0).toBeGreaterThan(
      0,
    );
  });
});

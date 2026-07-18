import { afterEach, describe, expect, it } from 'vitest';
import { GhResizableGroup } from '../components/resizable-group.js';
import { GhResizableHandle } from '../components/resizable-handle.js';
import { GhResizablePanel } from '../components/resizable-panel.js';
import { cleanup, mount, setSize } from './fixture.js';

async function mountGroup(props: Partial<GhResizableGroup> = {}): Promise<GhResizableGroup> {
  const el = new GhResizableGroup();
  el.innerHTML = `
    <gh-resizable-panel>A</gh-resizable-panel>
    <gh-resizable-handle></gh-resizable-handle>
    <gh-resizable-panel>B</gh-resizable-panel>
  `;
  Object.assign(el, props);
  await mount(el);
  await el.updateComplete;
  // Allow the slotchange-driven layout to settle.
  await el.updateComplete;
  return el;
}

function panels(el: GhResizableGroup): GhResizablePanel[] {
  return [...el.querySelectorAll<GhResizablePanel>('gh-resizable-panel')];
}

function handle(el: GhResizableGroup): GhResizableHandle {
  const found = el.querySelector<GhResizableHandle>('gh-resizable-handle');
  if (!found) {
    throw new Error('missing handle');
  }
  return found;
}

describe('gh-resizable', () => {
  afterEach(cleanup);

  it('registers the group, panel and handle elements', () => {
    expect(customElements.get('gh-resizable-group')).toBe(GhResizableGroup);
    expect(customElements.get('gh-resizable-panel')).toBe(GhResizablePanel);
    expect(customElements.get('gh-resizable-handle')).toBe(GhResizableHandle);
  });

  it('lays panels out with equal flex-basis percentages', async () => {
    const el = await mountGroup();
    const [a, b] = panels(el);
    expect(a.style.flexBasis).toBe('50%');
    expect(b.style.flexBasis).toBe('50%');
  });

  it('honours defaultSize, normalised to 100%', async () => {
    const el = new GhResizableGroup();
    el.innerHTML = `
      <gh-resizable-panel default-size="30">A</gh-resizable-panel>
      <gh-resizable-handle></gh-resizable-handle>
      <gh-resizable-panel default-size="70">B</gh-resizable-panel>
    `;
    await mount(el);
    await el.updateComplete;
    await el.updateComplete;
    const [a, b] = panels(el);
    expect(a.style.flexBasis).toBe('30%');
    expect(b.style.flexBasis).toBe('70%');
  });

  it('exposes the handle as a focusable separator with live aria values', async () => {
    const el = await mountGroup();
    const h = handle(el);
    expect(h.getAttribute('role')).toBe('separator');
    expect(h.getAttribute('tabindex')).toBe('0');
    // A horizontal group's divider is a vertical separator.
    expect(h.getAttribute('aria-orientation')).toBe('vertical');
    expect(h.getAttribute('aria-valuemin')).toBe('0');
    expect(h.getAttribute('aria-valuemax')).toBe('100');
    expect(h.getAttribute('aria-valuenow')).toBe('50');
  });

  it('resizes the neighbouring pair on arrow-key press, keeping their sum constant', async () => {
    const el = await mountGroup();
    handle(el).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }),
    );
    await el.updateComplete;
    const [a, b] = panels(el);
    expect(a.style.flexBasis).toBe('55%');
    expect(b.style.flexBasis).toBe('45%');
  });

  it('clamps a resize to the panel minSize/maxSize bounds', async () => {
    const el = new GhResizableGroup();
    el.innerHTML = `
      <gh-resizable-panel min-size="40" max-size="60">A</gh-resizable-panel>
      <gh-resizable-handle></gh-resizable-handle>
      <gh-resizable-panel min-size="40" max-size="60">B</gh-resizable-panel>
    `;
    await mount(el);
    await el.updateComplete;
    await el.updateComplete;
    const h = handle(el);
    // Three +5 steps would reach 65% without clamping; maxSize caps A at 60%.
    for (let i = 0; i < 3; i++) {
      h.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }),
      );
      await el.updateComplete;
    }
    const [a, b] = panels(el);
    expect(a.style.flexBasis).toBe('60%');
    expect(b.style.flexBasis).toBe('40%');
  });

  it('draws the sketch divider line once measured', async () => {
    const el = await mountGroup();
    const h = handle(el);
    await setSize(h, 8, 200);
    expect(h.shadowRoot?.querySelectorAll('path.sketch-stroke').length ?? 0).toBeGreaterThan(0);
  });

  it('reflects a vertical direction and reorients the divider', async () => {
    const el = await mountGroup({ direction: 'vertical' });
    await el.updateComplete;
    expect(el.getAttribute('direction')).toBe('vertical');
    expect(handle(el).getAttribute('aria-orientation')).toBe('horizontal');
  });
});

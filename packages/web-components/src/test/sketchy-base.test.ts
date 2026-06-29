import { afterEach, describe, expect, it } from 'vitest';
import { GhButton } from '../components/button.js';
import { cleanup, mount, setSize } from './fixture.js';

function strokeData(el: GhButton): string[] {
  const paths = el.shadowRoot?.querySelectorAll<SVGPathElement>('path.sketch-stroke') ?? [];
  return Array.from(paths, (p) => p.getAttribute('d') ?? '');
}

describe('SketchyBase', () => {
  afterEach(cleanup);

  it('renders an empty sketch overlay until measured', async () => {
    const el = await mount(new GhButton());
    expect(el.shadowRoot?.querySelector('svg.sketch')).not.toBeNull();
    expect(strokeData(el).length).toBe(0);
  });

  it('injects sketch <path> elements once a non-zero size is measured', async () => {
    const el = await mount(new GhButton());
    await setSize(el, 160, 44);
    expect(el.shadowRoot?.querySelector('svg.sketch')).not.toBeNull();
    expect(strokeData(el).length).toBeGreaterThan(0);
  });

  it('is deterministic: same seed + size produces identical geometry', async () => {
    const a = new GhButton();
    a.seed = 42;
    const b = new GhButton();
    b.seed = 42;
    await mount(a);
    await mount(b);
    await setSize(a, 120, 40);
    await setSize(b, 120, 40);
    expect(strokeData(a)).toEqual(strokeData(b));
  });

  it('does not regenerate geometry on unrelated re-renders (no jitter)', async () => {
    const el = await mount(new GhButton());
    el.seed = 7;
    await setSize(el, 120, 40);
    const before = strokeData(el);
    el.variant = 'danger';
    await el.updateComplete;
    expect(strokeData(el)).toEqual(before);
  });

  it('regenerates geometry when the measured size changes', async () => {
    const el = await mount(new GhButton());
    el.seed = 7;
    await setSize(el, 120, 40);
    const before = strokeData(el);
    await setSize(el, 200, 60);
    expect(strokeData(el)).not.toEqual(before);
  });

  it('keeps a stable auto seed across re-renders when none is provided', async () => {
    const el = await mount(new GhButton());
    await setSize(el, 120, 40);
    const before = strokeData(el);
    el.requestUpdate();
    await el.updateComplete;
    expect(strokeData(el)).toEqual(before);
  });
});

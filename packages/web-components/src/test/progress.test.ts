import { afterEach, describe, expect, it } from 'vitest';
import { GhProgress } from '../components/progress.js';
import { cleanup, mount, setSize } from './fixture.js';

describe('gh-progress', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-progress')).toBe(GhProgress);
  });

  it('exposes a determinate progressbar with aria values', async () => {
    const el = await mount(new GhProgress());
    el.value = 40;
    el.label = 'Upload';
    await el.updateComplete;
    expect(el.getAttribute('role')).toBe('progressbar');
    expect(el.getAttribute('aria-valuenow')).toBe('40');
    expect(el.getAttribute('aria-valuemin')).toBe('0');
    expect(el.getAttribute('aria-valuemax')).toBe('100');
    expect(el.getAttribute('aria-label')).toBe('Upload');
  });

  it('respects a custom max', async () => {
    const el = await mount(new GhProgress());
    el.value = 3;
    el.max = 5;
    await el.updateComplete;
    expect(el.getAttribute('aria-valuemax')).toBe('5');
    expect(el.getAttribute('aria-valuenow')).toBe('3');
  });

  it('omits aria-valuenow when indeterminate', async () => {
    const el = await mount(new GhProgress());
    await el.updateComplete;
    expect(el.hasAttribute('aria-valuenow')).toBe(false);
  });

  it('draws rail and fill sketch layers once measured', async () => {
    const el = await mount(new GhProgress());
    el.value = 50;
    await el.updateComplete;
    await setSize(el, 200, 8);
    const strokes = el.shadowRoot?.querySelectorAll('path.rail-stroke, path.bar-stroke');
    expect(strokes?.length ?? 0).toBeGreaterThan(0);
  });
});

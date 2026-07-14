import { afterEach, describe, expect, it } from 'vitest';
import { GhChart } from '../components/chart.js';
import { cleanup, mount, setSize } from './fixture.js';

const SERIES = [
  { name: 'Revenue', values: [10, 20, 15, 30] },
  { name: 'Cost', values: [5, 12, 8, 18] },
];
const LABELS = ['Q1', 'Q2', 'Q3', 'Q4'];

async function mountChart(type: 'bar' | 'line'): Promise<GhChart> {
  const el = new GhChart();
  el.type = type;
  el.series = SERIES;
  el.labels = LABELS;
  await mount(el);
  await setSize(el, 400, 240);
  return el;
}

describe('gh-chart', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-chart')).toBe(GhChart);
  });

  it('exposes an img role with an accessible label', async () => {
    const el = await mountChart('bar');
    // biome-ignore lint/suspicious/noExplicitAny: reading ElementInternals in test
    const internals = (el as any).internals as ElementInternals;
    expect(internals.role).toBe('img');
    expect(internals.ariaLabel).toContain('Revenue');
  });

  it('draws sketchy bars for a bar chart', async () => {
    const el = await mountChart('bar');
    expect(el.shadowRoot?.querySelectorAll('.series-stroke').length).toBeGreaterThan(0);
    expect(el.shadowRoot?.querySelectorAll('.grid path').length).toBeGreaterThan(0);
    expect(el.shadowRoot?.querySelectorAll('text.label').length).toBe(4);
  });

  it('draws sketchy line segments and dots for a line chart', async () => {
    const el = await mountChart('line');
    expect(el.shadowRoot?.querySelectorAll('.series-stroke').length).toBeGreaterThan(0);
    expect(el.shadowRoot?.querySelectorAll('.series-dot').length).toBeGreaterThan(0);
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chart, type ChartSeries } from './Chart.js';

const SERIES: ChartSeries[] = [
  { name: 'Revenue', data: [4, 8, 6, 10] },
  { name: 'Cost', data: [2, 5, 3, 7] },
];

describe('Chart', () => {
  it('renders a labelled bar chart as an image', () => {
    render(<Chart type="bar" series={SERIES} aria-label="Quarterly figures" />);
    const svg = screen.getByRole('img', { name: 'Quarterly figures' });
    expect(svg).toBeInTheDocument();
    // Bars: 2 series x 4 points = 8 filled shapes, each with >=1 fill path.
    expect(svg.querySelectorAll('path[fill]:not([fill="none"])').length).toBeGreaterThan(0);
  });

  it('renders a line chart with sketchy stroke paths', () => {
    render(<Chart type="line" series={SERIES} aria-label="Trend" />);
    const svg = screen.getByRole('img', { name: 'Trend' });
    expect(svg.querySelectorAll('path[stroke]:not([stroke="none"])').length).toBeGreaterThan(0);
  });

  it('renders category labels and a legend', () => {
    render(
      <Chart
        type="bar"
        series={SERIES}
        categories={['Q1', 'Q2', 'Q3', 'Q4']}
        aria-label="Quarterly figures"
      />,
    );
    expect(screen.getByText('Q1')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Cost')).toBeInTheDocument();
  });

  it('is deterministic across renders (fixed seed)', () => {
    const { container: a } = render(<Chart type="bar" series={SERIES} aria-label="A" />);
    const { container: b } = render(<Chart type="bar" series={SERIES} aria-label="A" />);
    const first = a.querySelector('path')?.getAttribute('d');
    const second = b.querySelector('path')?.getAttribute('d');
    expect(first).toBe(second);
  });
});

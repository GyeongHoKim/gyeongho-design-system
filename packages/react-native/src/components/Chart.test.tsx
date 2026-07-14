import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { darkTheme, renderWithTheme } from '../test-utils.js';
import { Chart, type ChartDatum } from './Chart.js';

const DATA: ChartDatum[] = [
  { label: 'Jan', value: 12 },
  { label: 'Feb', value: 19 },
  { label: 'Mar', value: 7 },
];

describe('Chart', () => {
  it('renders a bar chart with its axis labels', () => {
    renderWithTheme(
      <Chart type="bar" data={DATA} accessibilityLabel="Monthly signups" testID="chart" />,
    );
    expect(screen.getByTestId('chart')).toHaveAttribute('aria-label', 'Monthly signups');
    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('Mar')).toBeInTheDocument();
  });

  it('renders a line chart in dark theme', () => {
    renderWithTheme(<Chart type="line" data={DATA} series={3} testID="chart" />, darkTheme);
    expect(screen.getByTestId('chart')).toBeInTheDocument();
    expect(screen.getByText('Feb')).toBeInTheDocument();
  });

  it('renders without error for empty data', () => {
    renderWithTheme(<Chart type="bar" data={[]} testID="chart" />);
    expect(screen.getByTestId('chart')).toBeInTheDocument();
  });
});

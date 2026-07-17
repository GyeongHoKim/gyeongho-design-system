import { Chart, type ChartSeries } from '@ghds/react/chart';
import type { Meta, StoryObj } from '@storybook/react-vite';

const SERIES: ChartSeries[] = [
  { name: 'Revenue', data: [4, 8, 6, 10, 7] },
  { name: 'Cost', data: [2, 5, 3, 7, 4] },
];

const CATEGORIES = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'];

const meta = {
  title: 'Components/Chart',
  component: Chart,
  argTypes: {
    type: { control: 'inline-radio', options: ['bar', 'line'] },
  },
} satisfies Meta<typeof Chart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Bar: Story = {
  args: { type: 'bar', series: SERIES, categories: CATEGORIES, 'aria-label': 'Quarterly figures' },
};

export const Line: Story = {
  args: { type: 'line', series: SERIES, categories: CATEGORIES, 'aria-label': 'Quarterly trend' },
};

export const SingleSeries: Story = {
  args: {
    type: 'bar',
    series: [{ name: 'Visitors', data: [12, 19, 7, 22, 16, 25] }],
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    'aria-label': 'Weekly visitors',
  },
};

export const OnDarkSurface: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <Chart type="line" series={SERIES} categories={CATEGORIES} aria-label="Quarterly trend" />
    </div>
  ),
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Spinner, type SpinnerSize } from './Spinner.js';

const SIZES: SpinnerSize[] = ['sm', 'md', 'lg'];

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
  },
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Loading' },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sys-spacing-md)' }}>
      {SIZES.map((size) => (
        <Spinner key={size} size={size} label={`Loading ${size}`} />
      ))}
    </div>
  ),
};

export const OnOpaqueSurfaceDark: Story = {
  args: { size: 'lg' },
  render: (args) => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <Spinner {...args} />
    </div>
  ),
};

export const AnnouncesBusyState: Story = {
  args: { label: 'Loading results' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status', { name: 'Loading results' })).toBeInTheDocument();
  },
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Progress } from './Progress.js';

const meta = {
  title: 'Components/Progress',
  component: Progress,
  args: { label: 'Uploading' },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Progress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Determinate: Story = {
  args: { value: 60 },
};

export const Empty: Story = {
  args: { value: 0 },
};

export const Complete: Story = {
  args: { value: 100 },
};

export const Indeterminate: Story = {
  args: { value: undefined },
};

export const OnOpaqueSurfaceDark: Story = {
  args: { value: 60 },
  render: (args) => (
    <div
      data-theme="dark"
      style={{
        width: 320,
        background: 'var(--sys-color-bg-surface)',
        padding: 'var(--sys-spacing-lg)',
      }}
    >
      <Progress {...args} />
    </div>
  ),
};

export const HasProgressbarRole: Story = {
  args: { value: 40, label: 'Upload progress' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('progressbar', { name: 'Upload progress' })).toBeInTheDocument();
  },
};

import { Button, Tooltip } from '@ghds/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  decorators: [
    (Story) => (
      <div style={{ padding: 80, display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: 'Saves your changes',
    children: <Button>Save</Button>,
  },
};

export const Dark: Story = {
  args: {
    content: 'Saves your changes',
    children: <Button>Save</Button>,
  },
  decorators: [
    (Story) => (
      <div
        data-theme="dark"
        style={{
          background: 'var(--sys-color-bg-canvas)',
          padding: 80,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export const OnFocus: Story = {
  args: {
    content: 'Helpful hint',
    children: <Button variant="neutral">Focus me</Button>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('tooltip')).toHaveTextContent('Helpful hint');
  },
};

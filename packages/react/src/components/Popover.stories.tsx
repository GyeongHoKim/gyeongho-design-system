import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button.js';
import { Popover } from './Popover.js';

const meta = {
  title: 'Components/Popover',
  component: Popover,
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ padding: 'var(--sys-spacing-2xl)' }}>
      <Popover trigger={<Button>Open popover</Button>} aria-label="Profile">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sys-spacing-sm)' }}>
          <strong>Dimensions</strong>
          <span>Set the width and height of the panel.</span>
          <Button variant="neutral">Apply</Button>
        </div>
      </Popover>
    </div>
  ),
};

export const OnDarkSurface: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-2xl)' }}
    >
      <Popover trigger={<Button>Open popover</Button>} aria-label="Profile">
        <span style={{ color: 'var(--sys-color-text-primary)' }}>Dark-mode content</span>
      </Popover>
    </div>
  ),
};

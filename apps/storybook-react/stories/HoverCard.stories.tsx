import { Button } from '@ghds/react/button';
import { HoverCard } from '@ghds/react/hover-card';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/HoverCard',
  component: HoverCard,
} satisfies Meta<typeof HoverCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ padding: 'var(--sys-spacing-2xl)' }}>
      <HoverCard trigger={<Button variant="neutral">@ghds</Button>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sys-spacing-xs)' }}>
          <strong>GHDS</strong>
          <span>A hand-drawn cross-platform design system.</span>
        </div>
      </HoverCard>
    </div>
  ),
};

export const OnDarkSurface: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-2xl)' }}
    >
      <HoverCard trigger={<Button variant="neutral">@ghds</Button>}>
        <span style={{ color: 'var(--sys-color-text-primary)' }}>Dark-mode hover card.</span>
      </HoverCard>
    </div>
  ),
};

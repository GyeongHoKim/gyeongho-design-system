import { Bubble, type BubbleVariant } from '@ghds/react/bubble';
import type { Meta, StoryObj } from '@storybook/react-vite';

const VARIANTS: BubbleVariant[] = ['received', 'sent'];

const meta = {
  title: 'Components/Bubble',
  component: Bubble,
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
  },
  args: { variant: 'received', children: 'Hey — are we still on for tomorrow?' },
} satisfies Meta<typeof Bubble>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Received: Story = {
  args: { variant: 'received' },
};

export const Sent: Story = {
  args: { variant: 'sent', children: 'Yes! See you at 10.' },
};

/** Long text wraps within the bubble's max width rather than overflowing. */
export const LongText: Story = {
  args: {
    variant: 'received',
    style: { maxWidth: 320 },
    children:
      'This is a much longer message that should wrap onto several lines inside the bubble, keeping the sketchy box snug around the text.',
  },
};

export const BothVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sys-spacing-sm)',
        maxWidth: 360,
      }}
    >
      <Bubble variant="received">Hey — are we still on for tomorrow?</Bubble>
      <div style={{ alignSelf: 'flex-end' }}>
        <Bubble variant="sent">Yes! See you at 10.</Bubble>
      </div>
    </div>
  ),
};

/** Visual-regression guard: both bubble fills stay scoped on an opaque dark surface. */
export const OnOpaqueSurfaceDark: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{
        background: 'var(--sys-color-bg-surface)',
        padding: 'var(--sys-spacing-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sys-spacing-sm)',
        maxWidth: 360,
      }}
    >
      <Bubble variant="received">Hey — are we still on for tomorrow?</Bubble>
      <div style={{ alignSelf: 'flex-end' }}>
        <Bubble variant="sent">Yes! See you at 10.</Bubble>
      </div>
    </div>
  ),
};

import { ScrollArea, type ScrollAreaOrientation } from '@ghds/react/scroll-area';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

const ORIENTATIONS: ScrollAreaOrientation[] = ['vertical', 'horizontal', 'both'];

const PARAGRAPHS = Array.from({ length: 8 }, (_, i) => i + 1);

/** A tall stack of paragraphs that overflows a constrained height. */
function LongContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sys-spacing-sm)' }}>
      {PARAGRAPHS.map((n) => (
        <p
          key={n}
          style={{
            margin: 0,
            color: 'var(--sys-color-text-primary)',
            fontFamily: 'var(--sys-typography-body-fontFamily)',
            fontSize: 'var(--sys-typography-body-fontSize)',
          }}
        >
          {n}. The quick brown fox jumps over the lazy dog, again and again until the box overflows.
        </p>
      ))}
    </div>
  );
}

const meta = {
  title: 'Components/ScrollArea',
  component: ScrollArea,
  argTypes: {
    orientation: { control: 'inline-radio', options: ORIENTATIONS },
  },
  args: {
    orientation: 'vertical',
    style: { maxHeight: 200, maxWidth: 360 },
    children: <LongContent />,
  },
} satisfies Meta<typeof ScrollArea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  args: { orientation: 'vertical', style: { maxHeight: 200, maxWidth: 360 } },
};

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
    style: { maxWidth: 360 },
    children: (
      <div style={{ display: 'flex', gap: 'var(--sys-spacing-sm)', width: 'max-content' }}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <div
            key={n}
            style={{
              flex: '0 0 auto',
              width: 120,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--sys-color-bg-muted)',
              color: 'var(--sys-color-text-secondary)',
              borderRadius: 'var(--sys-radius-md)',
              fontFamily: 'var(--sys-typography-label-fontFamily)',
            }}
          >
            Card {n}
          </div>
        ))}
      </div>
    ),
  },
};

export const Both: Story = {
  args: {
    orientation: 'both',
    style: { maxHeight: 200, maxWidth: 360 },
    children: (
      <div style={{ width: 640 }}>
        <LongContent />
      </div>
    ),
  },
};

/** The viewport actually scrolls: its scroll height exceeds its clientHeight. */
export const Scrolls: Story = {
  args: {
    orientation: 'vertical',
    style: { maxHeight: 160, maxWidth: 360 },
    'data-testid': 'scroll-root',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByTestId('scroll-root');
    // The scrollable viewport is the root's second child (after the sketch svg).
    const viewport = root.querySelector('div:last-of-type') as HTMLElement;
    await expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
  },
};

/** Visual-regression guard: sketch border + themed scrollbar on a dark surface. */
export const OnOpaqueSurfaceDark: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <ScrollArea orientation="vertical" style={{ maxHeight: 200, maxWidth: 360 }}>
        <LongContent />
      </ScrollArea>
    </div>
  ),
};

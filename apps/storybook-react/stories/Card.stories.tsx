import { Card } from '@ghds/react/card';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

const meta = {
  title: 'Components/Card',
  component: Card,
  argTypes: {
    fill: { control: 'inline-radio', options: ['solid', 'hachure'] },
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Solid: Story = {
  args: {
    fill: 'solid',
    style: { maxWidth: 320 },
    children: (
      <>
        <strong>Hand-drawn card</strong>
        <span>A sketchy surface rendered from sketch-core geometry.</span>
      </>
    ),
  },
};

export const Hachure: Story = {
  args: {
    fill: 'hachure',
    style: { maxWidth: 320 },
    children: (
      <>
        <strong>Hachure fill</strong>
        <span>The body is filled with sketched scan-lines.</span>
      </>
    ),
  },
};

/**
 * Visual-regression guard for GHD-44: the card sits inside an opaque-background
 * container (colors/spacing from `@ghds/tokens` CSS vars). If its root loses its
 * stacking context, the `z-index: -1` sketch outline paints behind this box and
 * disappears — flagged by Chromatic in both light and dark schemes.
 */
export const OnOpaqueSurface: Story = {
  args: {
    style: { maxWidth: 320 },
    children: <span>Sketch outline stays visible on an opaque surface.</span>,
  },
  render: (args) => (
    <div style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}>
      <Card {...args} />
    </div>
  ),
};

export const OnOpaqueSurfaceDark: Story = {
  args: {
    style: { maxWidth: 320 },
    children: <span>Sketch outline stays visible on a dark opaque surface.</span>,
  },
  render: (args) => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <Card {...args} />
    </div>
  ),
};

export const AsRegion: Story = {
  args: {
    role: 'region',
    'aria-label': 'Summary',
    style: { maxWidth: 320 },
    children: <span>Landmark region content.</span>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'Summary' })).toBeInTheDocument();
  },
};

type Variant = 'plain' | 'sticky' | 'lined';
type Fastener = 'none' | 'tape' | 'pin';

/** Top padding keeps the tape/pin overhang inside the story frame. */
const withOverhang = (node: React.ReactNode): React.JSX.Element => (
  <div style={{ paddingTop: 'var(--sys-spacing-3xl)' }}>{node}</div>
);

const paper = (variant: Variant, fastener: Fastener): Story => ({
  args: {
    variant,
    fastener,
    style: { maxWidth: 320 },
    children: (
      <>
        <strong>Paper card</strong>
        <span>Short note on paper.</span>
      </>
    ),
  },
  render: (args) => withOverhang(<Card {...args} />),
});

export const PlainNone: Story = paper('plain', 'none');
export const PlainTape: Story = paper('plain', 'tape');
export const PlainPin: Story = paper('plain', 'pin');
export const StickyNone: Story = paper('sticky', 'none');
export const StickyTape: Story = paper('sticky', 'tape');
export const StickyPin: Story = paper('sticky', 'pin');
export const LinedNone: Story = paper('lined', 'none');
export const LinedTape: Story = paper('lined', 'tape');
export const LinedPin: Story = paper('lined', 'pin');

const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const;

export const StickyTones: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 200px)',
        gap: 'var(--sys-spacing-lg)',
      }}
    >
      {tones.map((tone) => (
        <Card key={tone} variant="sticky" tone={tone}>
          <strong>{tone}</strong>
        </Card>
      ))}
    </div>
  ),
};

export const Tilt: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sys-spacing-xl)' }}>
      {(['sticky', 'lined'] as const).flatMap((variant) =>
        (['left', 'right'] as const).map((tilt) => (
          <Card key={`${variant}-${tilt}`} variant={variant} tilt={tilt} style={{ width: 180 }}>
            <strong>
              {variant} {tilt}
            </strong>
          </Card>
        )),
      )}
    </div>
  ),
};

export const Interactive: Story = {
  args: {
    variant: 'sticky',
    interactive: true,
    tabIndex: 0,
    style: { maxWidth: 320 },
    children: <span>Lifts on hover and on focus within.</span>,
  },
  render: (args) => withOverhang(<Card {...args} />),
};

/** Hovered state, for visual regression (storycap runs with reduced motion, so no transition to wait on). */
export const InteractiveHovered: Story = {
  ...Interactive,
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByText('Lifts on hover and on focus within.')
      .parentElement as HTMLElement;
    await userEvent.hover(card);
    await expect(card.style.transform).toContain('translateY');
  },
};

/**
 * Keyboard-focused state, for visual regression. A `tabIndex` card draws the
 * `comp.card.focus.ring` outline on itself, following the folded corner.
 */
export const InteractiveFocused: Story = {
  ...Interactive,
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByText('Lifts on hover and on focus within.')
      .parentElement as HTMLElement;
    await userEvent.tab();
    await expect(card).toHaveFocus();
    await expect(card.style.transform).toContain('translateY');
    await expect(card.style.outline).toContain('--comp-card-focus-ring');
    await expect(getComputedStyle(card).outlineStyle).toBe('solid');
  },
};

/**
 * A `tabIndex` card that is not `interactive` still draws the
 * `comp.card.focus.ring` outline on keyboard focus, but does not lift.
 */
export const FocusableFocused: Story = {
  args: {
    variant: 'sticky',
    tabIndex: 0,
    style: { maxWidth: 320 },
    children: <span>Focusable without interactive.</span>,
  },
  render: (args) => withOverhang(<Card {...args} />),
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByText('Focusable without interactive.')
      .parentElement as HTMLElement;
    await userEvent.tab();
    await expect(card).toHaveFocus();
    await expect(card.style.outline).toContain('--comp-card-focus-ring');
    await expect(card.style.transform).not.toContain('translateY');
  },
};

/** `asChild` with an `<a>` child: the whole card is one link. */
export const LinkCard: Story = {
  args: {
    asChild: true,
    style: { maxWidth: 320 },
    children: (
      <a href="#card-docs">
        <strong>Card docs</strong>
        <span>The whole card is one link.</span>
      </a>
    ),
  },
  render: (args) => withOverhang(<Card {...args} />),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: /Card docs/ });
    await expect(link).toHaveAttribute('href', '#card-docs');
    // The sketch draws once the card has been measured.
    await waitFor(() => expect(link.querySelector('svg')).not.toBeNull());
  },
};

export const LinkCardHovered: Story = {
  ...LinkCard,
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: /Card docs/ });
    await waitFor(() => expect(link.querySelector('svg')).not.toBeNull());
    await userEvent.hover(link);
    await expect(link.style.transform).toContain('translateY');
    const stroke = link.querySelector('svg path:last-of-type')?.getAttribute('stroke');
    await expect(stroke).toContain('--comp-card-stroke-hover');
  },
};

export const LinkCardFocused: Story = {
  ...LinkCard,
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: /Card docs/ });
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(link.style.outline).toContain('--comp-card-focus-ring');
    await expect(link.style.transform).toContain('translateY');
  },
};

export const LinkCardSticky: Story = {
  args: {
    asChild: true,
    variant: 'sticky',
    tone: 'info',
    fastener: 'pin',
    style: { maxWidth: 320 },
    children: (
      <a href="#tokens">
        <strong>Tokens</strong>
        <span>Design values for every platform.</span>
      </a>
    ),
  },
  render: (args) => withOverhang(<Card {...args} />),
};

export const Korean: Story = {
  args: {
    variant: 'lined',
    fastener: 'tape',
    style: { maxWidth: 320 },
    children: (
      <>
        <strong>오늘의 메모</strong>
        <span>우유와 달걀을 사요.</span>
      </>
    ),
  },
  render: (args) => withOverhang(<Card {...args} />),
};

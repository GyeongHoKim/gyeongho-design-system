import { expect } from 'storybook/test';
import '@ghds/web-components/card';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

interface CardArgs {
  elevated: boolean;
  label: string;
}

const meta: Meta<CardArgs> = {
  title: 'Components/Card',
  tags: ['autodocs'],
  render: (args) =>
    html`<gh-card
      ?elevated=${args.elevated}
      label=${args.label}
      style="max-width: 320px; display: block;"
    >
      <h3>Hand-drawn card</h3>
      <p>A sketchy surface that frames any content with a wobble that stays stable across re-renders.</p>
    </gh-card>`,
  args: {
    elevated: false,
    label: 'Example card',
  },
  argTypes: {
    elevated: { control: 'boolean' },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<CardArgs>;

export const Flat: Story = {};

export const Elevated: Story = {
  args: { elevated: true },
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector('gh-card');
    const shadows = host?.shadowRoot?.querySelectorAll('path.sketch-shadow') ?? [];
    await expect(shadows.length).toBeGreaterThan(0);
  },
};

/**
 * Content in the named `title` slot renders before the body with title styling.
 * The `lined` card uses a plain `<span>` so the play test proves the
 * `[slot='title']` rule itself (headings are also styled via `::slotted(h3)`).
 */
export const TitleSlot: Story = {
  render: () =>
    html`<div style="padding-top: var(--sys-spacing-3xl); display: flex; flex-wrap: wrap; gap: var(--sys-spacing-xl);">
      ${(['plain', 'sticky', 'lined'] as const).map(
        (variant) =>
          html`<gh-card
            variant=${variant}
            fastener="tape"
            label=${`${variant} card`}
            style="width: 220px; display: block;"
          >
            <p>Body text comes after the title.</p>
            ${
              variant === 'lined'
                ? html`<span slot="title">${variant} title</span>`
                : html`<h3 slot="title">${variant} title</h3>`
            }
          </gh-card>`,
      )}
    </div>`,
  play: async ({ canvasElement }) => {
    const cards = Array.from(canvasElement.querySelectorAll('gh-card'));
    await expect(cards.length).toBe(3);
    for (const card of cards) {
      const slot = card.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="title"]');
      await expect(slot?.assignedElements().length).toBe(1);
      const title = card.querySelector<HTMLElement>('[slot="title"]');
      await expect(title?.getBoundingClientRect().height ?? 0).toBeGreaterThan(0);
    }

    // Resolve the title tokens through a probe so the browser normalises the
    // expected values the same way as the slotted element's computed style.
    const probe = document.createElement('span');
    probe.style.fontFamily = 'var(--sys-typography-title-fontFamily)';
    probe.style.fontSize = 'var(--sys-typography-title-fontSize)';
    probe.style.fontWeight = 'var(--sys-typography-title-fontWeight)';
    canvasElement.append(probe);
    const expected = getComputedStyle(probe);
    const span = canvasElement.querySelector<HTMLElement>(
      'gh-card[variant="lined"] span[slot="title"]',
    );
    await expect(span).not.toBeNull();
    if (span) {
      const actual = getComputedStyle(span);
      await expect(actual.fontFamily).toBe(expected.fontFamily);
      await expect(actual.fontSize).toBe(expected.fontSize);
      await expect(actual.fontWeight).toBe(expected.fontWeight);
    }
    probe.remove();
  },
};

type Variant = 'plain' | 'sticky' | 'lined';
type Fastener = 'none' | 'tape' | 'pin';

/** Top padding keeps the tape/pin overhang inside the story frame. */
const paper = (variant: Variant, fastener: Fastener): Story => ({
  render: () =>
    html`<div style="padding-top: var(--sys-spacing-3xl);">
      <gh-card
        variant=${variant}
        fastener=${fastener}
        label="Paper card"
        style="max-width: 320px; display: block;"
      >
        <h3>Paper card</h3>
        <p>Short note on paper.</p>
      </gh-card>
    </div>`,
});

export const PlainNone: Story = paper('plain', 'none');
export const PlainTape: Story = paper('plain', 'tape');
export const PlainPin: Story = paper('plain', 'pin');
export const StickyNone: Story = paper('sticky', 'none');
export const StickyTape: Story = paper('sticky', 'tape');
export const StickyPin: Story = paper('sticky', 'pin');
export const LinedNone: Story = paper('lined', 'none');
/** The tape is tinted (`sys.color.paper.tape`) so it reads on a light page, not only its dashed edges. */
export const LinedTape: Story = {
  ...paper('lined', 'tape'),
  play: async ({ canvasElement }) => {
    const tape = canvasElement
      .querySelector('gh-card')
      ?.shadowRoot?.querySelector<HTMLElement>('.fastener-tape');
    await expect(tape).toBeTruthy();
    if (tape) {
      const resolve = (value: string): string => {
        const probe = document.createElement('span');
        probe.style.backgroundColor = value;
        canvasElement.append(probe);
        const color = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return color;
      };
      const background = getComputedStyle(tape).backgroundColor;
      await expect(background).toBe(resolve('var(--sys-color-paper-tape)'));
      // The tape used to be the page colour, which left only its dashed edges.
      await expect(background).not.toBe(resolve('var(--sys-color-bg-canvas)'));
    }
  },
};
export const LinedPin: Story = paper('lined', 'pin');

const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'];

export const StickyTones: Story = {
  render: () =>
    html`<div
      style="display: grid; grid-template-columns: repeat(3, 200px); gap: var(--sys-spacing-lg);"
    >
      ${tones.map(
        (tone) =>
          html`<gh-card variant="sticky" tone=${tone} label=${tone}><p>${tone}</p></gh-card>`,
      )}
    </div>`,
};

export const Tilt: Story = {
  render: () =>
    html`<div style="display: flex; flex-wrap: wrap; gap: var(--sys-spacing-xl);">
      <gh-card variant="sticky" tilt="left" label="sticky left" style="width: 180px;"><p>sticky left</p></gh-card>
      <gh-card variant="sticky" tilt="right" label="sticky right" style="width: 180px;"><p>sticky right</p></gh-card>
      <gh-card variant="lined" tilt="left" label="lined left" style="width: 180px;"><p>lined left</p></gh-card>
      <gh-card variant="lined" tilt="right" label="lined right" style="width: 180px;"><p>lined right</p></gh-card>
    </div>`,
};

export const Interactive: Story = {
  render: () =>
    html`<div style="padding-top: var(--sys-spacing-3xl);">
      <gh-card variant="sticky" interactive tabindex="0" label="Interactive card" style="max-width: 320px; display: block;">
        <p>Lifts on hover and on focus within.</p>
      </gh-card>
    </div>`,
};

/**
 * Keyboard-focused interactive card. The ring is drawn on the paper (not the
 * host box), so it follows the folded corner instead of a plain rectangle.
 */
export const InteractiveFocused: Story = {
  ...Interactive,
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector<HTMLElement>('gh-card');
    const content = host?.shadowRoot?.querySelector<HTMLElement>('.content');
    await expect(content).toBeTruthy();
    // Programmatic focus with no prior pointer input matches :focus-visible.
    host?.focus();
    await expect(document.activeElement).toBe(host);
    await expect(host?.matches(':focus-visible')).toBe(true);
    if (host && content) {
      const probe = document.createElement('span');
      probe.style.color = 'var(--comp-card-focus-ring)';
      canvasElement.append(probe);
      const expected = getComputedStyle(probe).color;
      probe.remove();
      await expect(getComputedStyle(host).outlineStyle).toBe('none');
      const style = getComputedStyle(content);
      await expect(style.outlineStyle).toBe('solid');
      await expect(style.outlineColor).toBe(expected);
      await expect(style.transform).not.toBe('none');
    }
  },
};

const linkCard = (variant: Variant): Story => ({
  render: () =>
    html`<div style="padding-top: var(--sys-spacing-3xl);">
      <gh-card
        href="#card-docs"
        variant=${variant}
        fastener=${variant === 'plain' ? 'none' : 'pin'}
        style="max-width: 320px; display: block;"
      >
        <h3 slot="title">Card docs</h3>
        <p>The whole card is one link.</p>
      </gh-card>
    </div>`,
});

/** `href` renders the surface as `<a class="content">`: the whole card is one link. */
export const LinkCard: Story = {
  ...linkCard('plain'),
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector('gh-card');
    const anchor = host?.shadowRoot?.querySelector<HTMLAnchorElement>('a.content');
    await expect(anchor?.getAttribute('href')).toBe('#card-docs');
    await expect(anchor?.querySelectorAll('path.sketch-stroke').length ?? 0).toBeGreaterThan(0);
  },
};

export const LinkCardFocused: Story = {
  ...linkCard('plain'),
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector('gh-card');
    const anchor = host?.shadowRoot?.querySelector<HTMLAnchorElement>('a.content');
    await expect(anchor).toBeTruthy();
    // testing-library's tab() does not enter shadow roots; programmatic focus
    // with no prior pointer input matches :focus-visible like keyboard focus.
    anchor?.focus();
    await expect(host?.shadowRoot?.activeElement).toBe(anchor);
    await expect(anchor?.matches(':focus-visible')).toBe(true);
    if (anchor) {
      // Resolve the ring token through a probe so both colours normalise the same way.
      const probe = document.createElement('span');
      probe.style.color = 'var(--comp-card-focus-ring)';
      canvasElement.append(probe);
      const expected = getComputedStyle(probe).color;
      probe.remove();
      const style = getComputedStyle(anchor);
      await expect(style.outlineStyle).toBe('solid');
      await expect(style.outlineColor).toBe(expected);
      await expect(style.transform).not.toBe('none');
    }
  },
};

export const LinkCardSticky: Story = linkCard('sticky');
export const LinkCardLined: Story = linkCard('lined');

export const Korean: Story = {
  render: () =>
    html`<div style="padding-top: var(--sys-spacing-3xl);">
      <gh-card variant="lined" fastener="tape" label="오늘의 메모" style="max-width: 320px; display: block;">
        <h3>오늘의 메모</h3>
        <p>우유와 달걀을 사요.</p>
      </gh-card>
    </div>`,
};

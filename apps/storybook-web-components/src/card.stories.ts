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
export const LinedTape: Story = paper('lined', 'tape');
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

export const Korean: Story = {
  render: () =>
    html`<div style="padding-top: var(--sys-spacing-3xl);">
      <gh-card variant="lined" fastener="tape" label="오늘의 메모" style="max-width: 320px; display: block;">
        <h3>오늘의 메모</h3>
        <p>우유와 달걀을 사요.</p>
      </gh-card>
    </div>`,
};

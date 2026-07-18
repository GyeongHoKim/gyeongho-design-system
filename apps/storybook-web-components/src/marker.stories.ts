import '@ghds/web-components/marker';
import type { GhMarkerVariant } from '@ghds/web-components/marker';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const VARIANTS: GhMarkerVariant[] = ['default', 'success', 'info', 'danger'];

interface MarkerArgs {
  variant: GhMarkerVariant;
  text: string;
}

const meta: Meta<MarkerArgs> = {
  title: 'Components/Marker',
  tags: ['autodocs'],
  render: (args) =>
    html`<p style="font-family: var(--sys-typography-body-fontFamily); font-size: var(--sys-typography-title-fontSize);">
      The quick brown <gh-marker variant=${args.variant}>${args.text}</gh-marker> jumps over.
    </p>`,
  args: {
    variant: 'default',
    text: 'highlighted fox',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    text: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<MarkerArgs>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => html`
    <p style="font-family: var(--sys-typography-body-fontFamily); font-size: var(--sys-typography-title-fontSize); line-height: 2;">
      ${VARIANTS.map(
        (variant) => html`<gh-marker variant=${variant}>${variant}</gh-marker>&nbsp; `,
      )}
    </p>
  `,
};

export const Dark: Story = {
  render: () => html`
    <div data-theme="dark" style="background: var(--sys-color-bg-surface); padding: var(--sys-spacing-lg);">
      <p style="font-family: var(--sys-typography-body-fontFamily); font-size: var(--sys-typography-title-fontSize); line-height: 2; color: var(--sys-color-text-primary);">
        ${VARIANTS.map(
          (variant) => html`<gh-marker variant=${variant}>${variant}</gh-marker>&nbsp; `,
        )}
      </p>
    </div>
  `,
};

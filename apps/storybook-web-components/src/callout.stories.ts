import type { Meta, StoryObj } from '@storybook/web-components';
import '@ghds/web-components/callout';
import type { GhCalloutVariant } from '@ghds/web-components/callout';
import { html } from 'lit';

const VARIANTS: GhCalloutVariant[] = ['info', 'tip', 'warning'];

const meta: Meta = {
  title: 'Components/Callout',
  tags: ['autodocs'],
  render: () => html`
    <div style="max-width: 520px; display: flex; flex-direction: column; gap: var(--sys-spacing-sm);">
      ${VARIANTS.map(
        (variant) =>
          html`<gh-callout variant=${variant} heading=${variant}>
            A ${variant} aside for documentation content.
          </gh-callout>`,
      )}
    </div>
  `,
};

export default meta;
type Story = StoryObj;

export const Variants: Story = {};

export const WithoutHeading: Story = {
  render: () =>
    html`<gh-callout variant="tip" style="max-width: 520px;">
      Prefer sys tokens over ref tokens.
    </gh-callout>`,
};

export const RichContent: Story = {
  render: () =>
    html`<gh-callout variant="warning" heading="Before you commit" style="max-width: 520px;">
      <p style="margin: 0;">
        Run <code>pnpm check</code>, not only <code>pnpm lint</code>. See the
        <a href="#contributing">contributing guide</a>.
      </p>
    </gh-callout>`,
};

export const Dark: Story = {
  render: () => html`
    <div
      data-theme="dark"
      style="max-width: 520px; display: flex; flex-direction: column; gap: var(--sys-spacing-sm); background: var(--sys-color-bg-canvas); padding: var(--sys-spacing-lg);"
    >
      ${VARIANTS.map(
        (variant) =>
          html`<gh-callout variant=${variant} heading=${variant}>
            A ${variant} aside in the dark theme.
          </gh-callout>`,
      )}
    </div>
  `,
};

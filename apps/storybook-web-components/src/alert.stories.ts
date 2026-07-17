import type { Meta, StoryObj } from '@storybook/web-components';
import '@ghds/web-components/alert';
import type { GhAlertVariant } from '@ghds/web-components/alert';
import { html } from 'lit';

const VARIANTS: GhAlertVariant[] = ['info', 'success', 'warning', 'danger'];

const meta: Meta = {
  title: 'Components/Alert',
  tags: ['autodocs'],
  render: () => html`
    <div style="max-width: 480px; display: flex; flex-direction: column; gap: var(--sys-spacing-sm);">
      ${VARIANTS.map(
        (variant) =>
          html`<gh-alert variant=${variant} heading=${variant}>A ${variant} message.</gh-alert>`,
      )}
    </div>
  `,
};

export default meta;
type Story = StoryObj;

export const Variants: Story = {};

export const Dismissible: Story = {
  render: () =>
    html`<gh-alert variant="success" heading="Saved" dismissible>Your changes are saved.</gh-alert>`,
};

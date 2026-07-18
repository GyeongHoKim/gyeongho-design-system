import '@ghds/web-components/scroll-area';
import type { GhScrollAreaOrientation } from '@ghds/web-components/scroll-area';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const ORIENTATIONS: GhScrollAreaOrientation[] = ['vertical', 'horizontal', 'both'];

interface ScrollAreaArgs {
  orientation: GhScrollAreaOrientation;
}

const rows = Array.from({ length: 20 }, (_, i) => i + 1);

const verticalContent = html`
  <div style="display: flex; flex-direction: column; gap: var(--sys-spacing-sm);">
    ${rows.map((n) => html`<div>Row ${n}</div>`)}
  </div>
`;

const meta: Meta<ScrollAreaArgs> = {
  title: 'Components/ScrollArea',
  tags: ['autodocs'],
  render: (args) =>
    html`<gh-scroll-area
      orientation=${args.orientation}
      style="display: block; max-height: 200px; max-width: 320px; color: var(--sys-color-text-primary); font-family: var(--sys-typography-body-fontFamily);"
    >
      ${verticalContent}
    </gh-scroll-area>`,
  args: {
    orientation: 'vertical',
  },
  argTypes: {
    orientation: { control: 'inline-radio', options: ORIENTATIONS },
  },
};

export default meta;
type Story = StoryObj<ScrollAreaArgs>;

export const Vertical: Story = { args: { orientation: 'vertical' } };

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
  render: (args) => html`
    <gh-scroll-area
      orientation=${args.orientation}
      style="display: block; max-width: 320px; color: var(--sys-color-text-primary); font-family: var(--sys-typography-body-fontFamily);"
    >
      <div style="display: flex; gap: var(--sys-spacing-md); width: max-content;">
        ${rows.map((n) => html`<div>Cell ${n}</div>`)}
      </div>
    </gh-scroll-area>
  `,
};

export const Dark: Story = {
  args: { orientation: 'vertical' },
  render: (args) => html`
    <div data-theme="dark" style="background: var(--sys-color-bg-surface); padding: var(--sys-spacing-lg);">
      <gh-scroll-area
        orientation=${args.orientation}
        style="display: block; max-height: 200px; max-width: 320px; color: var(--sys-color-text-primary); font-family: var(--sys-typography-body-fontFamily);"
      >
        ${verticalContent}
      </gh-scroll-area>
    </div>
  `,
};

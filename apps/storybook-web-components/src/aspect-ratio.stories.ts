import '@ghds/web-components/aspect-ratio';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

interface AspectRatioArgs {
  ratio: number;
}

const meta: Meta<AspectRatioArgs> = {
  title: 'Components/AspectRatio',
  tags: ['autodocs'],
  render: (args) =>
    html`<gh-aspect-ratio
      .ratio=${args.ratio}
      style="max-width: 400px; background: var(--sys-color-bg-muted); border-radius: var(--sys-radius-md);"
    >
      <div
        style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: var(--sys-color-text-secondary); font-family: var(--sys-typography-label-fontFamily);"
      >
        ${args.ratio.toFixed(2)}
      </div>
    </gh-aspect-ratio>`,
  args: {
    ratio: 16 / 9,
  },
  argTypes: {
    ratio: { control: { type: 'number', step: 0.1 } },
  },
};

export default meta;
type Story = StoryObj<AspectRatioArgs>;

export const Widescreen: Story = { args: { ratio: 16 / 9 } };

export const Square: Story = { args: { ratio: 1 } };

export const Portrait: Story = { args: { ratio: 3 / 4 } };

export const Dark: Story = {
  args: { ratio: 16 / 9 },
  render: (args) => html`
    <div data-theme="dark" style="background: var(--sys-color-bg-surface); padding: var(--sys-spacing-lg);">
      <gh-aspect-ratio
        .ratio=${args.ratio}
        style="max-width: 400px; background: var(--sys-color-bg-muted); border-radius: var(--sys-radius-md);"
      >
        <div
          style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: var(--sys-color-text-secondary); font-family: var(--sys-typography-label-fontFamily);"
        >
          ${args.ratio.toFixed(2)}
        </div>
      </gh-aspect-ratio>
    </div>
  `,
};

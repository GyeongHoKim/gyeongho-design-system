import type { Meta, StoryObj } from '@storybook/web-components';
import '@ghds/web-components/spinner';
import type { GhSpinnerSize } from '@ghds/web-components/spinner';
import { html } from 'lit';

const SIZES: GhSpinnerSize[] = ['sm', 'md', 'lg'];

interface SpinnerArgs {
  size: GhSpinnerSize;
  label: string;
}

const meta: Meta<SpinnerArgs> = {
  title: 'Components/Spinner',
  tags: ['autodocs'],
  render: (args) => html`<gh-spinner size=${args.size} label=${args.label}></gh-spinner>`,
  args: { size: 'md', label: 'Loading' },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<SpinnerArgs>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: var(--sys-spacing-md);">
      ${SIZES.map((size) => html`<gh-spinner size=${size} label=${`Loading ${size}`}></gh-spinner>`)}
    </div>
  `,
};

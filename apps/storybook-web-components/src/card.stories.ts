import { expect } from '@storybook/test';
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
      <h3 slot="title">Hand-drawn card</h3>
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

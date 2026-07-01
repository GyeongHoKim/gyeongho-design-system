import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Card } from './Card.js';

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
 * container. If its root loses its stacking context, the `z-index: -1` sketch
 * outline paints behind this white box and disappears — flagged by Chromatic.
 */
export const OnOpaqueSurface: Story = {
  args: {
    style: { maxWidth: 320 },
    children: <span>Sketch outline stays visible on an opaque surface.</span>,
  },
  render: (args) => (
    <div style={{ background: '#ffffff', padding: 24 }}>
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

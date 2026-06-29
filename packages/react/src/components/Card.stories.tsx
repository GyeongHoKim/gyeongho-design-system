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

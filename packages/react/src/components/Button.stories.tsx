import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from './Button.js';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Button', onClick: fn() },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'danger', 'neutral'] },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary' } };

export const Danger: Story = { args: { variant: 'danger', children: 'Delete' } };

export const Neutral: Story = { args: { variant: 'neutral', children: 'Cancel' } };

export const Disabled: Story = { args: { disabled: true, children: 'Disabled' } };

/**
 * Visual-regression guard for GHD-44: the button is placed inside an
 * opaque-background container. If its root ever loses its stacking context, the
 * `z-index: -1` sketch surface (and the light label) paint behind this white
 * box and vanish — a change Chromatic will flag.
 */
export const OnOpaqueSurface: Story = {
  args: { variant: 'primary', children: 'Primary' },
  render: (args) => (
    <div style={{ background: '#ffffff', padding: 24 }}>
      <Button {...args} />
    </div>
  ),
};

export const AsLink: Story = {
  render: (args) => (
    <Button {...args} asChild>
      <a href="#next">Go to next</a>
    </Button>
  ),
};

export const ClickInteraction: Story = {
  args: { children: 'Click me' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Click me' });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalled();
  },
};

export const KeyboardInteraction: Story = {
  args: { children: 'Press enter' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Press enter' });
    button.focus();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalled();
  },
};

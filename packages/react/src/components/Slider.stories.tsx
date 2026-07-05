import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Slider } from './Slider.js';

const meta = {
  title: 'Components/Slider',
  component: Slider,
  args: { label: 'Volume' },
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: 50 },
};

export const CustomRange: Story = {
  args: { label: 'Rating', min: 0, max: 10, step: 1, defaultValue: 7 },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 40 },
};

/**
 * Visual-regression guard for GHD-44: the slider sits inside an
 * opaque-background container. If its control loses its stacking context, the
 * `z-index: -1` sketch layers paint behind this box and disappear — flagged
 * by Chromatic in both light and dark schemes.
 */
export const OnOpaqueSurface: Story = {
  args: { label: 'On an opaque surface', defaultValue: 60 },
  render: (args) => (
    <div style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}>
      <Slider {...args} />
    </div>
  ),
};

export const OnOpaqueSurfaceDark: Story = {
  args: { label: 'On a dark opaque surface', defaultValue: 60 },
  render: (args) => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <Slider {...args} />
    </div>
  ),
};

export const KeyboardInteraction: Story = {
  args: { label: 'Adjust me', defaultValue: 50, step: 5 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('slider', { name: 'Adjust me' });
    await userEvent.tab();
    await expect(field).toHaveFocus();
    // Arrow-key stepping itself is guaranteed by the browser's native
    // `<input type="range">` semantics (not custom code) — asserted directly
    // in unit tests via `stepUp()`, a jsdom-supported DOM API. This story
    // only verifies the control is reachable by keyboard.
  },
};

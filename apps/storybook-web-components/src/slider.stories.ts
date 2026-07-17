import { expect } from 'storybook/test';
import '@ghds/web-components/slider';
import type { GhSlider } from '@ghds/web-components/slider';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

interface SliderArgs {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
}

function requireEl<T extends Element>(root: ParentNode | null, selector: string): T {
  const found = root?.querySelector<T>(selector);
  if (!found) {
    throw new Error(`expected to find ${selector}`);
  }
  return found;
}

const meta: Meta<SliderArgs> = {
  title: 'Components/Slider',
  tags: ['autodocs'],
  render: (args) =>
    html`<gh-slider
      label=${args.label}
      value=${args.value}
      min=${args.min}
      max=${args.max}
      step=${args.step}
      ?disabled=${args.disabled}
      style="display: inline-block; width: 240px;"
    ></gh-slider>`,
  args: { label: 'Volume', value: 0, min: 0, max: 100, step: 1, disabled: false },
  argTypes: {
    value: { control: 'number' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<SliderArgs>;

export const Default: Story = {};

export const WithValue: Story = { args: { value: 50 } };

export const CustomRange: Story = { args: { label: 'Rating', min: 0, max: 10, step: 1, value: 7 } };

export const Disabled: Story = { args: { disabled: true, value: 40 } };

/**
 * Visual-regression guard for GHD-44: the slider sits inside an
 * opaque-background container. If its control loses its stacking context, the
 * `z-index: -1` sketch layers paint behind this box and disappear.
 */
export const OnOpaqueSurface: Story = {
  args: { label: 'On an opaque surface', value: 60 },
  render: (args) => html`
    <div style="background: var(--sys-color-bg-surface); padding: var(--sys-spacing-lg);">
      <gh-slider label=${args.label} value=${args.value} style="display: inline-block; width: 240px;"></gh-slider>
    </div>
  `,
};

export const OnOpaqueSurfaceDark: Story = {
  args: { label: 'On a dark opaque surface', value: 60 },
  render: (args) => html`
    <div
      data-theme="dark"
      style="background: var(--sys-color-bg-surface); padding: var(--sys-spacing-lg);"
    >
      <gh-slider label=${args.label} value=${args.value} style="display: inline-block; width: 240px;"></gh-slider>
    </div>
  `,
};

export const KeyboardInteraction: Story = {
  name: 'Interaction: keyboard focus reaches the native input',
  args: { value: 50, step: 5 },
  play: async ({ canvasElement }) => {
    const host = requireEl<GhSlider>(canvasElement, 'gh-slider');
    const input = requireEl<HTMLInputElement>(host.shadowRoot, 'input');
    input.focus();
    await expect(host.shadowRoot?.activeElement).toBe(input);
    // Arrow-key stepping itself is guaranteed by the browser's native
    // `<input type="range">` semantics (not custom code) — asserted directly
    // in unit tests. This story only verifies the control is focusable.
  },
};

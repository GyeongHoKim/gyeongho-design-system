import type { GhSwitch } from '@ghds/web-components';
import { expect, userEvent } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

interface SwitchArgs {
  label: string;
  checked: boolean;
  disabled: boolean;
}

function requireEl<T extends Element>(root: ParentNode | null, selector: string): T {
  const found = root?.querySelector<T>(selector);
  if (!found) {
    throw new Error(`expected to find ${selector}`);
  }
  return found;
}

const meta: Meta<SwitchArgs> = {
  title: 'Components/Switch',
  tags: ['autodocs'],
  render: (args) =>
    html`<gh-switch
      label=${args.label}
      ?checked=${args.checked}
      ?disabled=${args.disabled}
    ></gh-switch>`,
  args: { label: 'Enable notifications', checked: false, disabled: false },
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<SwitchArgs>;

export const Default: Story = {};

export const On: Story = { args: { checked: true } };

export const Disabled: Story = { args: { disabled: true } };

export const DisabledOn: Story = { args: { disabled: true, checked: true } };

/**
 * Visual-regression guard for GHD-44: the switch sits inside an
 * opaque-background container. If its control loses its stacking context, the
 * `z-index: -1` sketch track paints behind this box and disappears.
 */
export const OnOpaqueSurface: Story = {
  args: { label: 'On an opaque surface', checked: true },
  render: (args) => html`
    <div style="background: var(--sys-color-bg-surface); padding: var(--sys-spacing-lg);">
      <gh-switch label=${args.label} ?checked=${args.checked}></gh-switch>
    </div>
  `,
};

export const OnOpaqueSurfaceDark: Story = {
  args: { label: 'On a dark opaque surface', checked: true },
  render: (args) => html`
    <div
      data-theme="dark"
      style="background: var(--sys-color-bg-surface); padding: var(--sys-spacing-lg);"
    >
      <gh-switch label=${args.label} ?checked=${args.checked}></gh-switch>
    </div>
  `,
};

export const KeyboardInteraction: Story = {
  name: 'Interaction: keyboard toggles checked',
  play: async ({ canvasElement }) => {
    const host = requireEl<GhSwitch>(canvasElement, 'gh-switch');
    const input = requireEl<HTMLInputElement>(host.shadowRoot, 'input');
    input.focus();
    await userEvent.keyboard(' ');
    await expect(host.checked).toBe(true);
  },
};

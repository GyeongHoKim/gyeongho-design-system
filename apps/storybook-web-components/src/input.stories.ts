import { expect, userEvent } from 'storybook/test';
import '@ghds/web-components/input';
import type { GhInput, GhInputType } from '@ghds/web-components/input';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

interface InputArgs {
  label: string;
  placeholder: string;
  type: GhInputType;
  disabled: boolean;
  required: boolean;
}

function requireEl<T extends Element>(root: ParentNode | null, selector: string): T {
  const found = root?.querySelector<T>(selector);
  if (!found) {
    throw new Error(`expected to find ${selector}`);
  }
  return found;
}

const meta: Meta<InputArgs> = {
  title: 'Components/Input',
  tags: ['autodocs'],
  render: (args) =>
    html`<gh-input
      label=${args.label}
      placeholder=${args.placeholder}
      type=${args.type}
      ?disabled=${args.disabled}
      ?required=${args.required}
      style="display: inline-block; min-width: 260px;"
    ></gh-input>`,
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    type: 'email',
    disabled: false,
    required: false,
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'search', 'tel', 'url', 'number'],
    },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<InputArgs>;

export const Default: Story = {};

export const Required: Story = { args: { required: true } };

export const Disabled: Story = { args: { disabled: true } };

export const TypingUpdatesValue: Story = {
  name: 'Interaction: typing updates value',
  play: async ({ canvasElement }) => {
    const host = requireEl<GhInput>(canvasElement, 'gh-input');
    const input = requireEl<HTMLInputElement>(host.shadowRoot, 'input');
    await userEvent.type(input, 'hi@ghds.dev');
    await expect(host.value).toBe('hi@ghds.dev');
  },
};

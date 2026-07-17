import { expect, userEvent } from 'storybook/test';
import '@ghds/web-components/textarea';
import type { GhTextarea } from '@ghds/web-components/textarea';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

interface TextareaArgs {
  label: string;
  placeholder: string;
  rows: number;
  disabled: boolean;
  required: boolean;
  autoResize: boolean;
}

function requireEl<T extends Element>(root: ParentNode | null, selector: string): T {
  const found = root?.querySelector<T>(selector);
  if (!found) {
    throw new Error(`expected to find ${selector}`);
  }
  return found;
}

const meta: Meta<TextareaArgs> = {
  title: 'Components/Textarea',
  tags: ['autodocs'],
  render: (args) =>
    html`<gh-textarea
      label=${args.label}
      placeholder=${args.placeholder}
      rows=${args.rows}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?autoresize=${args.autoResize}
      style="display: inline-block; min-width: 260px;"
    ></gh-textarea>`,
  args: {
    label: 'Bio',
    placeholder: 'Tell us about yourself',
    rows: 2,
    disabled: false,
    required: false,
    autoResize: false,
  },
  argTypes: {
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    autoResize: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<TextareaArgs>;

export const Default: Story = {};

export const Required: Story = { args: { required: true } };

export const Disabled: Story = { args: { disabled: true } };

export const AutoResize: Story = { args: { autoResize: true } };

export const TypingUpdatesValue: Story = {
  name: 'Interaction: typing updates value',
  play: async ({ canvasElement }) => {
    const host = requireEl<GhTextarea>(canvasElement, 'gh-textarea');
    const textarea = requireEl<HTMLTextAreaElement>(host.shadowRoot, 'textarea');
    await userEvent.type(textarea, 'Hi from GHDS');
    await expect(host.value).toBe('Hi from GHDS');
  },
};

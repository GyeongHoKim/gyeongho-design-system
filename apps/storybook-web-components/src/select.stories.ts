import type { GhSelect, GhSelectOption } from '@ghds/web-components';
import { expect, userEvent } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

interface SelectArgs {
  label: string;
  placeholder: string;
  value: string;
  disabled: boolean;
}

const FRUIT_OPTIONS: GhSelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'date', label: 'Date' },
];

function requireEl<T extends Element>(root: ParentNode | null, selector: string): T {
  const found = root?.querySelector<T>(selector);
  if (!found) {
    throw new Error(`expected to find ${selector}`);
  }
  return found;
}

const meta: Meta<SelectArgs> = {
  title: 'Components/Select',
  tags: ['autodocs'],
  render: (args) =>
    html`<gh-select
      label=${args.label}
      placeholder=${args.placeholder}
      .options=${FRUIT_OPTIONS}
      value=${args.value}
      ?disabled=${args.disabled}
      style="display: inline-block; min-width: 220px;"
    ></gh-select>`,
  args: { label: 'Fruit', placeholder: 'Choose a fruit', value: '', disabled: false },
  argTypes: {
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<SelectArgs>;

export const Default: Story = {};

export const Selected: Story = { args: { value: 'banana' } };

export const Disabled: Story = { args: { value: 'banana', disabled: true } };

/**
 * Forces the panel open for Chromatic — a plain render only ever captures the
 * closed trigger.
 */
export const Open: Story = {
  args: { value: 'banana' },
  play: async ({ canvasElement }) => {
    const host = requireEl<GhSelect>(canvasElement, 'gh-select');
    const trigger = requireEl<HTMLButtonElement>(host.shadowRoot, 'button');
    trigger.click();
  },
};

export const OpenDark: Story = {
  args: { value: 'banana' },
  render: (args) => html`
    <div data-theme="dark" style="background: var(--sys-color-bg-surface); padding: var(--sys-spacing-lg);">
      <gh-select
        label=${args.label}
        placeholder=${args.placeholder}
        .options=${FRUIT_OPTIONS}
        value=${args.value}
        style="display: inline-block; min-width: 220px;"
      ></gh-select>
    </div>
  `,
  play: async ({ canvasElement }) => {
    const host = requireEl<GhSelect>(canvasElement, 'gh-select');
    const trigger = requireEl<HTMLButtonElement>(host.shadowRoot, 'button');
    trigger.click();
  },
};

export const KeyboardInteraction: Story = {
  name: 'Interaction: keyboard opens and selects',
  play: async ({ canvasElement }) => {
    const host = requireEl<GhSelect>(canvasElement, 'gh-select');
    const trigger = requireEl<HTMLButtonElement>(host.shadowRoot, 'button');
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(trigger.getAttribute('aria-expanded')).toBe('true');
    await userEvent.keyboard('{Enter}');
    await expect(host.value).toBe('apple');
  },
};

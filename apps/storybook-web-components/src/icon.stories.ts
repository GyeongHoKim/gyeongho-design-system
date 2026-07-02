import { iconNames } from '@ghds/web-components';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

interface IconArgs {
  name: string;
  size: 'sm' | 'md' | 'lg';
  label: string;
}

const meta: Meta<IconArgs> = {
  title: 'Components/Icon',
  tags: ['autodocs'],
  render: (args) =>
    html`<gh-icon name=${args.name} size=${args.size} label=${args.label}></gh-icon>`,
  args: { name: 'search', size: 'md', label: '' },
  argTypes: {
    name: { control: 'select', options: iconNames },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<IconArgs>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => html`
    <div style="display: flex; align-items: center; gap: 24px;">
      <gh-icon name=${args.name} size="sm"></gh-icon>
      <gh-icon name=${args.name} size="md"></gh-icon>
      <gh-icon name=${args.name} size="lg"></gh-icon>
    </div>
  `,
};

/** Icons inherit `currentColor` — here the container's text color. */
export const InheritsColor: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; color: var(--sys-color-icon-danger);">
      <gh-icon name="trash"></gh-icon>
      <gh-icon name="warning"></gh-icon>
      <gh-icon name="close"></gh-icon>
    </div>
  `,
};

/** The full icon set — the catalog for browsing names. */
export const Catalog: Story = {
  render: () => html`
    <div
      style="display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 16px; max-width: 720px;"
    >
      ${iconNames.map(
        (name) => html`
          <div
            style="display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 12px;"
          >
            <gh-icon name=${name} size="lg"></gh-icon>
            <code style="font-size: 11px; text-align: center;">${name}</code>
          </div>
        `,
      )}
    </div>
  `,
};

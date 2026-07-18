import '@ghds/web-components/resizable-group';
import '@ghds/web-components/resizable-panel';
import '@ghds/web-components/resizable-handle';
import type { GhResizableDirection } from '@ghds/web-components/resizable-handle';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

interface ResizableArgs {
  direction: GhResizableDirection;
  withHandle: boolean;
}

function panelContent(label: string) {
  return html`<div
    style="display: flex; align-items: center; justify-content: center; height: 100%; padding: var(--sys-spacing-md); box-sizing: border-box; color: var(--sys-color-text-primary); font-family: var(--sys-typography-body-fontFamily);"
  >
    ${label}
  </div>`;
}

const meta: Meta<ResizableArgs> = {
  title: 'Components/Resizable',
  tags: ['autodocs'],
  render: (args) =>
    html`<gh-resizable-group
      direction=${args.direction}
      style="display: block; width: 400px; height: 240px; border-radius: var(--sys-radius-md); background: var(--sys-color-bg-muted);"
    >
      <gh-resizable-panel default-size="50">${panelContent('One')}</gh-resizable-panel>
      <gh-resizable-handle ?with-handle=${args.withHandle}></gh-resizable-handle>
      <gh-resizable-panel default-size="50">${panelContent('Two')}</gh-resizable-panel>
    </gh-resizable-group>`,
  args: {
    direction: 'horizontal',
    withHandle: true,
  },
  argTypes: {
    direction: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    withHandle: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<ResizableArgs>;

export const Horizontal: Story = { args: { direction: 'horizontal' } };

export const Vertical: Story = { args: { direction: 'vertical' } };

export const ThreePanels: Story = {
  render: (args) => html`
    <gh-resizable-group
      direction=${args.direction}
      style="display: block; width: 480px; height: 240px; border-radius: var(--sys-radius-md); background: var(--sys-color-bg-muted);"
    >
      <gh-resizable-panel default-size="25">${panelContent('Sidebar')}</gh-resizable-panel>
      <gh-resizable-handle with-handle></gh-resizable-handle>
      <gh-resizable-panel default-size="50">${panelContent('Main')}</gh-resizable-panel>
      <gh-resizable-handle with-handle></gh-resizable-handle>
      <gh-resizable-panel default-size="25">${panelContent('Inspector')}</gh-resizable-panel>
    </gh-resizable-group>
  `,
};

export const Dark: Story = {
  render: (args) => html`
    <div data-theme="dark" style="background: var(--sys-color-bg-surface); padding: var(--sys-spacing-lg);">
      <gh-resizable-group
        direction=${args.direction}
        style="display: block; width: 400px; height: 240px; border-radius: var(--sys-radius-md); background: var(--sys-color-bg-muted);"
      >
        <gh-resizable-panel default-size="50">${panelContent('One')}</gh-resizable-panel>
        <gh-resizable-handle with-handle></gh-resizable-handle>
        <gh-resizable-panel default-size="50">${panelContent('Two')}</gh-resizable-panel>
      </gh-resizable-group>
    </div>
  `,
};

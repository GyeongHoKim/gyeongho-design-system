import type { Meta, StoryObj } from '@storybook/web-components';
import '@ghds/web-components/button';
import '@ghds/web-components/tooltip';
import { html } from 'lit';

const meta: Meta = {
  title: 'Components/Tooltip',
  tags: ['autodocs'],
  render: () => html`
    <div style="padding: 80px; display: flex; justify-content: center;">
      <gh-tooltip content="Saves your changes">
        <gh-button>Save</gh-button>
      </gh-tooltip>
    </div>
  `,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

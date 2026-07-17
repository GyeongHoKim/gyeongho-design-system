import type { Meta, StoryObj } from '@storybook/web-components';
import '@ghds/web-components/button';
import '@ghds/web-components/modal';
import { html } from 'lit';

const meta: Meta = {
  title: 'Components/Modal',
  tags: ['autodocs'],
  render: () => {
    const open = () => {
      const modal = document.getElementById('demo-modal') as
        | (HTMLElement & { open: boolean })
        | null;
      if (modal) {
        modal.open = true;
      }
    };
    return html`
      <gh-button @click=${open}>Open dialog</gh-button>
      <gh-modal
        id="demo-modal"
        heading="Delete item?"
        @close=${(e: Event) => {
          (e.currentTarget as HTMLElement & { open: boolean }).open = false;
        }}
      >
        <p style="margin-top: 0;">This action cannot be undone.</p>
      </gh-modal>
    `;
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

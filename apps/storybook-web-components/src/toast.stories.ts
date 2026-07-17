import type { Meta, StoryObj } from '@storybook/web-components';
import '@ghds/web-components/button';
import '@ghds/web-components/toast';
import { html } from 'lit';

const meta: Meta = {
  title: 'Components/Toast',
  tags: ['autodocs'],
  render: () => html`
    <gh-button
      @click=${() => {
        const t = document.getElementById('demo-toast') as (HTMLElement & { open: boolean }) | null;
        if (t) t.open = true;
      }}
      >Show toast</gh-button
    >
    <gh-toast
      id="demo-toast"
      variant="success"
      heading="Saved"
      .duration=${0}
      @close=${(e: Event) => {
        (e.currentTarget as HTMLElement & { open: boolean }).open = false;
      }}
      >Your changes have been saved.</gh-toast
    >
  `,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

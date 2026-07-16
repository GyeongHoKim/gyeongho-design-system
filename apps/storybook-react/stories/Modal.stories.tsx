import { Button, Modal } from '@ghds/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

const meta = {
  title: 'Components/Modal',
  component: Modal,
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Delete item?">
          <p style={{ marginTop: 0 }}>This action cannot be undone.</p>
          <div
            style={{ display: 'flex', gap: 'var(--sys-spacing-sm)', justifyContent: 'flex-end' }}
          >
            <Button variant="neutral" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setOpen(false)}>
              Delete
            </Button>
          </div>
        </Modal>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open dialog' }));
    // The dialog portals to document.body, so query the whole screen.
    await expect(await within(document.body).findByRole('dialog')).toHaveAttribute(
      'aria-modal',
      'true',
    );
  },
};

/** Dark scheme: the scrim must visibly dim the page behind the dialog. */
export const Dark: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div
        data-theme="dark"
        style={{ background: 'var(--sys-color-bg-canvas)', minHeight: 240, padding: 24 }}
      >
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Delete item?">
          <p style={{ marginTop: 0 }}>This action cannot be undone.</p>
        </Modal>
      </div>
    );
  },
};

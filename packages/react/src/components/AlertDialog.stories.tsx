import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AlertDialog } from './AlertDialog.js';
import { Button } from './Button.js';

const meta = {
  title: 'Components/AlertDialog',
  component: AlertDialog,
} satisfies Meta<typeof AlertDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Delete file</Button>
        <AlertDialog
          open={open}
          onCancel={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
          title="Delete this file?"
          description="This action cannot be undone."
          confirmLabel="Delete"
          destructive
        />
      </>
    );
  },
};

export const OpenNonDestructive: Story = {
  render: () => (
    <AlertDialog
      open
      onCancel={() => {}}
      onConfirm={() => {}}
      title="Publish changes?"
      description="Your changes will be visible to everyone."
      confirmLabel="Publish"
    />
  ),
};

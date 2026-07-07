import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from './Button.js';
import { Toast } from './Toast.js';

const meta = {
  title: 'Components/Toast',
  component: Toast,
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Show toast</Button>
        <Toast
          open={open}
          onClose={() => setOpen(false)}
          variant="success"
          title="Saved"
          duration={0}
        >
          Your changes have been saved.
        </Toast>
      </>
    );
  },
};

export const Persistent: Story = {
  args: {
    open: true,
    onClose: () => {},
    variant: 'danger',
    title: 'Upload failed',
    children: 'Check your connection and try again.',
    duration: 0,
  },
};

import { Button, Drawer } from '@ghds/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
} satisfies Meta<typeof Drawer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open drawer</Button>
        <Drawer open={open} onClose={() => setOpen(false)} title="Share">
          <p>Choose how you want to share this item.</p>
          <Button variant="neutral" onClick={() => setOpen(false)}>
            Done
          </Button>
        </Drawer>
      </>
    );
  },
};

export const Open: Story = {
  render: () => (
    <Drawer open onClose={() => {}} title="Share">
      <p>Choose how you want to share this item.</p>
    </Drawer>
  ),
};

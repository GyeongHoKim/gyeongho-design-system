import { Button } from '@ghds/react/button';
import { Sheet, type SheetSide } from '@ghds/react/sheet';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta = {
  title: 'Components/Sheet',
  component: Sheet,
  argTypes: {
    side: { control: 'inline-radio', options: ['left', 'right', 'top', 'bottom'] },
  },
} satisfies Meta<typeof Sheet>;

export default meta;

type Story = StoryObj<typeof meta>;

function Demo({ side }: { side: SheetSide }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open {side} sheet</Button>
      <Sheet open={open} onClose={() => setOpen(false)} side={side} title="Filters">
        <p>Refine the results using the controls here.</p>
        <Button variant="neutral" onClick={() => setOpen(false)}>
          Close
        </Button>
      </Sheet>
    </>
  );
}

export const Right: Story = { render: () => <Demo side="right" /> };
export const Left: Story = { render: () => <Demo side="left" /> };
export const Top: Story = { render: () => <Demo side="top" /> };
export const Bottom: Story = { render: () => <Demo side="bottom" /> };

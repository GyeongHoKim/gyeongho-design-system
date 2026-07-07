import { Button, Toast } from '@ghds/react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button label="Show toast" onPress={() => setOpen(true)} />
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

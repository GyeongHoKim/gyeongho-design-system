import { Button } from '@ghds/react-native/button';
import { Toast } from '@ghds/react-native/toast';
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
        {open && (
          <Toast
            variant="success"
            title="Saved"
            description="Your changes have been saved."
            onDismiss={() => setOpen(false)}
          />
        )}
      </>
    );
  },
};

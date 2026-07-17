import { Button } from '@ghds/react-native/button';
import { Modal } from '@ghds/react-native/modal';
import { Text } from '@ghds/react-native/theme';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button label="Open dialog" onPress={() => setOpen(true)} />
        <Modal open={open} onClose={() => setOpen(false)} title="Delete item?">
          <Text>This action cannot be undone.</Text>
        </Modal>
      </>
    );
  },
};

import { Button } from '@ghds/react-native/button';
import { Tooltip } from '@ghds/react-native/tooltip';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  args: { content: 'Saves your changes' },
  render: (args) => (
    <Tooltip {...args}>
      <Button label="Save" onPress={() => {}} />
    </Tooltip>
  ),
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {};

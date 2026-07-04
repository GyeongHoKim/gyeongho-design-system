import { Checkbox, CheckboxGroup } from '@ghds/react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { type ComponentProps, useState } from 'react';

const meta: Meta<typeof CheckboxGroup> = {
  title: 'Components/CheckboxGroup',
  component: CheckboxGroup,
  argTypes: {
    layout: { control: 'inline-radio', options: ['row', 'column'] },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof CheckboxGroup>;

function Interactive(args: Partial<ComponentProps<typeof CheckboxGroup>>) {
  const [value, setValue] = useState<string[]>(['red']);
  return (
    <CheckboxGroup label="Favorite colors" {...args} value={value} onValueChange={setValue}>
      <Checkbox label="Red" value="red" />
      <Checkbox label="Green" value="green" />
      <Checkbox label="Blue" value="blue" />
    </CheckboxGroup>
  );
}

export const Default: Story = {
  render: (args) => <Interactive {...args} />,
};

export const Row: Story = {
  args: { layout: 'row' },
  render: (args) => <Interactive {...args} />,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <Interactive {...args} />,
};

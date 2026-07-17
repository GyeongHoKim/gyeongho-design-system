import { Checkbox } from '@ghds/react/checkbox';
import { CheckboxGroup, type CheckboxGroupProps } from '@ghds/react/checkbox-group';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta = {
  title: 'Components/CheckboxGroup',
  component: CheckboxGroup,
} satisfies Meta<typeof CheckboxGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

function Interactive(args: Omit<CheckboxGroupProps, 'value' | 'onValueChange'>) {
  const [value, setValue] = useState<string[]>(['red']);
  return (
    <CheckboxGroup {...args} value={value} onValueChange={setValue}>
      <Checkbox label="Red" value="red" />
      <Checkbox label="Green" value="green" />
      <Checkbox label="Blue" value="blue" />
    </CheckboxGroup>
  );
}

export const Default: Story = {
  args: { label: 'Favorite colors' },
  render: (args) => <Interactive {...args} />,
};

export const Row: Story = {
  args: { label: 'Favorite colors', layout: 'row' },
  render: (args) => <Interactive {...args} />,
};

export const Disabled: Story = {
  args: { label: 'Favorite colors', disabled: true },
  render: (args) => <Interactive {...args} />,
};

import { Radio } from '@ghds/react-native/radio';
import { RadioGroup } from '@ghds/react-native/radio-group';
import type { Meta, StoryObj } from '@storybook/react';
import { type ComponentProps, useState } from 'react';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  argTypes: {
    layout: { control: 'inline-radio', options: ['row', 'column'] },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

function Interactive(args: Partial<ComponentProps<typeof RadioGroup>>) {
  const [value, setValue] = useState('sm');
  return (
    <RadioGroup label="Size" {...args} value={value} onValueChange={setValue}>
      <Radio label="Small" value="sm" />
      <Radio label="Medium" value="md" />
      <Radio label="Large" value="lg" />
    </RadioGroup>
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

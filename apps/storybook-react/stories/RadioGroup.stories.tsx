import { Radio } from '@ghds/react/radio';
import { RadioGroup, type RadioGroupProps } from '@ghds/react/radio-group';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

function Interactive(args: Omit<RadioGroupProps, 'value' | 'onValueChange'>) {
  const [value, setValue] = useState('sm');
  return (
    <RadioGroup {...args} value={value} onValueChange={setValue}>
      <Radio label="Small" value="sm" />
      <Radio label="Medium" value="md" />
      <Radio label="Large" value="lg" />
    </RadioGroup>
  );
}

export const Default: Story = {
  args: { label: 'Size' },
  render: (args) => <Interactive {...args} />,
};

export const Row: Story = {
  args: { label: 'Size', layout: 'row' },
  render: (args) => <Interactive {...args} />,
};

export const Disabled: Story = {
  args: { label: 'Size', disabled: true },
  render: (args) => <Interactive {...args} />,
};

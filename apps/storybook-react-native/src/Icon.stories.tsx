import { iconNames } from '@ghds/icons';
import { Icon } from '@ghds/react-native/icon';
import { Box, Text } from '@ghds/react-native/theme';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  args: { name: 'search', size: 'md' },
  argTypes: {
    name: { control: 'select', options: iconNames },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <Box flexDirection="row" alignItems="center" gap="lg">
      <Icon {...args} size="sm" />
      <Icon {...args} size="md" />
      <Icon {...args} size="lg" />
    </Box>
  ),
};

export const Catalog: Story = {
  render: () => (
    <Box flexDirection="row" flexWrap="wrap" gap="md">
      {iconNames.map((name) => (
        <Box key={name} alignItems="center" gap="xs" padding="sm" width={88}>
          <Icon name={name} size="lg" />
          <Text variant="caption">{name}</Text>
        </Box>
      ))}
    </Box>
  ),
};

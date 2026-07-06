import { Box, Spinner, type SpinnerSize } from '@ghds/react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

const SIZES: SpinnerSize[] = ['sm', 'md', 'lg'];

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  args: { size: 'md', label: 'Loading' },
  argTypes: { size: { control: 'inline-radio', options: SIZES } },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <Box flexDirection="row" alignItems="center" gap="md">
      {SIZES.map((size) => (
        <Spinner key={size} size={size} label={`Loading ${size}`} />
      ))}
    </Box>
  ),
};

export const AnnouncesBusyState: Story = {
  args: { testID: 'demo-spinner', label: 'Loading results' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByLabelText('Loading results')).toBeInTheDocument();
  },
};

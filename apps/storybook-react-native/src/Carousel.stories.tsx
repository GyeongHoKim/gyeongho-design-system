import { Card } from '@ghds/react-native/card';
import {
  Carousel,
  CarouselContent,
  CarouselIndicators,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@ghds/react-native/carousel';
import { Box, Text } from '@ghds/react-native/theme';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

const meta: Meta<typeof Carousel> = {
  title: 'Components/Carousel',
  component: Carousel,
  args: { orientation: 'horizontal' },
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
};

export default meta;
type Story = StoryObj<typeof Carousel>;

const SLIDES = ['One', 'Two', 'Three', 'Four'];

function Slide({ label }: { label: string }) {
  return (
    <Card>
      <Box height={120} alignItems="center" justifyContent="center">
        <Text variant="title">{label}</Text>
      </Box>
    </Card>
  );
}

export const Horizontal: Story = {
  render: (args) => (
    <Box width={320} gap="md">
      <Carousel {...args}>
        <CarouselContent>
          {SLIDES.map((label) => (
            <CarouselItem key={label}>
              <Slide label={label} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <CarouselPrevious />
          <CarouselIndicators />
          <CarouselNext />
        </Box>
      </Carousel>
    </Box>
  ),
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <Carousel {...args}>
      <Box width={320} flexDirection="row" gap="md" alignItems="center">
        <Box height={200} flex={1}>
          <CarouselContent>
            {SLIDES.map((label) => (
              <CarouselItem key={label}>
                <Slide label={label} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Box>
        <Box gap="sm">
          <CarouselPrevious />
          <CarouselNext />
        </Box>
      </Box>
    </Carousel>
  ),
};

export const RendersSlides: Story = {
  args: { testID: 'demo-carousel' },
  render: (args) => (
    <Box width={320} gap="md">
      <Carousel {...args}>
        <CarouselContent>
          {SLIDES.map((label) => (
            <CarouselItem key={label}>
              <Slide label={label} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <Box flexDirection="row" gap="sm">
          <CarouselPrevious />
          <CarouselNext />
        </Box>
      </Carousel>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('One')).toBeInTheDocument();
    await expect(await canvas.findByLabelText('Next slide')).toBeInTheDocument();
  },
};

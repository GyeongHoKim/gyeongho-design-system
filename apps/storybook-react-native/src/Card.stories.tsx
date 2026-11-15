import { Card } from '@ghds/react-native/card';
import { Text } from '@ghds/react-native/theme';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { expect, within } from 'storybook/test';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  args: { elevated: false },
  argTypes: { elevated: { control: 'boolean' } },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Flat: Story = {
  render: (args) => (
    <Card {...args}>
      <Text variant="title">Sketchy Card</Text>
      <Text variant="body">A hand-drawn surface container.</Text>
    </Card>
  ),
};

export const Elevated: Story = {
  args: { elevated: true },
  render: (args) => (
    <Card {...args}>
      <Text variant="title">Elevated Card</Text>
      <Text variant="body">Now with an offset sketch shadow.</Text>
    </Card>
  ),
};

export const RendersContent: Story = {
  args: { testID: 'demo-card' },
  render: (args) => (
    <Card {...args}>
      <Text>Inside the card</Text>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Inside the card')).toBeInTheDocument();
  },
};

type Variant = 'plain' | 'sticky' | 'lined';
type Fastener = 'none' | 'tape' | 'pin';

const paper = (variant: Variant, fastener: Fastener): Story => ({
  render: () => (
    <View style={{ paddingTop: 32 }}>
      <Card variant={variant} fastener={fastener}>
        <Text variant="title">Paper card</Text>
        <Text variant="body">Short note on paper.</Text>
      </Card>
    </View>
  ),
});

export const PlainNone: Story = paper('plain', 'none');
export const PlainTape: Story = paper('plain', 'tape');
export const PlainPin: Story = paper('plain', 'pin');
export const StickyNone: Story = paper('sticky', 'none');
export const StickyTape: Story = paper('sticky', 'tape');
export const StickyPin: Story = paper('sticky', 'pin');
export const LinedNone: Story = paper('lined', 'none');
export const LinedTape: Story = paper('lined', 'tape');
export const LinedPin: Story = paper('lined', 'pin');

const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const;

export const StickyTones: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      {tones.map((tone) => (
        <Card key={tone} variant="sticky" tone={tone}>
          <Text variant="body">{tone}</Text>
        </Card>
      ))}
    </View>
  ),
};

export const Tilt: Story = {
  render: () => (
    <View style={{ gap: 24 }}>
      {(['sticky', 'lined'] as const).flatMap((variant) =>
        (['left', 'right'] as const).map((tilt) => (
          <Card key={`${variant}-${tilt}`} variant={variant} tilt={tilt}>
            <Text variant="body">
              {variant} {tilt}
            </Text>
          </Card>
        )),
      )}
    </View>
  ),
};

export const Korean: Story = {
  render: () => (
    <View style={{ paddingTop: 32 }}>
      <Card variant="lined" fastener="tape">
        <Text variant="title">오늘의 메모</Text>
        <Text variant="body">우유와 달걀을 사요.</Text>
      </Card>
    </View>
  ),
};

import { DirectionProvider, useDirection } from '@ghds/react/direction';
import { Item, ItemContent, ItemDescription, ItemTitle } from '@ghds/react/item';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

/** Reads the nearest provider's direction and echoes it, proving context flows. */
function DirectionReadout() {
  const dir = useDirection();
  return (
    <p
      data-testid="direction-readout"
      style={{
        margin: 0,
        color: 'var(--sys-color-text-secondary)',
        fontFamily: 'var(--sys-typography-caption-fontFamily)',
        fontSize: 'var(--sys-typography-caption-fontSize)',
      }}
    >
      useDirection() = {dir}
    </p>
  );
}

/**
 * A short list of items plus the readout, wrapped in a native `dir` attribute so
 * CSS logical properties resolve alongside the JS-readable context value.
 */
function DirectionDemo({ dir }: { dir: 'ltr' | 'rtl' }) {
  return (
    <DirectionProvider dir={dir}>
      <div
        dir={dir}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sys-spacing-sm)' }}
      >
        <DirectionReadout />
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>الرصيد</ItemTitle>
            <ItemDescription>Account balance</ItemDescription>
          </ItemContent>
        </Item>
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>الإعدادات</ItemTitle>
            <ItemDescription>Settings</ItemDescription>
          </ItemContent>
        </Item>
      </div>
    </DirectionProvider>
  );
}

const meta = {
  title: 'Components/Direction',
  component: DirectionProvider,
  argTypes: {
    dir: { control: 'inline-radio', options: ['ltr', 'rtl'] },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DirectionProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ltr: Story = {
  render: () => <DirectionDemo dir="ltr" />,
};

export const Rtl: Story = {
  render: () => <DirectionDemo dir="rtl" />,
};

/** Both directions side by side, so the layout mirror is obvious. */
export const SideBySide: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--sys-spacing-lg)', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 240px' }}>
        <DirectionDemo dir="ltr" />
      </div>
      <div style={{ flex: '1 1 240px' }}>
        <DirectionDemo dir="rtl" />
      </div>
    </div>
  ),
};

/** The `useDirection()` hook reports the provider's value to descendants. */
export const HookReadsRtl: Story = {
  render: () => <DirectionDemo dir="rtl" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('direction-readout')).toHaveTextContent('useDirection() = rtl');
  },
};

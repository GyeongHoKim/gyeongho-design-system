import { AspectRatio } from '@ghds/react/aspect-ratio';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

/** A labeled fill that stretches to the whole ratio box, so the shape is visible. */
function Placeholder({ label }: { label: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--sys-color-bg-muted)',
        color: 'var(--sys-color-text-secondary)',
        fontFamily: 'var(--sys-typography-label-fontFamily)',
        fontSize: 'var(--sys-typography-label-fontSize)',
      }}
    >
      {label}
    </div>
  );
}

const meta = {
  title: 'Components/AspectRatio',
  component: AspectRatio,
  argTypes: {
    ratio: { control: { type: 'number', step: 0.05 } },
  },
  args: {
    ratio: 16 / 9,
    style: { maxWidth: 320 },
    children: <Placeholder label="16 / 9" />,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AspectRatio>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Widescreen: Story = {
  args: { ratio: 16 / 9, children: <Placeholder label="16 / 9" /> },
};

export const Square: Story = {
  args: { ratio: 1, children: <Placeholder label="1 / 1" /> },
};

export const Standard: Story = {
  args: { ratio: 4 / 3, children: <Placeholder label="4 / 3" /> },
};

/** A single `<img>` sized to fill the ratio box is the primary real-world use. */
export const WithImage: Story = {
  args: {
    ratio: 16 / 9,
    children: (
      <img
        src="https://placehold.co/640x360"
        alt="Placeholder landscape"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    ),
  },
};

export const AllRatios: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--sys-spacing-md)', flexWrap: 'wrap' }}>
      {[
        [16 / 9, '16 / 9'],
        [1, '1 / 1'],
        [4 / 3, '4 / 3'],
      ].map(([ratio, label]) => (
        <div key={label} style={{ width: 200 }}>
          <AspectRatio ratio={ratio as number}>
            <Placeholder label={label as string} />
          </AspectRatio>
        </div>
      ))}
    </div>
  ),
};

/** The box honors the CSS `aspect-ratio` it is given: a square is exactly as tall as it is wide. */
export const KeepsRatio: Story = {
  args: {
    ratio: 1,
    'data-testid': 'ratio-box',
    children: <Placeholder label="1 / 1" />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByTestId('ratio-box');
    const rect = box.getBoundingClientRect();
    await expect(Math.round(rect.width)).toBe(Math.round(rect.height));
  },
};

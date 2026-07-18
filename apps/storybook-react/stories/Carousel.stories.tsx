import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@ghds/react/carousel';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

const SLIDES = [1, 2, 3, 4, 5];

/** A centered slide face so each item is visible in the viewport. */
function Slide({ n, height = 200 }: { n: number; height?: number }) {
  return (
    <div
      style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--sys-color-bg-muted)',
        color: 'var(--sys-color-text-secondary)',
        borderRadius: 'var(--sys-radius-md)',
        fontFamily: 'var(--sys-typography-title-fontFamily)',
        fontSize: 'var(--sys-typography-title-fontSize)',
      }}
    >
      Slide {n}
    </div>
  );
}

const meta = {
  title: 'Components/Carousel',
  component: Carousel,
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
} satisfies Meta<typeof Carousel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <Carousel orientation="horizontal" aria-label="Photos">
        <CarouselContent>
          {SLIDES.map((n) => (
            <CarouselItem key={n}>
              <Slide n={n} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div
          style={{
            display: 'flex',
            gap: 'var(--sys-spacing-sm)',
            justifyContent: 'center',
            marginTop: 'var(--sys-spacing-sm)',
          }}
        >
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Carousel orientation="vertical" aria-label="Photos">
        <CarouselContent style={{ maxHeight: 240 }}>
          {SLIDES.map((n) => (
            <CarouselItem key={n}>
              <Slide n={n} height={240} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div
          style={{
            display: 'flex',
            gap: 'var(--sys-spacing-sm)',
            justifyContent: 'center',
            marginTop: 'var(--sys-spacing-sm)',
          }}
        >
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </div>
  ),
};

/**
 * The prev/next controls carry their ARIA labels, and Previous starts disabled
 * because the viewport is at the start (no layout-dependent scroll assertion).
 */
export const Controls: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <Carousel orientation="horizontal" aria-label="Photos">
        <CarouselContent>
          {SLIDES.map((n) => (
            <CarouselItem key={n}>
              <Slide n={n} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div
          style={{
            display: 'flex',
            gap: 'var(--sys-spacing-sm)',
            marginTop: 'var(--sys-spacing-sm)',
          }}
        >
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const prev = canvas.getByRole('button', { name: 'Previous slide' });
    const next = canvas.getByRole('button', { name: 'Next slide' });
    await expect(prev).toBeDisabled();
    await expect(next).toBeInTheDocument();
  },
};

/** Visual-regression guard: slides + controls on an opaque dark surface. */
export const OnOpaqueSurfaceDark: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <div style={{ width: 480 }}>
        <Carousel orientation="horizontal" aria-label="Photos">
          <CarouselContent>
            {SLIDES.map((n) => (
              <CarouselItem key={n}>
                <Slide n={n} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div
            style={{
              display: 'flex',
              gap: 'var(--sys-spacing-sm)',
              marginTop: 'var(--sys-spacing-sm)',
            }}
          >
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      </div>
    </div>
  ),
};

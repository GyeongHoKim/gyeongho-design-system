import '@ghds/web-components/carousel';
import '@ghds/web-components/carousel-item';
import type { GhCarouselOrientation } from '@ghds/web-components/carousel';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

interface CarouselArgs {
  orientation: GhCarouselOrientation;
  count: number;
}

function slide(index: number) {
  return html`<gh-carousel-item>
    <div
      style="display: flex; align-items: center; justify-content: center; height: 160px; border-radius: var(--sys-radius-md); background: var(--sys-color-bg-muted); color: var(--sys-color-text-primary); font-family: var(--sys-typography-title-fontFamily); font-size: var(--sys-typography-title-fontSize);"
    >
      Slide ${index + 1}
    </div>
  </gh-carousel-item>`;
}

const meta: Meta<CarouselArgs> = {
  title: 'Components/Carousel',
  tags: ['autodocs'],
  render: (args) =>
    html`<gh-carousel
      orientation=${args.orientation}
      style=${
        args.orientation === 'vertical'
          ? 'display: block; max-width: 320px; height: 220px;'
          : 'display: block; max-width: 320px;'
      }
    >
      ${Array.from({ length: args.count }, (_, i) => slide(i))}
    </gh-carousel>`,
  args: {
    orientation: 'horizontal',
    count: 4,
  },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    count: { control: { type: 'number', min: 1, max: 8 } },
  },
};

export default meta;
type Story = StoryObj<CarouselArgs>;

export const Horizontal: Story = { args: { orientation: 'horizontal' } };

export const Vertical: Story = { args: { orientation: 'vertical' } };

export const SingleSlide: Story = { args: { count: 1 } };

export const Dark: Story = {
  render: (args) => html`
    <div data-theme="dark" style="background: var(--sys-color-bg-surface); padding: var(--sys-spacing-lg);">
      <gh-carousel orientation=${args.orientation} style="display: block; max-width: 320px;">
        ${Array.from({ length: args.count }, (_, i) => slide(i))}
      </gh-carousel>
    </div>
  `,
};

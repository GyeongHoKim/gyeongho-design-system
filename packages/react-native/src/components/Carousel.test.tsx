import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Text } from '../theme/primitives.js';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './Carousel.js';

function Basic() {
  return (
    <Carousel testID="carousel">
      <CarouselContent>
        <CarouselItem>
          <Text>Slide one</Text>
        </CarouselItem>
        <CarouselItem>
          <Text>Slide two</Text>
        </CarouselItem>
        <CarouselItem>
          <Text>Slide three</Text>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

describe('Carousel', () => {
  it('renders its slides', () => {
    renderWithTheme(<Basic />);
    expect(screen.getByText('Slide one')).toBeInTheDocument();
    expect(screen.getByText('Slide two')).toBeInTheDocument();
    expect(screen.getByText('Slide three')).toBeInTheDocument();
  });

  it('exposes labelled previous/next controls', () => {
    renderWithTheme(<Basic />);
    expect(screen.getByLabelText('Previous slide')).toBeInTheDocument();
    expect(screen.getByLabelText('Next slide')).toBeInTheDocument();
  });

  it('exposes a testID handle on the region', () => {
    renderWithTheme(<Basic />);
    expect(screen.getByTestId('carousel')).toBeInTheDocument();
  });

  it('disables the previous control at the start', () => {
    renderWithTheme(<Basic />);
    // No scroll has occurred, so there is nothing before the first slide.
    expect(screen.getByLabelText('Previous slide')).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders vertical orientation without error', () => {
    renderWithTheme(
      <Carousel orientation="vertical" testID="vertical">
        <CarouselContent>
          <CarouselItem>
            <Text>Top</Text>
          </CarouselItem>
          <CarouselItem>
            <Text>Bottom</Text>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>,
    );
    expect(screen.getByTestId('vertical')).toBeInTheDocument();
    expect(screen.getByText('Top')).toBeInTheDocument();
  });

  it('throws when a sub-component is used outside a Carousel', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<CarouselNext />)).toThrow(/inside a <Carousel>/);
    spy.mockRestore();
  });
});

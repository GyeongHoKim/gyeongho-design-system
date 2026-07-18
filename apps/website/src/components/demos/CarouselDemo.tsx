import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@ghds/react/carousel';

const SLIDES = [1, 2, 3, 4, 5];

/** Live demo of a horizontal scroll-snap Carousel with prev/next controls (React). */
export default function CarouselDemo(): React.JSX.Element {
  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <Carousel orientation="horizontal" aria-label="Photos">
        <CarouselContent>
          {SLIDES.map((n) => (
            <CarouselItem key={n}>
              <div
                style={{
                  height: 200,
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
  );
}

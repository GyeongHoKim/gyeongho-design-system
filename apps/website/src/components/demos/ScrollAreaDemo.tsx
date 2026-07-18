import { ScrollArea } from '@ghds/react/scroll-area';

const PARAGRAPHS = Array.from({ length: 8 }, (_, i) => i + 1);

/** Live demo of a vertical ScrollArea constrained by maxHeight (React). */
export default function ScrollAreaDemo(): React.JSX.Element {
  return (
    <ScrollArea orientation="vertical" style={{ maxHeight: 200, maxWidth: 360 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sys-spacing-sm)' }}>
        {PARAGRAPHS.map((n) => (
          <p
            key={n}
            style={{
              margin: 0,
              color: 'var(--sys-color-text-primary)',
              fontFamily: 'var(--sys-typography-body-fontFamily)',
              fontSize: 'var(--sys-typography-body-fontSize)',
            }}
          >
            {n}. The quick brown fox jumps over the lazy dog, again and again until the box
            overflows and the themed scrollbar appears.
          </p>
        ))}
      </div>
    </ScrollArea>
  );
}

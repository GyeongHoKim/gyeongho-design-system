import { Marker } from '@ghds/react/marker';

/** Live demo of Marker's four highlight tones inside a sentence (React). */
export default function MarkerDemo(): React.JSX.Element {
  return (
    <p
      style={{
        maxWidth: 520,
        margin: 0,
        fontFamily: 'var(--sys-typography-body-fontFamily)',
        fontSize: 'var(--sys-typography-body-fontSize)',
        color: 'var(--sys-color-text-primary)',
        lineHeight: 1.7,
      }}
    >
      Highlight tones read as intent: <Marker variant="default">default</Marker>,{' '}
      <Marker variant="success">success</Marker>, <Marker variant="info">info</Marker>, and{' '}
      <Marker variant="danger">danger</Marker> each paint a different sketchy colour behind the
      words.
    </p>
  );
}

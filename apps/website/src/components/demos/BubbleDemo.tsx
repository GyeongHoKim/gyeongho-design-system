import { Bubble } from '@ghds/react/bubble';

/** Live demo of received and sent chat bubbles (React). */
export default function BubbleDemo(): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sys-spacing-sm)',
        maxWidth: 360,
      }}
    >
      <Bubble variant="received">Hey — are we still on for tomorrow?</Bubble>
      <div style={{ alignSelf: 'flex-end' }}>
        <Bubble variant="sent">Yes! See you at 10.</Bubble>
      </div>
    </div>
  );
}

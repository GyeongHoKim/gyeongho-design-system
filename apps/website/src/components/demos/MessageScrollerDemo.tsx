import { Avatar } from '@ghds/react/avatar';
import { Bubble } from '@ghds/react/bubble';
import {
  Message,
  MessageAuthor,
  MessageAvatar,
  MessageContent,
  MessageTimestamp,
} from '@ghds/react/message';
import { MessageScroller } from '@ghds/react/message-scroller';

const LINES = [
  'Hey — are we still on for tomorrow?',
  'Yes! See you at 10.',
  'Should I bring anything?',
  'Just the slides, I think.',
  "Great, I'll print a few copies.",
  'Perfect. Coffee on me.',
  'Deal. See you then!',
  'One more thing — which room?',
  'The one on the third floor.',
  'Got it. Thanks!',
];

/** Live demo of a bounded, auto-sticking chat log (React). */
export default function MessageScrollerDemo(): React.JSX.Element {
  return (
    <MessageScroller style={{ maxHeight: 320, maxWidth: 480 }}>
      {LINES.map((text, index) => {
        const sent = index % 2 === 1;
        return (
          <Message key={text} side={sent ? 'sent' : 'received'}>
            <MessageAvatar>
              <Avatar name={sent ? 'Me' : 'Bo Ram'} />
            </MessageAvatar>
            <MessageContent style={sent ? { alignItems: 'flex-end' } : undefined}>
              <div
                style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--sys-spacing-xs)' }}
              >
                <MessageAuthor>{sent ? 'You' : 'Bo Ram'}</MessageAuthor>
                <MessageTimestamp>10:0{index}</MessageTimestamp>
              </div>
              <Bubble variant={sent ? 'sent' : 'received'}>{text}</Bubble>
            </MessageContent>
          </Message>
        );
      })}
    </MessageScroller>
  );
}

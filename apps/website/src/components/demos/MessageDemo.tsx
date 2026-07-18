import { Avatar } from '@ghds/react/avatar';
import { Bubble } from '@ghds/react/bubble';
import {
  Message,
  MessageAuthor,
  MessageAvatar,
  MessageContent,
  MessageTimestamp,
} from '@ghds/react/message';

/** Live demo of a short received/sent conversation with avatars and headers (React). */
export default function MessageDemo(): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sys-spacing-md)',
        maxWidth: 480,
      }}
    >
      <Message side="received">
        <MessageAvatar>
          <Avatar name="Bo Ram" />
        </MessageAvatar>
        <MessageContent>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--sys-spacing-xs)' }}>
            <MessageAuthor>Bo Ram</MessageAuthor>
            <MessageTimestamp>10:02</MessageTimestamp>
          </div>
          <Bubble variant="received">Hey — are we still on for tomorrow?</Bubble>
        </MessageContent>
      </Message>
      <Message side="sent">
        <MessageAvatar>
          <Avatar name="Me" />
        </MessageAvatar>
        <MessageContent style={{ alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--sys-spacing-xs)' }}>
            <MessageAuthor>You</MessageAuthor>
            <MessageTimestamp>10:03</MessageTimestamp>
          </div>
          <Bubble variant="sent">Yes! See you at 10.</Bubble>
        </MessageContent>
      </Message>
    </div>
  );
}

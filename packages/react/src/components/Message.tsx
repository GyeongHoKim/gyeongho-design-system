import { tokens } from '@ghds/tokens';
import { type CSSProperties, forwardRef, type HTMLAttributes } from 'react';
import { cssVars } from '../lib/cssVars.js';

/** Which side of the conversation a {@link Message} sits on. */
export type MessageSide = 'received' | 'sent';

export interface MessageProps extends HTMLAttributes<HTMLDivElement> {
  /** `'received'` (default) aligns to the start; `'sent'` aligns to the end. */
  side?: MessageSide;
}

const message = tokens.comp.message;
const c = cssVars.comp.message;

/**
 * A hand-drawn chat message row: an optional {@link MessageAvatar}, then a
 * {@link MessageContent} column (author + timestamp header and a
 * {@link Bubble}). `side` flips the layout so outgoing messages align to the
 * end. Spacing and text colours come from `@ghds/tokens` (`comp.message.*`).
 */
export const Message = forwardRef<HTMLDivElement, MessageProps>(function Message(
  { side = 'received', children, style, ...rest },
  forwardedRef,
) {
  const rootStyle: CSSProperties = {
    display: 'flex',
    flexDirection: side === 'sent' ? 'row-reverse' : 'row',
    alignItems: 'flex-start',
    gap: message.rowGap,
    ...style,
  };
  return (
    <div ref={forwardedRef} style={rootStyle} {...rest}>
      {children}
    </div>
  );
});

/** Leading avatar slot for a {@link Message}. */
export const MessageAvatar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function MessageAvatar({ children, style, ...rest }, forwardedRef) {
    const avatarStyle: CSSProperties = {
      display: 'flex',
      flexShrink: 0,
      ...style,
    };
    return (
      <div ref={forwardedRef} style={avatarStyle} {...rest}>
        {children}
      </div>
    );
  },
);

/** The stacked content column (header + bubble) of a {@link Message}. */
export const MessageContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function MessageContent({ children, style, ...rest }, forwardedRef) {
    const contentStyle: CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: message.gap,
      minWidth: 0,
      ...style,
    };
    return (
      <div ref={forwardedRef} style={contentStyle} {...rest}>
        {children}
      </div>
    );
  },
);

/** The author name shown above a message's bubble. */
export const MessageAuthor = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function MessageAuthor({ children, style, ...rest }, forwardedRef) {
    const authorStyle: CSSProperties = {
      color: c.text.author,
      fontFamily: tokens.sys.typography.label.fontFamily,
      fontSize: tokens.sys.typography.label.fontSize,
      fontWeight: tokens.sys.typography.label.fontWeight,
      lineHeight: String(tokens.sys.typography.label.lineHeight),
      ...style,
    };
    return (
      <span ref={forwardedRef} style={authorStyle} {...rest}>
        {children}
      </span>
    );
  },
);

/** The timestamp shown alongside the author of a message. */
export const MessageTimestamp = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function MessageTimestamp({ children, style, ...rest }, forwardedRef) {
    const timestampStyle: CSSProperties = {
      color: c.text.timestamp,
      fontFamily: tokens.sys.typography.caption.fontFamily,
      fontSize: tokens.sys.typography.caption.fontSize,
      fontWeight: tokens.sys.typography.caption.fontWeight,
      lineHeight: String(tokens.sys.typography.caption.lineHeight),
      ...style,
    };
    return (
      <span ref={forwardedRef} style={timestampStyle} {...rest}>
        {children}
      </span>
    );
  },
);

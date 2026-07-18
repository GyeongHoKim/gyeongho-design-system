import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Bubble } from './Bubble.js';
import {
  Message,
  MessageAuthor,
  MessageAvatar,
  MessageContent,
  MessageTimestamp,
} from './Message.js';

function Row(side: 'received' | 'sent') {
  return (
    <Message side={side} testID={`msg-${side}`}>
      <MessageAvatar>
        <span>avatar</span>
      </MessageAvatar>
      <MessageContent>
        <MessageAuthor>Ada</MessageAuthor>
        <MessageTimestamp>09:41</MessageTimestamp>
        <Bubble variant={side}>Hi</Bubble>
      </MessageContent>
    </Message>
  );
}

describe('Message', () => {
  it('renders the composed author, timestamp and bubble', () => {
    renderWithTheme(Row('received'));
    expect(screen.getByTestId('msg-received')).toBeInTheDocument();
    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('09:41')).toBeInTheDocument();
    expect(screen.getByText('Hi')).toBeInTheDocument();
    expect(screen.getByText('avatar')).toBeInTheDocument();
  });

  it('renders the sent side without error', () => {
    renderWithTheme(Row('sent'));
    expect(screen.getByTestId('msg-sent')).toBeInTheDocument();
    expect(screen.getByText('Ada')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Bubble } from './Bubble.js';
import {
  Message,
  MessageAuthor,
  MessageAvatar,
  MessageContent,
  MessageTimestamp,
} from './Message.js';

describe('Message', () => {
  it('renders a composed message row', () => {
    render(
      <Message>
        <MessageAvatar>
          <span data-testid="avatar">A</span>
        </MessageAvatar>
        <MessageContent>
          <MessageAuthor>Ada</MessageAuthor>
          <MessageTimestamp>09:41</MessageTimestamp>
          <Bubble>Hi!</Bubble>
        </MessageContent>
      </Message>,
    );
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('09:41')).toBeInTheDocument();
    expect(screen.getByText('Hi!')).toBeInTheDocument();
  });

  it('reverses the layout for sent messages', () => {
    const { container } = render(
      <Message side="sent">
        <MessageContent>
          <Bubble variant="sent">Yo</Bubble>
        </MessageContent>
      </Message>,
    );
    expect(container.firstElementChild).toHaveStyle({ flexDirection: 'row-reverse' });
  });

  it('forwards a role to the row', () => {
    render(
      <Message role="listitem" aria-label="message">
        x
      </Message>,
    );
    expect(screen.getByRole('listitem', { name: 'message' })).toBeInTheDocument();
  });
});

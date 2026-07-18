import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Text } from '../theme/primitives.js';
import { MessageScroller } from './MessageScroller.js';

describe('MessageScroller', () => {
  it('renders its children', () => {
    renderWithTheme(
      <MessageScroller testID="log">
        <Text>First message</Text>
        <Text>Second message</Text>
      </MessageScroller>,
    );
    expect(screen.getByTestId('log')).toBeInTheDocument();
    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
  });

  it('renders with stickToBottom disabled without error', () => {
    renderWithTheme(
      <MessageScroller stickToBottom={false} testID="log">
        <Text>Only message</Text>
      </MessageScroller>,
    );
    expect(screen.getByTestId('log')).toBeInTheDocument();
    expect(screen.getByText('Only message')).toBeInTheDocument();
  });
});

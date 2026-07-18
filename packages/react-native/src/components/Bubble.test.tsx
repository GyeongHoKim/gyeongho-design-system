import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Bubble } from './Bubble.js';

describe('Bubble', () => {
  it('renders its content', () => {
    renderWithTheme(<Bubble testID="bubble">Hello there</Bubble>);
    expect(screen.getByText('Hello there')).toBeInTheDocument();
    expect(screen.getByTestId('bubble')).toBeInTheDocument();
  });

  it('renders the received variant by default', () => {
    renderWithTheme(<Bubble testID="received">Incoming</Bubble>);
    expect(screen.getByTestId('received')).toBeInTheDocument();
    expect(screen.getByText('Incoming')).toBeInTheDocument();
  });

  it('renders the sent variant without error', () => {
    renderWithTheme(
      <Bubble variant="sent" testID="sent">
        Outgoing
      </Bubble>,
    );
    expect(screen.getByTestId('sent')).toBeInTheDocument();
    expect(screen.getByText('Outgoing')).toBeInTheDocument();
  });
});

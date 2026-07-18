import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MessageScroller } from './MessageScroller.js';

describe('MessageScroller', () => {
  it('renders its messages', () => {
    render(
      <MessageScroller style={{ maxHeight: 200 }}>
        <p>first</p>
        <p>second</p>
      </MessageScroller>,
    );
    expect(screen.getByText('first')).toBeInTheDocument();
    expect(screen.getByText('second')).toBeInTheDocument();
  });

  it('is a themed, scrollable viewport', () => {
    const { container } = render(<MessageScroller>content</MessageScroller>);
    const viewport = container.firstElementChild as HTMLElement;
    expect(viewport).toHaveStyle({ overflowY: 'auto', scrollbarWidth: 'thin' });
  });

  it('forwards arbitrary props such as role to the viewport', () => {
    render(
      <MessageScroller role="log" aria-label="conversation">
        x
      </MessageScroller>,
    );
    expect(screen.getByRole('log', { name: 'conversation' })).toBeInTheDocument();
  });

  it('keeps a pinned bottom from throwing when content mounts', () => {
    // jsdom has no layout, but the stick-to-bottom layout effect must run safely.
    expect(() =>
      render(
        <MessageScroller>
          <p>a</p>
          <p>b</p>
        </MessageScroller>,
      ),
    ).not.toThrow();
  });
});

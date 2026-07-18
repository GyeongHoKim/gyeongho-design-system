import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Bubble } from './Bubble.js';

describe('Bubble', () => {
  it('renders its message content', () => {
    render(<Bubble>Hello there</Bubble>);
    expect(screen.getByText('Hello there')).toBeInTheDocument();
  });

  it('paints a decorative sketch surface with a fill', () => {
    const { container } = render(<Bubble>hi</Bubble>);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });

  it('renders both variants', () => {
    render(
      <>
        <Bubble variant="received">in</Bubble>
        <Bubble variant="sent">out</Bubble>
      </>,
    );
    expect(screen.getByText('in')).toBeInTheDocument();
    expect(screen.getByText('out')).toBeInTheDocument();
  });

  it('forwards arbitrary props to the root element', () => {
    render(<Bubble aria-label="msg">x</Bubble>);
    expect(screen.getByLabelText('msg')).toBeInTheDocument();
  });
});

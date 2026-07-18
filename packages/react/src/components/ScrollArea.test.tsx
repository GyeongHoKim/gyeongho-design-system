import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ScrollArea } from './ScrollArea.js';

describe('ScrollArea', () => {
  it('renders its children inside a viewport', () => {
    render(
      <ScrollArea style={{ maxHeight: 120 }}>
        <p>Scrollable body</p>
      </ScrollArea>,
    );
    expect(screen.getByText('Scrollable body')).toBeInTheDocument();
  });

  it('draws a decorative sketch border', () => {
    const { container } = render(<ScrollArea>content</ScrollArea>);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });

  it('themes the native scrollbar on the viewport', () => {
    const { container } = render(<ScrollArea>content</ScrollArea>);
    // The viewport is the last child of the root (after the sketch surface).
    const viewport = container.firstElementChild?.lastElementChild as HTMLElement;
    expect(viewport).toHaveStyle({ scrollbarWidth: 'thin' });
  });

  it('scrolls horizontally when orientation is horizontal', () => {
    const { container } = render(<ScrollArea orientation="horizontal">content</ScrollArea>);
    const viewport = container.firstElementChild?.lastElementChild as HTMLElement;
    expect(viewport).toHaveStyle({ overflowX: 'auto', overflowY: 'hidden' });
  });
});

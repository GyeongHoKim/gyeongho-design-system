import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar, initialsFrom } from './Avatar.js';

describe('initialsFrom', () => {
  it('takes the first and last word initials', () => {
    expect(initialsFrom('Ada Lovelace')).toBe('AL');
  });
  it('uses a single initial for one word', () => {
    expect(initialsFrom('Grace')).toBe('G');
  });
  it('ignores extra whitespace and returns empty for blank', () => {
    expect(initialsFrom('  Marie   Curie ')).toBe('MC');
    expect(initialsFrom('   ')).toBe('');
  });
});

describe('Avatar', () => {
  it('renders the image when a src is provided', () => {
    render(<Avatar src="/ada.png" name="Ada Lovelace" />);
    const img = screen.getByRole('img', { name: 'Ada Lovelace' });
    expect(img).toBeInTheDocument();
    expect(img.querySelector('img')).toHaveAttribute('src', '/ada.png');
  });

  it('renders initials when no src is given', () => {
    render(<Avatar name="Ada Lovelace" />);
    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument();
  });

  it('is decorative (aria-hidden) when it has no name or alt', () => {
    const { container } = render(<Avatar />);
    const root = container.firstElementChild;
    expect(root).toHaveAttribute('aria-hidden', 'true');
  });

  it('retries the image when src changes after a load error', () => {
    const { rerender, container } = render(<Avatar src="/broken.png" name="Ada Lovelace" />);
    // Simulate the first image failing to load → falls back to initials.
    const img = container.querySelector('img');
    if (img) {
      fireEvent.error(img);
    }
    expect(screen.getByText('AL')).toBeInTheDocument();
    // A new, valid src must be retried, not stranded behind the fallback.
    rerender(<Avatar src="/valid.png" name="Ada Lovelace" />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/valid.png');
  });

  it('renders a decorative sketch ellipse outline', () => {
    const { container } = render(<Avatar name="Ada" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });
});

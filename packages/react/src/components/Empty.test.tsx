import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Empty } from './Empty.js';

describe('Empty', () => {
  it('renders the title', () => {
    render(<Empty title="No results" />);
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('renders description and action when provided', () => {
    render(
      <Empty
        title="No results"
        description="Try a different search."
        action={<button type="button">Reset</button>}
      />,
    );
    expect(screen.getByText('Try a different search.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });

  it('renders an icon when provided', () => {
    const { container } = render(<Empty icon="search" title="No results" />);
    expect(container.querySelector('svg')).not.toBeNull();
  });
});

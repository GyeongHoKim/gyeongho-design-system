import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button.js';

describe('Button', () => {
  it('renders an accessible button with its label', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('renders a decorative sketch outline behind the label', () => {
    const { container } = render(<Button>Draw</Button>);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    // The mock ResizeObserver supplies a size, so geometry must be generated.
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });

  it('fires onClick when activated', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await user.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is keyboard operable', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Enter</Button>);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Enter' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalled();
  });

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Nope
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Nope' });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('exposes the variant via a data attribute', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveAttribute(
      'data-variant',
      'danger',
    );
  });

  it('renders as the slotted element with asChild', () => {
    render(
      <Button asChild>
        <a href="/next">Go to next page</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Go to next page' });
    expect(link).toHaveAttribute('href', '/next');
    expect(link.querySelector('svg')).not.toBeNull();
  });
});

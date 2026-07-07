import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Alert } from './Alert.js';

describe('Alert', () => {
  it('renders the title and body with a status role', () => {
    render(
      <Alert variant="success" title="Saved">
        Your changes are saved.
      </Alert>,
    );
    const alert = screen.getByRole('status');
    expect(alert).toHaveTextContent('Saved');
    expect(alert).toHaveTextContent('Your changes are saved.');
  });

  it('uses the assertive alert role for the danger variant', () => {
    render(<Alert variant="danger">Something failed</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Something failed');
  });

  it('renders a dismiss button only when onDismiss is provided', () => {
    const { rerender } = render(<Alert variant="info">Note</Alert>);
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();
    const onDismiss = vi.fn();
    rerender(
      <Alert variant="info" onDismiss={onDismiss}>
        Note
      </Alert>,
    );
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('calls onDismiss when the dismiss button is clicked', async () => {
    const onDismiss = vi.fn();
    render(
      <Alert variant="warning" onDismiss={onDismiss}>
        Careful
      </Alert>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { Toast, Toaster, toast } from './Toast.js';

// Clear any queued toasts between tests (the store is module-level).
afterEach(() => {
  for (let i = 0; i < 50; i += 1) {
    toast.dismiss(`toast-${i}`);
  }
});

describe('Toast (presentational)', () => {
  it('renders a status card with title, message and dismiss', () => {
    render(
      <Toast variant="success" title="Saved" onDismiss={() => {}}>
        Your changes are saved.
      </Toast>,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('Your changes are saved.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('uses role=alert for the danger variant', () => {
    render(<Toast variant="danger">Something failed</Toast>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

describe('toast() + Toaster', () => {
  it('renders a toast enqueued via the imperative API', () => {
    render(<Toaster />);
    act(() => {
      toast.success('Profile updated', { title: 'Done' });
    });
    expect(screen.getByText('Profile updated')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('maps toast.error to the danger (alert) variant', () => {
    render(<Toaster />);
    act(() => {
      toast.error('Upload failed');
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Upload failed');
  });

  it('dismisses a toast by id', async () => {
    render(<Toaster />);
    let id = '';
    act(() => {
      id = toast('Temporary', { duration: 0 });
    });
    expect(screen.getByText('Temporary')).toBeInTheDocument();
    act(() => {
      toast.dismiss(id);
    });
    expect(screen.queryByText('Temporary')).toBeNull();
  });

  it('dismisses a toast from its close button', async () => {
    render(<Toaster />);
    act(() => {
      toast('Closable', { duration: 0 });
    });
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText('Closable')).toBeNull();
  });
});

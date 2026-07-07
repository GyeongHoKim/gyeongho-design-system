import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toast } from './Toast.js';

describe('Toast', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('keeps an empty live region mounted (no content) when closed', () => {
    render(
      <Toast open={false} onClose={() => {}} variant="info">
        Hi
      </Toast>,
    );
    // The polite live region persists so it can announce on open, but is empty.
    expect(screen.queryByText('Hi')).toBeNull();
  });

  it('renders a status toast when open', () => {
    render(
      <Toast open onClose={() => {}} variant="success" title="Saved">
        Done
      </Toast>,
    );
    const toast = screen.getByRole('status');
    expect(toast).toHaveTextContent('Saved');
    expect(toast).toHaveTextContent('Done');
  });

  it('uses the assertive alert role for danger', () => {
    render(
      <Toast open onClose={() => {}} variant="danger">
        Failed
      </Toast>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('auto-dismisses after the duration', () => {
    const onClose = vi.fn();
    render(
      <Toast open onClose={onClose} duration={4000}>
        Bye soon
      </Toast>,
    );
    expect(onClose).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not auto-dismiss when duration is 0', () => {
    const onClose = vi.fn();
    render(
      <Toast open onClose={onClose} duration={0}>
        Sticky
      </Toast>,
    );
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(onClose).not.toHaveBeenCalled();
  });
});

import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Toast } from './Toast.js';

describe('Toast', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('renders the title and body when open', () => {
    renderWithTheme(
      <Toast open onClose={() => {}} variant="success" title="Saved" duration={0}>
        Done
      </Toast>,
    );
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('auto-dismisses after the duration', () => {
    const onClose = vi.fn();
    renderWithTheme(
      <Toast open onClose={onClose} duration={4000}>
        Bye
      </Toast>,
    );
    expect(onClose).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('dismisses from the close button', () => {
    const onClose = vi.fn();
    renderWithTheme(
      <Toast open onClose={onClose} duration={0}>
        Bye
      </Toast>,
    );
    fireEvent.click(screen.getByLabelText('Dismiss'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

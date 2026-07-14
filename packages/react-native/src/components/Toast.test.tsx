import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Toast, Toaster, toast } from './Toast.js';

describe('Toast (per-item visual)', () => {
  it('renders the title, description and variant icon', () => {
    renderWithTheme(
      <Toast
        variant="success"
        title="Saved"
        description="All changes stored"
        onDismiss={() => {}}
      />,
    );
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('All changes stored')).toBeInTheDocument();
  });

  it('fires onDismiss from the close button', () => {
    const onDismiss = vi.fn();
    renderWithTheme(<Toast title="Hi" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByLabelText('Dismiss'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('toast() system + Toaster', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    act(() => toast.dismissAll());
    vi.useRealTimers();
  });

  it('renders a toast fired imperatively', () => {
    renderWithTheme(<Toaster testID="toaster" />);
    expect(screen.queryByText('Hello')).toBeNull();
    act(() => {
      toast.success({ title: 'Hello', description: 'World', duration: 0 });
    });
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('World')).toBeInTheDocument();
  });

  it('auto-dismisses after the duration', () => {
    renderWithTheme(<Toaster testID="toaster" />);
    act(() => {
      toast({ title: 'Bye', duration: 4000 });
    });
    expect(screen.getByText('Bye')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.queryByText('Bye')).toBeNull();
  });

  it('dismisses by id', () => {
    renderWithTheme(<Toaster testID="toaster" />);
    let id = '';
    act(() => {
      id = toast({ title: 'Pinned', duration: 0 });
    });
    expect(screen.getByText('Pinned')).toBeInTheDocument();
    act(() => {
      toast.dismiss(id);
    });
    expect(screen.queryByText('Pinned')).toBeNull();
  });

  it('caps the visible stack at max but keeps newest', () => {
    renderWithTheme(<Toaster max={2} testID="toaster" />);
    act(() => {
      toast({ title: 'One', duration: 0 });
      toast({ title: 'Two', duration: 0 });
      toast({ title: 'Three', duration: 0 });
    });
    expect(screen.queryByText('One')).toBeNull();
    expect(screen.getByText('Two')).toBeInTheDocument();
    expect(screen.getByText('Three')).toBeInTheDocument();
  });
});

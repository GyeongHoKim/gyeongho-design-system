import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { darkTheme, renderWithTheme } from '../test-utils.js';
import { AlertDialog } from './AlertDialog.js';

describe('AlertDialog', () => {
  it('renders the title and description when open', () => {
    renderWithTheme(
      <AlertDialog
        open
        onCancel={() => {}}
        onConfirm={() => {}}
        title="Delete file?"
        description="This cannot be undone."
      />,
    );
    expect(screen.getByText('Delete file?')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
  });

  it('fires onConfirm and onCancel from the actions', () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    renderWithTheme(
      <AlertDialog
        open
        onCancel={onCancel}
        onConfirm={onConfirm}
        title="Delete file?"
        confirmLabel="Delete"
        destructive
        testID="ad"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders in dark theme', () => {
    renderWithTheme(
      <AlertDialog open onCancel={() => {}} onConfirm={() => {}} title="Are you sure?" />,
      darkTheme,
    );
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });
});

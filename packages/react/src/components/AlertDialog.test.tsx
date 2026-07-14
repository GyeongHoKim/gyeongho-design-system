import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AlertDialog } from './AlertDialog.js';

describe('AlertDialog', () => {
  it('renders nothing when closed', () => {
    render(
      <AlertDialog open={false} onCancel={() => {}} onConfirm={() => {}} title="Delete file?" />,
    );
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('renders a labelled/described alertdialog when open', () => {
    render(
      <AlertDialog
        open
        onCancel={() => {}}
        onConfirm={() => {}}
        title="Delete file?"
        description="This cannot be undone."
      />,
    );
    const dialog = screen.getByRole('alertdialog', { name: 'Delete file?' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('This cannot be undone.');
  });

  it('fires onConfirm and onCancel from the buttons', async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <AlertDialog
        open
        onCancel={onCancel}
        onConfirm={onConfirm}
        title="Delete file?"
        confirmLabel="Delete"
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('cancels on Escape', async () => {
    const onCancel = vi.fn();
    render(<AlertDialog open onCancel={onCancel} onConfirm={() => {}} title="Delete file?" />);
    await userEvent.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

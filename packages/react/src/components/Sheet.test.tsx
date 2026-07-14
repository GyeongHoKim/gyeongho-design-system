import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Sheet } from './Sheet.js';

describe('Sheet', () => {
  it('renders nothing when closed', () => {
    render(
      <Sheet open={false} onClose={() => {}} title="Filters">
        <p>Body</p>
      </Sheet>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders a labelled dialog anchored to the given side', () => {
    render(
      <Sheet open onClose={() => {}} side="left" title="Filters">
        <p>Body</p>
      </Sheet>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Filters' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('data-side', 'left');
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(
      <Sheet open onClose={onClose} title="Filters">
        <button type="button">Apply</button>
      </Sheet>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('moves focus into the sheet on open', () => {
    render(
      <Sheet open onClose={() => {}} title="Filters">
        <button type="button">Apply</button>
      </Sheet>,
    );
    expect(screen.getByRole('button', { name: 'Apply' })).toHaveFocus();
  });
});

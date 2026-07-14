import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Drawer } from './Drawer.js';

describe('Drawer', () => {
  it('renders nothing when closed', () => {
    render(
      <Drawer open={false} onClose={() => {}} title="Options">
        <p>Body</p>
      </Drawer>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders a labelled modal dialog when open', () => {
    render(
      <Drawer open onClose={() => {}} title="Options">
        <p>Body</p>
      </Drawer>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Options' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose} title="Options">
        <button type="button">Save</button>
      </Drawer>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('moves focus into the drawer on open', () => {
    render(
      <Drawer open onClose={() => {}} title="Options">
        <button type="button">Save</button>
      </Drawer>,
    );
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
  });
});

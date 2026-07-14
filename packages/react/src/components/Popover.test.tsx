import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Popover } from './Popover.js';

describe('Popover', () => {
  it('is closed initially', () => {
    render(
      <Popover trigger={<button type="button">Open</button>} aria-label="Details">
        <p>Panel content</p>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens on click and moves focus into the panel', async () => {
    render(
      <Popover trigger={<button type="button">Open</button>} aria-label="Details">
        <button type="button">Action</button>
      </Popover>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Action' })).toHaveFocus();
  });

  it('closes on Escape and restores focus to the trigger', async () => {
    render(
      <Popover trigger={<button type="button">Open</button>} aria-label="Details">
        <button type="button">Action</button>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });
});

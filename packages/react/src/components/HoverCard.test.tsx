import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { HoverCard } from './HoverCard.js';

describe('HoverCard', () => {
  it('opens on focus and links the trigger via aria-describedby', async () => {
    render(
      <HoverCard trigger={<button type="button">@ghds</button>}>
        <p>A design system.</p>
      </HoverCard>,
    );
    const trigger = screen.getByRole('button', { name: '@ghds' });
    trigger.focus();
    await waitFor(() => expect(trigger).toHaveAttribute('aria-describedby'));
    const id = trigger.getAttribute('aria-describedby');
    expect(document.getElementById(id ?? '')).toHaveTextContent('A design system.');
  });

  it('opens on hover after the delay', async () => {
    render(
      <HoverCard openDelay={0} trigger={<button type="button">@ghds</button>}>
        <p>A design system.</p>
      </HoverCard>,
    );
    const trigger = screen.getByRole('button', { name: '@ghds' });
    await userEvent.hover(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-describedby'));
  });
});

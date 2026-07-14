import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Collapsible } from './Collapsible.js';

describe('Collapsible', () => {
  it('is collapsed by default and hides its content', () => {
    render(
      <Collapsible label="Details">
        <p>Hidden body</p>
      </Collapsible>,
    );
    const trigger = screen.getByRole('button', { name: /Details/ });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Hidden body')).not.toBeVisible();
  });

  it('expands on click', async () => {
    const onOpenChange = vi.fn();
    render(
      <Collapsible label="Details" onOpenChange={onOpenChange}>
        <p>Body content</p>
      </Collapsible>,
    );
    const trigger = screen.getByRole('button', { name: /Details/ });
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Body content')).toBeVisible();
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('wires the trigger to the content via aria-controls', () => {
    render(
      <Collapsible label="Details" defaultOpen>
        <p>Body content</p>
      </Collapsible>,
    );
    const trigger = screen.getByRole('button', { name: /Details/ });
    const id = trigger.getAttribute('aria-controls');
    expect(document.getElementById(id ?? '')).toHaveTextContent('Body content');
  });
});

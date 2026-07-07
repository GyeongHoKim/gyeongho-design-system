import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tooltip } from './Tooltip.js';

describe('Tooltip', () => {
  it('renders its trigger', () => {
    render(
      <Tooltip content="More info">
        <button type="button">Help</button>
      </Tooltip>,
    );
    expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument();
  });

  it('shows on focus and links the trigger via aria-describedby', () => {
    render(
      <Tooltip content="More info">
        <button type="button">Help</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'Help' });
    fireEvent.focus(trigger);
    const tip = screen.getByRole('tooltip');
    expect(tip).toHaveTextContent('More info');
    expect(trigger).toHaveAttribute('aria-describedby', tip.id);
  });

  it('hides on blur', () => {
    render(
      <Tooltip content="More info">
        <button type="button">Help</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'Help' });
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toBeVisible();
    fireEvent.blur(trigger);
    // Bubble is always mounted but display:none when closed, so it drops out of
    // the accessibility tree (getByRole excludes hidden nodes).
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('hides on Escape', () => {
    render(
      <Tooltip content="More info">
        <button type="button">Help</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'Help' });
    fireEvent.focus(trigger);
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});

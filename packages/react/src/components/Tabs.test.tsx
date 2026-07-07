import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { type TabItem, Tabs } from './Tabs.js';

const ITEMS: TabItem[] = [
  { value: 'a', label: 'First', content: <p>First panel</p> },
  { value: 'b', label: 'Second', content: <p>Second panel</p> },
  { value: 'c', label: 'Third', content: <p>Third panel</p> },
];

describe('Tabs', () => {
  it('renders a tablist and selects the first tab by default', () => {
    render(<Tabs items={ITEMS} label="Sections" />);
    expect(screen.getByRole('tablist', { name: 'Sections' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'First' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('First panel')).toBeVisible();
  });

  it('shows only the active panel', () => {
    render(<Tabs items={ITEMS} defaultValue="b" />);
    expect(screen.getByRole('tab', { name: 'Second' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Second panel')).toBeInTheDocument();
    expect(screen.queryByText('First panel')).toBeNull();
  });

  it('uses roving tabindex — only the active tab is tabbable', () => {
    render(<Tabs items={ITEMS} defaultValue="a" />);
    expect(screen.getByRole('tab', { name: 'First' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Second' })).toHaveAttribute('tabindex', '-1');
  });

  it('moves and activates tabs with arrow keys', async () => {
    const onValueChange = vi.fn();
    render(<Tabs items={ITEMS} defaultValue="a" onValueChange={onValueChange} />);
    const first = screen.getByRole('tab', { name: 'First' });
    first.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onValueChange).toHaveBeenCalledWith('b');
    expect(screen.getByRole('tab', { name: 'Second' })).toHaveAttribute('aria-selected', 'true');
  });

  it('wraps to the last tab with ArrowLeft from the first', async () => {
    render(<Tabs items={ITEMS} defaultValue="a" />);
    screen.getByRole('tab', { name: 'First' }).focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Third' })).toHaveAttribute('aria-selected', 'true');
  });

  it('selects the first enabled tab when the first is disabled', () => {
    const items = [
      { value: 'a', label: 'First', content: <p>A</p>, disabled: true },
      { value: 'b', label: 'Second', content: <p>B</p> },
      { value: 'c', label: 'Third', content: <p>C</p> },
    ];
    render(<Tabs items={items} />);
    // The disabled first tab must not become the (keyboard-unreachable) active tab.
    expect(screen.getByRole('tab', { name: 'First' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: 'Second' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Second' })).toHaveAttribute('tabindex', '0');
  });

  it('recovers selection when items change out from under a stale value', () => {
    const { rerender } = render(<Tabs items={ITEMS} defaultValue="b" />);
    expect(screen.getByText('Second panel')).toBeInTheDocument();
    // Swap to a list without "b"; a fresh enabled tab should become active.
    rerender(
      <Tabs
        items={[
          { value: 'x', label: 'X', content: <p>X panel</p> },
          { value: 'y', label: 'Y', content: <p>Y panel</p> },
        ]}
        defaultValue="b"
      />,
    );
    expect(screen.getByText('X panel')).toBeInTheDocument();
  });

  it('activates a tab on click', async () => {
    render(<Tabs items={ITEMS} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Third' }));
    expect(screen.getByText('Third panel')).toBeInTheDocument();
  });
});

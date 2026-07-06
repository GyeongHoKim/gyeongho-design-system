import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Text } from '../theme/primitives.js';
import { type TabItem, Tabs } from './Tabs.js';

const ITEMS: TabItem[] = [
  { value: 'a', label: 'First', content: <Text>First panel</Text> },
  { value: 'b', label: 'Second', content: <Text>Second panel</Text> },
];

describe('Tabs', () => {
  it('selects the first tab by default and shows its panel', () => {
    renderWithTheme(<Tabs items={ITEMS} label="Sections" testID="tabs" />);
    expect(screen.getByText('First panel')).toBeInTheDocument();
    expect(screen.queryByText('Second panel')).toBeNull();
  });

  it('switches panels when a tab is pressed', () => {
    const onValueChange = vi.fn();
    renderWithTheme(<Tabs items={ITEMS} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByText('Second'));
    expect(onValueChange).toHaveBeenCalledWith('b');
    expect(screen.getByText('Second panel')).toBeInTheDocument();
  });

  it('honours a controlled value', () => {
    renderWithTheme(<Tabs items={ITEMS} value="b" />);
    expect(screen.getByText('Second panel')).toBeInTheDocument();
    expect(screen.queryByText('First panel')).toBeNull();
  });
});

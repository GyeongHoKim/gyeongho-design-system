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

  it('shows the selected tab in the label face and the others in the body face', () => {
    // react-native-web emits atomic classes, so compare the font-family class
    // against a Text rendered in each variant.
    const fontClass = (el: HTMLElement) =>
      [...el.classList].find((name) => name.startsWith('r-fontFamily-'));
    renderWithTheme(
      <>
        <Tabs items={ITEMS} />
        <Text variant="label">label face</Text>
        <Text variant="body">body face</Text>
      </>,
    );
    expect(fontClass(screen.getByText('First'))).toBe(fontClass(screen.getByText('label face')));
    expect(fontClass(screen.getByText('Second'))).toBe(fontClass(screen.getByText('body face')));
  });
});

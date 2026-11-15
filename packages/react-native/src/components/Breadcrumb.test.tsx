import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Text } from '../theme/primitives.js';
import { Breadcrumb, type BreadcrumbItem } from './Breadcrumb.js';

const ITEMS: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Library', href: '/library' },
  { label: 'Data' },
];

describe('Breadcrumb', () => {
  it('renders every item label', () => {
    renderWithTheme(<Breadcrumb items={ITEMS} testID="bc" />);
    for (const item of ITEMS) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });

  it('exposes a navigation role with a label', () => {
    renderWithTheme(<Breadcrumb items={ITEMS} testID="bc" />);
    expect(screen.getByTestId('bc')).toHaveAttribute('aria-label', 'Breadcrumb');
  });

  it('fires onSelect when a non-current item is pressed', () => {
    const onSelect = vi.fn();
    renderWithTheme(<Breadcrumb items={ITEMS} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Library'));
    expect(onSelect).toHaveBeenCalledWith(ITEMS[1], 1);
  });

  it('emphasises the current page with the label face, not a weight override', () => {
    // react-native-web emits atomic classes, so compare the font-family class
    // against a Text rendered in each variant.
    const fontClass = (el: HTMLElement) =>
      [...el.classList].find((name) => name.startsWith('r-fontFamily-'));
    renderWithTheme(
      <>
        <Breadcrumb items={ITEMS} />
        <Text variant="label">label face</Text>
        <Text variant="body">body face</Text>
      </>,
    );
    const label = fontClass(screen.getByText('label face'));
    const body = fontClass(screen.getByText('body face'));
    expect(label).not.toBe(body);
    expect(fontClass(screen.getByText('Data'))).toBe(label);
    expect(fontClass(screen.getByText('Library'))).toBe(body);
  });
});

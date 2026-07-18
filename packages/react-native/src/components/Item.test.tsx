import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from './Item.js';

describe('Item', () => {
  it('renders composed sub-components', () => {
    renderWithTheme(
      <Item testID="row">
        <ItemMedia>
          <span>icon</span>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Title text</ItemTitle>
          <ItemDescription>Description text</ItemDescription>
        </ItemContent>
        <ItemActions>
          <span>action</span>
        </ItemActions>
      </Item>,
    );
    expect(screen.getByTestId('row')).toBeInTheDocument();
    expect(screen.getByText('Title text')).toBeInTheDocument();
    expect(screen.getByText('Description text')).toBeInTheDocument();
    expect(screen.getByText('action')).toBeInTheDocument();
  });

  it('renders the outline variant without error', () => {
    renderWithTheme(
      <Item variant="outline" testID="outlined">
        <ItemContent>
          <ItemTitle>Outlined</ItemTitle>
        </ItemContent>
      </Item>,
    );
    expect(screen.getByTestId('outlined')).toBeInTheDocument();
    expect(screen.getByText('Outlined')).toBeInTheDocument();
  });

  it('renders the muted and selected states without error', () => {
    renderWithTheme(
      <Item variant="muted" selected testID="active">
        <ItemContent>
          <ItemTitle>Selected</ItemTitle>
        </ItemContent>
      </Item>,
    );
    expect(screen.getByTestId('active')).toBeInTheDocument();
  });

  it('is exposed as a button and fires onPress when pressable', () => {
    const onPress = vi.fn();
    renderWithTheme(
      <Item onPress={onPress} testID="pressable" accessibilityLabel="Open row">
        <ItemContent>
          <ItemTitle>Press me</ItemTitle>
        </ItemContent>
      </Item>,
    );
    const row = screen.getByTestId('pressable');
    expect(row).toHaveAttribute('aria-label', 'Open row');
    fireEvent.click(row);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

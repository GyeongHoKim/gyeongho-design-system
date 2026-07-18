import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { InputGroup, InputGroupAddon, InputGroupInput } from './InputGroup.js';

describe('InputGroup', () => {
  it('renders an input with leading and trailing addons', () => {
    renderWithTheme(
      <InputGroup testID="group">
        <InputGroupAddon>@</InputGroupAddon>
        <InputGroupInput placeholder="username" testID="field" />
        <InputGroupAddon>.dev</InputGroupAddon>
      </InputGroup>,
    );
    expect(screen.getByTestId('group')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('username')).toBeInTheDocument();
    expect(screen.getByText('@')).toBeInTheDocument();
    expect(screen.getByText('.dev')).toBeInTheDocument();
  });

  it('calls onChangeText as the user types', () => {
    const onChangeText = vi.fn();
    renderWithTheme(
      <InputGroup>
        <InputGroupInput placeholder="name" testID="field" onChangeText={onChangeText} />
      </InputGroup>,
    );
    fireEvent.change(screen.getByTestId('field'), { target: { value: 'ada' } });
    expect(onChangeText).toHaveBeenCalledWith('ada');
  });

  it('disables the inner input when the group is disabled', () => {
    renderWithTheme(
      <InputGroup disabled>
        <InputGroupInput placeholder="name" testID="field" />
      </InputGroup>,
    );
    expect(screen.getByTestId('field')).toHaveAttribute('readonly');
  });

  it('renders the invalid state without error', () => {
    renderWithTheme(
      <InputGroup invalid testID="invalid-group">
        <InputGroupInput placeholder="name" testID="field" />
      </InputGroup>,
    );
    expect(screen.getByTestId('invalid-group')).toBeInTheDocument();
  });
});

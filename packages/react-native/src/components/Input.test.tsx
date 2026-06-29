import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Input } from './Input.js';

describe('Input', () => {
  it('renders an accessible field from its placeholder', () => {
    renderWithTheme(<Input placeholder="Email" testID="email" />);
    expect(screen.getByTestId('email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
  });

  it('calls onChangeText as the user types', () => {
    const onChangeText = vi.fn();
    renderWithTheme(<Input placeholder="Email" testID="email" onChangeText={onChangeText} />);
    fireEvent.change(screen.getByTestId('email'), { target: { value: 'hi@ghds.dev' } });
    expect(onChangeText).toHaveBeenCalledWith('hi@ghds.dev');
  });

  it('prefers an explicit accessibility label over the placeholder', () => {
    renderWithTheme(
      <Input placeholder="you@example.com" accessibilityLabel="Email address" testID="email" />,
    );
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
  });

  it('is read-only when disabled', () => {
    renderWithTheme(<Input placeholder="Email" testID="email" disabled />);
    const field = screen.getByTestId('email');
    expect(field).toHaveAttribute('readonly');
    expect(field).not.toHaveAttribute('readonly', 'false');
  });
});

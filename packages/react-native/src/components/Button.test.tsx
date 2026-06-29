import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Button } from './Button.js';

describe('Button', () => {
  it('renders its label with the button role', () => {
    renderWithTheme(<Button label="Save" />);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeInTheDocument();
  });

  it('calls onPress when pressed', () => {
    const onPress = vi.fn();
    renderWithTheme(<Button label="Save" onPress={onPress} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = vi.fn();
    renderWithTheme(<Button label="Save" onPress={onPress} disabled />);
    const button = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('exposes the disabled accessibility state', () => {
    renderWithTheme(<Button label="Save" disabled />);
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders the danger variant', () => {
    renderWithTheme(<Button label="Delete" variant="danger" testID="danger-btn" />);
    expect(screen.getByTestId('danger-btn')).toBeInTheDocument();
  });
});

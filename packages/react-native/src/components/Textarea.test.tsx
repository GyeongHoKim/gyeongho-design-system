import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Textarea } from './Textarea.js';

function mockScrollHeight(el: HTMLElement, value: number): void {
  Object.defineProperty(el, 'scrollHeight', { configurable: true, value });
}

describe('Textarea', () => {
  it('renders its label as an accessible field', () => {
    renderWithTheme(<Textarea label="Bio" testID="bio" />);
    expect(screen.getByTestId('bio')).toBeInTheDocument();
    expect(screen.getByLabelText('Bio')).toBeInTheDocument();
  });

  it('calls onChangeText as the user types', () => {
    const onChangeText = vi.fn();
    renderWithTheme(<Textarea label="Bio" testID="bio" onChangeText={onChangeText} />);
    fireEvent.change(screen.getByTestId('bio'), { target: { value: 'hello world' } });
    expect(onChangeText).toHaveBeenCalledWith('hello world');
  });

  it('is read-only when disabled', () => {
    renderWithTheme(<Textarea label="Bio" testID="bio" disabled />);
    const field = screen.getByTestId('bio');
    expect(field).toHaveAttribute('readonly');
    expect(field).not.toHaveAttribute('readonly', 'false');
  });

  it('sets a minimum height derived from `rows` by default', () => {
    renderWithTheme(<Textarea label="Bio" testID="bio" rows={4} />);
    const field = screen.getByTestId('bio') as HTMLTextAreaElement;
    expect(field.style.height).not.toBe('');
    expect(Number.parseFloat(field.style.height)).toBeGreaterThan(0);
  });

  it('grows to fit its content when autoResize is set', () => {
    renderWithTheme(<Textarea label="Bio" testID="bio" autoResize />);
    const field = screen.getByTestId('bio') as HTMLTextAreaElement;
    mockScrollHeight(field, 200);
    fireEvent.change(field, { target: { value: 'line1\nline2\nline3' } });
    expect(Number.parseFloat(field.style.height)).toBe(200);
  });

  it('does not grow past the minimum height when autoResize is unset', () => {
    renderWithTheme(<Textarea label="Bio" testID="bio" rows={2} />);
    const field = screen.getByTestId('bio') as HTMLTextAreaElement;
    const initialHeight = field.style.height;
    mockScrollHeight(field, 200);
    fireEvent.change(field, { target: { value: 'line1\nline2\nline3' } });
    expect(field.style.height).toBe(initialHeight);
  });

  it('grows the measured height when rows increases without new content', () => {
    const { rerender } = renderWithTheme(<Textarea label="Bio" testID="bio" autoResize rows={2} />);
    const field = screen.getByTestId('bio') as HTMLTextAreaElement;
    const smallHeight = Number.parseFloat(field.style.height);

    rerender(<Textarea label="Bio" testID="bio" autoResize rows={8} />);
    expect(Number.parseFloat(field.style.height)).toBeGreaterThan(smallHeight);
  });
});

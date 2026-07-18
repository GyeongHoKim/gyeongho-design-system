import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { InputOTP } from './InputOTP.js';

describe('InputOTP', () => {
  it('renders one cell per length', () => {
    renderWithTheme(<InputOTP length={4} testID="otp" />);
    expect(screen.getByLabelText('Digit 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Digit 4')).toBeInTheDocument();
    expect(screen.queryByLabelText('Digit 5')).not.toBeInTheDocument();
  });

  it('renders a visible label above the cells', () => {
    renderWithTheme(<InputOTP length={4} label="Verification code" />);
    expect(screen.getByText('Verification code')).toBeInTheDocument();
  });

  it('fills a cell and reports the value on input', () => {
    const onChange = vi.fn();
    renderWithTheme(<InputOTP length={4} testID="otp" onChange={onChange} />);
    fireEvent.change(screen.getByTestId('otp-0'), { target: { value: '1' } });
    expect(onChange).toHaveBeenCalledWith('1');
    expect(screen.getByTestId('otp-0')).toHaveValue('1');
  });

  it('rejects non-numeric input in numeric mode', () => {
    const onChange = vi.fn();
    renderWithTheme(<InputOTP length={4} testID="otp" onChange={onChange} />);
    fireEvent.change(screen.getByTestId('otp-0'), { target: { value: 'a' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('accepts letters in text mode', () => {
    const onChange = vi.fn();
    renderWithTheme(<InputOTP length={4} mode="text" testID="otp" onChange={onChange} />);
    fireEvent.change(screen.getByTestId('otp-0'), { target: { value: 'a' } });
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('distributes a multi-character paste across cells and completes', () => {
    const onComplete = vi.fn();
    renderWithTheme(<InputOTP length={4} testID="otp" onComplete={onComplete} />);
    fireEvent.change(screen.getByTestId('otp-0'), { target: { value: '1234' } });
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('deletes the last character when Backspace is pressed on an empty cell', () => {
    const onChange = vi.fn();
    renderWithTheme(<InputOTP length={4} defaultValue="12" testID="otp" onChange={onChange} />);
    fireEvent.keyDown(screen.getByTestId('otp-2'), { key: 'Backspace' });
    expect(onChange).toHaveBeenCalledWith('1');
  });

  it('is read-only when disabled', () => {
    renderWithTheme(<InputOTP length={4} disabled testID="otp" />);
    expect(screen.getByTestId('otp-0')).toHaveAttribute('readonly');
  });

  it('renders the invalid state without error', () => {
    renderWithTheme(<InputOTP length={4} invalid testID="otp" />);
    expect(screen.getByTestId('otp-0')).toBeInTheDocument();
  });

  it('masks characters when mask is set', () => {
    renderWithTheme(<InputOTP length={4} mask defaultValue="1" testID="otp" />);
    expect(screen.getByTestId('otp-0')).toHaveAttribute('type', 'password');
  });
});

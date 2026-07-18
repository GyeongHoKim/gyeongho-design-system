import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InputOTP } from './InputOTP.js';

describe('InputOTP', () => {
  it('renders one cell per length', () => {
    render(<InputOTP length={4} aria-label="code" />);
    expect(screen.getByLabelText('Digit 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Digit 4')).toBeInTheDocument();
    expect(screen.queryByLabelText('Digit 5')).not.toBeInTheDocument();
  });

  it('renders decorative sketch surfaces for the cells', () => {
    const { container } = render(<InputOTP length={4} aria-label="code" />);
    expect(container.querySelectorAll('svg[aria-hidden="true"]').length).toBe(4);
  });

  it('fills sequentially and fires onComplete on the last digit', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onComplete = vi.fn();
    render(<InputOTP length={4} aria-label="code" onChange={onChange} onComplete={onComplete} />);
    await user.click(screen.getByLabelText('Digit 1'));
    await user.keyboard('1234');
    expect(onChange).toHaveBeenLastCalledWith('1234');
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('rejects non-numeric input in numeric mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputOTP length={4} aria-label="code" onChange={onChange} />);
    await user.click(screen.getByLabelText('Digit 1'));
    await user.keyboard('a1');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith('1');
  });

  it('deletes the last character on Backspace', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputOTP length={4} aria-label="code" onChange={onChange} />);
    await user.click(screen.getByLabelText('Digit 1'));
    await user.keyboard('12');
    await user.keyboard('{Backspace}');
    expect(onChange).toHaveBeenLastCalledWith('1');
  });

  it('distributes a pasted code across cells', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<InputOTP length={4} aria-label="code" onComplete={onComplete} />);
    const first = screen.getByLabelText('Digit 1');
    first.focus();
    await user.paste('9876');
    expect(onComplete).toHaveBeenCalledWith('9876');
  });

  it('disables every cell', () => {
    render(<InputOTP length={4} aria-label="code" disabled />);
    expect(screen.getByLabelText('Digit 1')).toBeDisabled();
    expect(screen.getByLabelText('Digit 4')).toBeDisabled();
  });
});

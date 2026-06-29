import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Input } from './Input.js';

describe('Input', () => {
  it('associates the label with the input', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('accepts typed text', async () => {
    const user = userEvent.setup();
    render(<Input label="Name" />);
    const field = screen.getByLabelText('Name');
    await user.type(field, 'Ada');
    expect(field).toHaveValue('Ada');
  });

  it('renders a decorative sketch box', () => {
    const { container } = render(<Input label="City" />);
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });

  it('marks the field invalid and announces the error', () => {
    render(<Input label="Email" error="Required" />);
    const field = screen.getByLabelText('Email');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Required');
    expect(field).toHaveAttribute('aria-describedby', alert.id);
  });

  it('disables the field', async () => {
    const user = userEvent.setup();
    render(<Input label="Locked" disabled />);
    const field = screen.getByLabelText('Locked');
    expect(field).toBeDisabled();
    await user.type(field, 'x');
    expect(field).toHaveValue('');
  });
});

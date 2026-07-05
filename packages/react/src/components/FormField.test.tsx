import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormField } from './FormField.js';
import { Input } from './Input.js';

describe('FormField', () => {
  it('associates the label with the wrapped input', () => {
    render(
      <FormField label="Email">
        <Input />
      </FormField>,
    );
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders helper text', () => {
    render(
      <FormField label="Email" helperText="We will never share it">
        <Input />
      </FormField>,
    );
    expect(screen.getByText('We will never share it')).toBeInTheDocument();
  });

  it('renders an announced error', () => {
    render(
      <FormField label="Email" error="Required">
        <Input />
      </FormField>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Required');
  });

  it('renders helper text and an error simultaneously', () => {
    render(
      <FormField label="Email" helperText="We will never share it" error="Required">
        <Input />
      </FormField>,
    );
    expect(screen.getByText('We will never share it')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  it('wires aria-invalid/aria-describedby onto the wrapped Input from context', () => {
    render(
      <FormField label="Email" helperText="We will never share it" error="Required">
        <Input />
      </FormField>,
    );
    const field = screen.getByLabelText('Email');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    const describedBy = field.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const helper = screen.getByText('We will never share it');
    const alert = screen.getByRole('alert');
    expect(describedBy).toContain(helper.id);
    expect(describedBy).toContain(alert.id);
  });

  it('suppresses the wrapped Input own label/error rendering to avoid doubling', () => {
    render(
      <FormField label="Email" error="Required">
        <Input label="Email address" error="Something else" />
      </FormField>,
    );
    // Only FormField's own label/error text should render, not Input's.
    expect(screen.queryByText('Email address')).not.toBeInTheDocument();
    expect(screen.queryByText('Something else')).not.toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  it('is a no-op decoration when no label/helperText/error is set', () => {
    render(
      <FormField>
        <Input aria-label="Email" />
      </FormField>,
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it("uses FormField's id even when the wrapped Input has its own explicit id", () => {
    // Regression: FormField's <label for> already targets FormField's own
    // id — the wrapped control must render with that same id regardless of
    // its own `id` prop, or the label/control association breaks.
    render(
      <FormField label="Email" id="email-field">
        <Input id="custom-input" />
      </FormField>,
    );
    const field = screen.getByLabelText('Email');
    expect(field.id).toBe('email-field');
    const label = document.querySelector('label');
    expect(label?.getAttribute('for')).toBe('email-field');
  });

  it("falls back to the wrapped Input's own error when FormField has none", () => {
    // Regression: FormField wrapping shouldn't silently drop a control's own
    // error just because FormField itself wasn't given one.
    render(
      <FormField label="Email">
        <Input error="Required" />
      </FormField>,
    );
    const field = screen.getByLabelText('Email');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Required');
    expect(field).toHaveAttribute('aria-describedby', alert.id);
  });

  it("falls back to the wrapped Input's own label when FormField has none", () => {
    // Regression: FormField wrapping shouldn't silently drop a control's own
    // label just because FormField itself wasn't given one.
    render(
      <FormField error="Required">
        <Input label="Email" />
      </FormField>,
    );
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });
});

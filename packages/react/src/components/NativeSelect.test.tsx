import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { NativeSelect } from './NativeSelect.js';

function Options() {
  return (
    <>
      <option value="">Pick one</option>
      <option value="a">Apple</option>
      <option value="b">Banana</option>
    </>
  );
}

describe('NativeSelect', () => {
  it('renders a native select with its options', () => {
    render(
      <NativeSelect label="Fruit">
        <Options />
      </NativeSelect>,
    );
    const select = screen.getByRole('combobox', { name: 'Fruit' });
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument();
  });

  it('renders a decorative sketch surface', () => {
    const { container } = render(
      <NativeSelect aria-label="fruit">
        <Options />
      </NativeSelect>,
    );
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });

  it('lets the user choose an option', async () => {
    const user = userEvent.setup();
    render(
      <NativeSelect label="Fruit">
        <Options />
      </NativeSelect>,
    );
    const select = screen.getByRole('combobox', { name: 'Fruit' }) as HTMLSelectElement;
    await user.selectOptions(select, 'b');
    expect(select.value).toBe('b');
  });

  it('marks the field invalid and announces the error', () => {
    render(
      <NativeSelect label="Fruit" error="Required">
        <Options />
      </NativeSelect>,
    );
    const select = screen.getByRole('combobox', { name: 'Fruit' });
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  it('disables the native select', () => {
    render(
      <NativeSelect label="Fruit" disabled>
        <Options />
      </NativeSelect>,
    );
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toBeDisabled();
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { InputGroup, InputGroupAddon, InputGroupInput } from './InputGroup.js';

describe('InputGroup', () => {
  it('renders addons alongside the bare input', () => {
    render(
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupInput aria-label="site" placeholder="example.com" />
        <InputGroupAddon>.com</InputGroupAddon>
      </InputGroup>,
    );
    expect(screen.getByText('https://')).toBeInTheDocument();
    expect(screen.getByText('.com')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'site' })).toBeInTheDocument();
  });

  it('renders a decorative sketch surface', () => {
    const { container } = render(
      <InputGroup>
        <InputGroupInput aria-label="q" />
      </InputGroup>,
    );
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });

  it('lets the user type into the input', async () => {
    const user = userEvent.setup();
    render(
      <InputGroup>
        <InputGroupInput aria-label="q" />
      </InputGroup>,
    );
    const input = screen.getByRole('textbox', { name: 'q' });
    await user.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });

  it('disables the inner input when the group is disabled', () => {
    render(
      <InputGroup disabled>
        <InputGroupInput aria-label="q" />
      </InputGroup>,
    );
    expect(screen.getByRole('textbox', { name: 'q' })).toBeDisabled();
  });
});

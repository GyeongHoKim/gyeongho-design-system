import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { Radio } from './Radio.js';
import { RadioGroup } from './RadioGroup.js';

function ControlledGroup() {
  const [value, setValue] = useState('sm');
  return (
    <RadioGroup value={value} onValueChange={setValue} label="Size">
      <Radio label="Small" value="sm" />
      <Radio label="Medium" value="md" />
      <Radio label="Large" value="lg" />
    </RadioGroup>
  );
}

describe('RadioGroup', () => {
  it('exposes an accessible group name', () => {
    render(<ControlledGroup />);
    expect(screen.getByRole('group', { name: 'Size' })).toBeInTheDocument();
  });

  it('shares one `name` across every radio so only one can be checked', () => {
    render(<ControlledGroup />);
    const small = screen.getByLabelText('Small') as HTMLInputElement;
    const medium = screen.getByLabelText('Medium') as HTMLInputElement;
    const large = screen.getByLabelText('Large') as HTMLInputElement;
    expect(small.name).toBe(medium.name);
    expect(medium.name).toBe(large.name);
  });

  it('derives checked state from the shared value and enforces mutual exclusivity', async () => {
    const user = userEvent.setup();
    render(<ControlledGroup />);
    expect((screen.getByLabelText('Small') as HTMLInputElement).checked).toBe(true);

    await user.click(screen.getByLabelText('Medium'));
    expect((screen.getByLabelText('Small') as HTMLInputElement).checked).toBe(false);
    expect((screen.getByLabelText('Medium') as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText('Large') as HTMLInputElement).checked).toBe(false);
  });

  it('disables every radio when the group is disabled', () => {
    render(
      <RadioGroup value="sm" onValueChange={() => {}} disabled>
        <Radio label="Small" value="sm" />
        <Radio label="Medium" value="md" />
      </RadioGroup>,
    );
    expect(screen.getByLabelText('Small')).toBeDisabled();
    expect(screen.getByLabelText('Medium')).toBeDisabled();
  });
});

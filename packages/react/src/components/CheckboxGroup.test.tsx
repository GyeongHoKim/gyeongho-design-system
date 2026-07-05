import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { Checkbox } from './Checkbox.js';
import { CheckboxGroup } from './CheckboxGroup.js';

function ControlledGroup() {
  const [value, setValue] = useState<string[]>(['red']);
  return (
    <CheckboxGroup value={value} onValueChange={setValue} label="Colors">
      <Checkbox label="Red" value="red" />
      <Checkbox label="Green" value="green" />
      <Checkbox label="Blue" value="blue" />
    </CheckboxGroup>
  );
}

describe('CheckboxGroup', () => {
  it('exposes an accessible group name via a fieldset legend', () => {
    render(<ControlledGroup />);
    expect(screen.getByRole('group', { name: 'Colors' })).toBeInTheDocument();
  });

  it("derives each checkbox's checked state from the shared value array", () => {
    render(<ControlledGroup />);
    expect((screen.getByLabelText('Red') as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText('Green') as HTMLInputElement).checked).toBe(false);
  });

  it('adds and removes values independently on toggle', async () => {
    const user = userEvent.setup();
    render(<ControlledGroup />);
    await user.click(screen.getByLabelText('Green'));
    expect((screen.getByLabelText('Red') as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText('Green') as HTMLInputElement).checked).toBe(true);

    await user.click(screen.getByLabelText('Red'));
    expect((screen.getByLabelText('Red') as HTMLInputElement).checked).toBe(false);
    expect((screen.getByLabelText('Green') as HTMLInputElement).checked).toBe(true);
  });

  it('disables every checkbox when the group is disabled', () => {
    render(
      <CheckboxGroup value={[]} onValueChange={() => {}} disabled>
        <Checkbox label="Red" value="red" />
        <Checkbox label="Green" value="green" />
      </CheckboxGroup>,
    );
    expect(screen.getByLabelText('Red')).toBeDisabled();
    expect(screen.getByLabelText('Green')).toBeDisabled();
  });
});

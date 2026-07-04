import { fireEvent, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Checkbox } from './Checkbox.js';
import { CheckboxGroup } from './CheckboxGroup.js';

function ControlledGroup() {
  const [value, setValue] = useState<string[]>(['red']);
  return (
    <CheckboxGroup value={value} onValueChange={setValue} label="Colors">
      <Checkbox label="Red" value="red" />
      <Checkbox label="Green" value="green" />
    </CheckboxGroup>
  );
}

describe('CheckboxGroup', () => {
  it("derives each checkbox's checked state from the shared value array", () => {
    renderWithTheme(<ControlledGroup />);
    expect(screen.getByRole('checkbox', { name: 'Red' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('checkbox', { name: 'Green' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('adds and removes values independently on toggle', () => {
    renderWithTheme(<ControlledGroup />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Green' }));
    expect(screen.getByRole('checkbox', { name: 'Red' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('checkbox', { name: 'Green' })).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(screen.getByRole('checkbox', { name: 'Red' }));
    expect(screen.getByRole('checkbox', { name: 'Red' })).toHaveAttribute('aria-checked', 'false');
  });

  it('disables every checkbox when the group is disabled', () => {
    renderWithTheme(
      <CheckboxGroup value={[]} onValueChange={() => {}} disabled>
        <Checkbox label="Red" value="red" />
      </CheckboxGroup>,
    );
    expect(screen.getByRole('checkbox', { name: 'Red' })).toHaveAttribute('aria-disabled', 'true');
  });
});

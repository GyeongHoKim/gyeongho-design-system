import { fireEvent, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Radio } from './Radio.js';
import { RadioGroup } from './RadioGroup.js';

function ControlledGroup() {
  const [value, setValue] = useState('sm');
  return (
    <RadioGroup value={value} onValueChange={setValue} label="Size">
      <Radio label="Small" value="sm" />
      <Radio label="Medium" value="md" />
    </RadioGroup>
  );
}

describe('RadioGroup', () => {
  it('derives checked state from the shared value and enforces mutual exclusivity', () => {
    renderWithTheme(<ControlledGroup />);
    expect(screen.getByRole('radio', { name: 'Small' })).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(screen.getByRole('radio', { name: 'Medium' }));
    expect(screen.getByRole('radio', { name: 'Small' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('radio', { name: 'Medium' })).toHaveAttribute('aria-checked', 'true');
  });

  it('disables every radio when the group is disabled', () => {
    renderWithTheme(
      <RadioGroup value="sm" onValueChange={() => {}} disabled>
        <Radio label="Small" value="sm" />
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'Small' })).toHaveAttribute('aria-disabled', 'true');
  });
});

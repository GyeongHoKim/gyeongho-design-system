import { Radio } from '@ghds/react/radio';
import { RadioGroup } from '@ghds/react/radio-group';
import { useState } from 'react';

/** Live demo of Radio inside a RadioGroup, showing mutual exclusivity. */
export default function RadioDemo(): React.JSX.Element {
  const [size, setSize] = useState('sm');

  return (
    <RadioGroup label="Size" value={size} onValueChange={setSize}>
      <Radio label="Small" value="sm" />
      <Radio label="Medium" value="md" />
      <Radio label="Large" value="lg" disabled />
    </RadioGroup>
  );
}

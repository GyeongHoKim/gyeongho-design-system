import { Select, SelectOption } from '@ghds/react/select';
import { useState } from 'react';

/** Live demo of Select's React variant, using children composition for options. */
export default function SelectDemo(): React.JSX.Element {
  const [fruit, setFruit] = useState<string | undefined>(undefined);

  return (
    <div className="demo-stack">
      <Select label="Fruit" placeholder="Choose a fruit" value={fruit} onValueChange={setFruit}>
        <SelectOption value="apple">Apple</SelectOption>
        <SelectOption value="banana">Banana</SelectOption>
        <SelectOption value="cherry" disabled>
          Cherry (out of stock)
        </SelectOption>
        <SelectOption value="date">Date</SelectOption>
      </Select>
      <Select label="Disabled" placeholder="Choose a fruit" disabled>
        <SelectOption value="apple">Apple</SelectOption>
      </Select>
    </div>
  );
}

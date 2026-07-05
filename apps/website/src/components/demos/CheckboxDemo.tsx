import { Checkbox } from '@ghds/react';
import { useState } from 'react';

/** Live demo of Checkbox's real state matrix: default, indeterminate, disabled. */
export default function CheckboxDemo(): React.JSX.Element {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className="demo-stack">
      <Checkbox
        label="Subscribe to updates"
        checked={subscribed}
        onChange={(event) => setSubscribed(event.target.checked)}
      />
      <Checkbox label="Select all" indeterminate />
      <Checkbox label="Disabled" disabled />
    </div>
  );
}

import { Switch } from '@ghds/react/switch';
import { useState } from 'react';

/** Live demo of Switch's real state matrix: default, on, disabled. */
export default function SwitchDemo(): React.JSX.Element {
  const [notifications, setNotifications] = useState(false);

  return (
    <div className="demo-stack">
      <Switch
        label="Enable notifications"
        checked={notifications}
        onChange={(event) => setNotifications(event.target.checked)}
      />
      <Switch label="Always on" defaultChecked />
      <Switch label="Disabled" disabled />
    </div>
  );
}

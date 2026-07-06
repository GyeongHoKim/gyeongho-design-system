import { Button, Tooltip } from '@ghds/react';

/** Live Tooltip demo (React) — hover or focus the button. */
export default function TooltipDemo(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <Tooltip content="Saves your changes">
        <Button>Save</Button>
      </Tooltip>
    </div>
  );
}

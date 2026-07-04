import { Button } from '@ghds/react';

/** Live demo of Button's real variant/state matrix, rendered as an Astro island. */
export default function ButtonDemo(): React.JSX.Element {
  return (
    <div className="demo-row">
      <Button variant="primary">Primary</Button>
      <Button variant="danger">Delete</Button>
      <Button variant="neutral">Cancel</Button>
      <Button variant="primary" disabled>
        Disabled
      </Button>
    </div>
  );
}

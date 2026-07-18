import { InputGroup, InputGroupAddon, InputGroupInput } from '@ghds/react/input-group';

/** Live demo of InputGroup with leading/trailing addons and its states (React). */
export default function InputGroupDemo(): React.JSX.Element {
  return (
    <div className="demo-stack" style={{ maxWidth: 360 }}>
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupInput placeholder="example.com" aria-label="Website" />
      </InputGroup>

      <InputGroup>
        <InputGroupInput placeholder="0.00" aria-label="Amount" />
        <InputGroupAddon>USD</InputGroupAddon>
      </InputGroup>

      <InputGroup invalid>
        <InputGroupAddon>@</InputGroupAddon>
        <InputGroupInput defaultValue="not-an-email" aria-label="Email" />
      </InputGroup>

      <InputGroup disabled>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupInput defaultValue="ghds.dev" aria-label="Disabled website" />
      </InputGroup>
    </div>
  );
}

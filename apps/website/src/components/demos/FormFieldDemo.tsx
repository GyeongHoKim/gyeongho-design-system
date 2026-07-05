import { FormField, Input } from '@ghds/react';

/** Live demo of FormField's real state matrix: default, helper text, error, both together. */
export default function FormFieldDemo(): React.JSX.Element {
  return (
    <div className="demo-stack">
      <FormField label="Email">
        <Input placeholder="you@example.com" />
      </FormField>
      <FormField label="Username" helperText="Letters, numbers, and underscores only">
        <Input />
      </FormField>
      <FormField label="Password" error="Must be at least 8 characters">
        <Input type="password" />
      </FormField>
      <FormField label="Email" helperText="We'll never share it" error="Please enter a valid email">
        <Input />
      </FormField>
    </div>
  );
}

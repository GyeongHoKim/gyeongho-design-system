import { Button } from '@ghds/react/button';
import { FormField } from '@ghds/react/form-field';
import { Input } from '@ghds/react/input';
import { Select, SelectOption } from '@ghds/react/select';
import { useState } from 'react';

/** Live demo of form patterns — login form with validation. */
export default function PatternFormDemo(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const emailError = submitted && !email ? 'Email is required.' : '';
  const passwordError = submitted && password.length < 8 ? 'Must be at least 8 characters.' : '';

  return (
    <div
      className="demo-stack"
      style={{ gap: 'var(--comp-formField-gap, var(--sys-spacing-md, 16px))' }}
    >
      <FormField label="Email" error={emailError}>
        <Input
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
        />
      </FormField>
      <FormField label="Password" error={passwordError} helperText="At least 8 characters">
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
        />
      </FormField>
      <FormField label="Role">
        <Select value="viewer">
          <SelectOption value="admin">Admin</SelectOption>
          <SelectOption value="editor">Editor</SelectOption>
          <SelectOption value="viewer">Viewer</SelectOption>
        </Select>
      </FormField>
      <Button variant="primary" onClick={() => setSubmitted(true)}>
        Log in
      </Button>
    </div>
  );
}

import { Input } from '@ghds/react';
import { type ChangeEvent, useState } from 'react';

/**
 * Live demo of Input's React variant, including its `error` state — React is
 * currently the only platform with an error/invalid state (see the WC demo
 * below, which intentionally has no error example).
 */
export default function InputDemo(): React.JSX.Element {
  const [email, setEmail] = useState('');

  return (
    <div className="demo-stack">
      <Input
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
      />
      <Input label="Password" type="password" error="Please enter at least 8 characters." />
      <Input label="Disabled" disabled value="Can't edit this" onChange={() => {}} />
    </div>
  );
}

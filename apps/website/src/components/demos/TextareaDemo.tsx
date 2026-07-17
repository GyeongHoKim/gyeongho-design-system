import { Textarea } from '@ghds/react/textarea';
import { type ChangeEvent, useState } from 'react';

/**
 * Live demo of Textarea's React variant, including its `error` state — React
 * is currently the only platform with an error/invalid state (see the WC demo
 * below, which intentionally has no error example) — and its `autoResize`
 * option.
 */
export default function TextareaDemo(): React.JSX.Element {
  const [bio, setBio] = useState('');

  return (
    <div className="demo-stack">
      <Textarea
        label="Bio"
        placeholder="Tell us about yourself"
        value={bio}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setBio(event.target.value)}
      />
      <Textarea label="Feedback" error="Feedback is required." />
      <Textarea
        label="Message"
        autoResize
        defaultValue={
          'This textarea grows to fit its content.\nAdd more lines and watch it expand.'
        }
      />
      <Textarea label="Disabled" disabled value="Can't edit this" onChange={() => {}} />
    </div>
  );
}

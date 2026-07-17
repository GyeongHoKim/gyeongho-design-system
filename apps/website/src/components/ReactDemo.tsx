import { Button } from '@ghds/react/button';
import { Card } from '@ghds/react/card';
import { Input } from '@ghds/react/input';
import { type ChangeEvent, useState } from 'react';

/**
 * Live demo of the `@ghds/react` component library, rendered as an Astro island
 * (`client:only="react"`). The sketch surfaces are painted in the browser, and
 * every visual comes from `@ghds/tokens` — the same tokens the Lit demo uses.
 */
export default function ReactDemo(): React.JSX.Element {
  const [email, setEmail] = useState('');

  return (
    <div className="demo-stack">
      <div>
        <p className="demo-label">Button</p>
        <div className="demo-row">
          <Button variant="primary">Default</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="neutral">Neutral</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </div>

      <div>
        <p className="demo-label">Input</p>
        <div className="demo-stack">
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
          />
          <Input label="Password" type="password" error="Please enter at least 8 characters." />
        </div>
      </div>

      <div>
        <p className="demo-label">Card</p>
        <Card>
          <h3>Hand-drawn Card</h3>
          <p>
            This card's outline and fill are drawn by sketch-core, while its color, spacing, and
            radius come from the tokens.
          </p>
        </Card>
      </div>
    </div>
  );
}

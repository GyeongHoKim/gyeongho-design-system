import { Tabs } from '@ghds/react';

/** Live Tabs demo with keyboard-navigable tabs (React). */
export default function TabsDemo(): React.JSX.Element {
  return (
    <Tabs
      label="Product details"
      items={[
        { value: 'overview', label: 'Overview', content: <p>The overview panel.</p> },
        { value: 'specs', label: 'Specs', content: <p>The specifications panel.</p> },
        { value: 'reviews', label: 'Reviews', content: <p>The reviews panel.</p> },
      ]}
    />
  );
}

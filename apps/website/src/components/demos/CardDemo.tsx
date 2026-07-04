import { Card } from '@ghds/react';

/**
 * Live demo of Card's `fill` prop — React's variant. Note this is intentionally
 * NOT the same prop as the Web Components/React Native demo below
 * (`elevated`), since React's Card has no `elevated` prop and WC/RN have no
 * `fill` prop — this is a real cross-platform API difference, not an omission.
 */
export default function CardDemo(): React.JSX.Element {
  return (
    <div className="demo-stack">
      <Card fill="solid">
        <h3>Solid</h3>
        <p>Default hand-cut paper fill.</p>
      </Card>
      <Card fill="hachure">
        <h3>Hachure</h3>
        <p>Sketched, translucent fill.</p>
      </Card>
    </div>
  );
}

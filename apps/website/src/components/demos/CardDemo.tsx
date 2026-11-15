import { Card } from '@ghds/react/card';

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
      <Card variant="sticky" fastener="tape">
        <h3>Sticky</h3>
        <p>Sticky note with tape.</p>
      </Card>
      <Card variant="lined" fastener="pin">
        <h3>Lined</h3>
        <p>Ruled paper with a pin.</p>
      </Card>
    </div>
  );
}

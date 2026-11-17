import { Callout, type CalloutVariant } from '@ghds/react/callout';

const VARIANTS: CalloutVariant[] = ['info', 'tip', 'warning'];

/** Live Callout demo across the three variants (React). */
export default function CalloutDemo(): React.JSX.Element {
  return (
    <div className="demo-stack" style={{ gap: 8 }}>
      {VARIANTS.map((variant) => (
        <Callout key={variant} variant={variant} heading={variant}>
          A {variant} aside.
        </Callout>
      ))}
    </div>
  );
}

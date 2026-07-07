import { Alert, type AlertVariant } from '@ghds/react';

const VARIANTS: AlertVariant[] = ['info', 'success', 'warning', 'danger'];

/** Live Alert demo across all four severities (React). */
export default function AlertDemo(): React.JSX.Element {
  return (
    <div className="demo-stack" style={{ gap: 8 }}>
      {VARIANTS.map((variant) => (
        <Alert key={variant} variant={variant} title={variant}>
          A {variant} message.
        </Alert>
      ))}
    </div>
  );
}

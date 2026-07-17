import { Badge, type BadgeVariant } from '@ghds/react/badge';

const VARIANTS: BadgeVariant[] = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'];

/** Live demo of Badge's six semantic variants (React). */
export default function BadgeDemo(): React.JSX.Element {
  return (
    <div className="demo-stack" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {VARIANTS.map((variant) => (
        <Badge key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  );
}

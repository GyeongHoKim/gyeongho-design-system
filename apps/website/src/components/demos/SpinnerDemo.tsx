import { Spinner, type SpinnerSize } from '@ghds/react/spinner';

const SIZES: SpinnerSize[] = ['sm', 'md', 'lg'];

/** Live demo of Spinner across the three sizes (React). */
export default function SpinnerDemo(): React.JSX.Element {
  return (
    <div className="demo-stack" style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      {SIZES.map((size) => (
        <Spinner key={size} size={size} label={`Loading ${size}`} />
      ))}
    </div>
  );
}

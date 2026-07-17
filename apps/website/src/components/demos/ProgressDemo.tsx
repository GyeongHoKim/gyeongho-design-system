import { Progress } from '@ghds/react/progress';

/** Live demo of determinate and indeterminate Progress (React). */
export default function ProgressDemo(): React.JSX.Element {
  return (
    <div className="demo-stack" style={{ gap: 16, minWidth: 240 }}>
      <Progress value={30} label="30 percent" />
      <Progress value={70} label="70 percent" />
      <Progress label="Loading" />
    </div>
  );
}

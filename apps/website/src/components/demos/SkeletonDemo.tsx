import { Skeleton } from '@ghds/react/skeleton';

/** Live demo: a card-shaped placeholder cluster (React). */
export default function SkeletonDemo(): React.JSX.Element {
  return (
    <div className="demo-stack" style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
      <Skeleton variant="circle" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
  );
}

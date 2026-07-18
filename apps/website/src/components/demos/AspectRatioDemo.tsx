import { AspectRatio } from '@ghds/react/aspect-ratio';

/** Live demo of AspectRatio holding a placeholder at three common ratios (React). */
export default function AspectRatioDemo(): React.JSX.Element {
  const cells: [number, string][] = [
    [16 / 9, '16 / 9'],
    [1, '1 / 1'],
    [4 / 3, '4 / 3'],
  ];

  return (
    <div className="demo-row">
      {cells.map(([ratio, label]) => (
        <div key={label} style={{ width: 160 }}>
          <AspectRatio ratio={ratio}>
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--sys-color-bg-muted)',
                color: 'var(--sys-color-text-secondary)',
                fontFamily: 'var(--sys-typography-label-fontFamily)',
                fontSize: 'var(--sys-typography-label-fontSize)',
              }}
            >
              {label}
            </div>
          </AspectRatio>
        </div>
      ))}
    </div>
  );
}

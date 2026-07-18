import { DirectionProvider } from '@ghds/react/direction';
import { Item, ItemContent, ItemDescription, ItemTitle } from '@ghds/react/item';

/** One column of items rendered under a given reading direction. */
function Column({ dir }: { dir: 'ltr' | 'rtl' }) {
  return (
    <DirectionProvider dir={dir}>
      <div
        dir={dir}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sys-spacing-sm)',
          flex: '1 1 220px',
        }}
      >
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>{dir === 'rtl' ? 'الرصيد' : 'Balance'}</ItemTitle>
            <ItemDescription>{dir.toUpperCase()} layout</ItemDescription>
          </ItemContent>
        </Item>
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>{dir === 'rtl' ? 'الإعدادات' : 'Settings'}</ItemTitle>
            <ItemDescription>{dir.toUpperCase()} layout</ItemDescription>
          </ItemContent>
        </Item>
      </div>
    </DirectionProvider>
  );
}

/** Live demo contrasting the same items under LTR and RTL providers (React). */
export default function DirectionDemo(): React.JSX.Element {
  return (
    <div className="demo-row">
      <Column dir="ltr" />
      <Column dir="rtl" />
    </div>
  );
}

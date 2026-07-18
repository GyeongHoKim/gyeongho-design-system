import { Badge } from '@ghds/react/badge';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@ghds/react/item';

/** Live demo of Item's variants and full media/content/actions anatomy (React). */
export default function ItemDemo(): React.JSX.Element {
  return (
    <div className="demo-stack" style={{ maxWidth: 420 }}>
      <Item variant="outline">
        <ItemMedia>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--sys-radius-pill)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--sys-color-bg-subtle)',
              color: 'var(--sys-color-text-primary)',
              fontFamily: 'var(--sys-typography-label-fontFamily)',
            }}
          >
            GH
          </div>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>GyeongHo Kim</ItemTitle>
          <ItemDescription>Maintainer · 3 open PRs</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Badge variant="success">Online</Badge>
        </ItemActions>
      </Item>

      <Item variant="muted">
        <ItemContent>
          <ItemTitle>Muted row</ItemTitle>
          <ItemDescription>A subtle filled background.</ItemDescription>
        </ItemContent>
      </Item>

      <Item selected>
        <ItemContent>
          <ItemTitle>Selected row</ItemTitle>
          <ItemDescription>Marked as the active choice.</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  );
}

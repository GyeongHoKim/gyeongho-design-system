import { Avatar, type AvatarSize } from '@ghds/react/avatar';

const SIZES: AvatarSize[] = ['sm', 'md', 'lg'];

/** Live demo of Avatar's initials fallback across the three sizes (React). */
export default function AvatarDemo(): React.JSX.Element {
  return (
    <div className="demo-stack" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {SIZES.map((size) => (
        <Avatar key={size} name="Ada Lovelace" size={size} />
      ))}
    </div>
  );
}

import { NavMenu } from '@ghds/react/nav-menu';

/** Live NavMenu demo (React). Links point at in-page anchors so the demo does not navigate away. */
export default function NavMenuDemo(): React.JSX.Element {
  return (
    <nav aria-label="Demo" style={{ padding: 24 }}>
      <NavMenu
        label="Design"
        items={[
          { href: '#design-style', label: 'Design Style' },
          { href: '#foundations', label: 'Foundations' },
          { href: '#principles', label: 'Design Principles' },
          { href: '#ux-writing', label: 'UX Writing' },
        ]}
      />
    </nav>
  );
}

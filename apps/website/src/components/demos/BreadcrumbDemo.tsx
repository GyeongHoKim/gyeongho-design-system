import { Breadcrumb } from '@ghds/react';

/** Live demo of a three-level breadcrumb trail (React). */
export default function BreadcrumbDemo(): React.JSX.Element {
  return (
    <Breadcrumb
      items={[
        { label: 'Home', href: '#' },
        { label: 'Components', href: '#' },
        { label: 'Breadcrumb' },
      ]}
    />
  );
}

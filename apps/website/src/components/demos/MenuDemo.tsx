import { Menu } from '@ghds/react/menu';

/** Live Menu demo (React). */
export default function MenuDemo(): React.JSX.Element {
  return (
    <div style={{ padding: 24 }}>
      <Menu
        label="Actions"
        items={[
          { value: 'edit', label: 'Edit' },
          { value: 'duplicate', label: 'Duplicate' },
          { value: 'archive', label: 'Archive', disabled: true },
          { value: 'delete', label: 'Delete' },
        ]}
      />
    </div>
  );
}

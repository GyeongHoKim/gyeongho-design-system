import { ContextMenu, type ContextMenuItem } from '@ghds/react/context-menu';
import type { Meta, StoryObj } from '@storybook/react-vite';

const ITEMS: ContextMenuItem[] = [
  { value: 'copy', label: 'Copy' },
  { value: 'paste', label: 'Paste' },
  { value: 'rename', label: 'Rename' },
  { value: 'delete', label: 'Delete', danger: true },
];

const meta = {
  title: 'Components/ContextMenu',
  component: ContextMenu,
} satisfies Meta<typeof ContextMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

const targetStyle = {
  display: 'grid',
  placeItems: 'center',
  width: 280,
  height: 140,
  border: '2px dashed var(--sys-color-border-default)',
  borderRadius: 'var(--sys-radius-md)',
  color: 'var(--sys-color-text-secondary)',
};

export const Default: Story = {
  render: () => (
    <ContextMenu items={ITEMS}>
      <div style={targetStyle}>Right-click here</div>
    </ContextMenu>
  ),
};

export const OnDarkSurface: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <ContextMenu items={ITEMS}>
        <div style={{ ...targetStyle, color: 'var(--sys-color-text-secondary)' }}>
          Right-click here
        </div>
      </ContextMenu>
    </div>
  ),
};

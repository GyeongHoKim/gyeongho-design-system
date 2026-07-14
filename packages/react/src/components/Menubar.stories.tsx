import type { Meta, StoryObj } from '@storybook/react-vite';
import { Menubar, type MenubarMenu } from './Menubar.js';

const MENUS: MenubarMenu[] = [
  {
    label: 'File',
    items: [
      { value: 'new', label: 'New file' },
      { value: 'open', label: 'Open…' },
      { value: 'save', label: 'Save' },
    ],
  },
  {
    label: 'Edit',
    items: [
      { value: 'undo', label: 'Undo' },
      { value: 'redo', label: 'Redo', disabled: true },
      { value: 'cut', label: 'Cut' },
    ],
  },
  {
    label: 'View',
    items: [
      { value: 'zoom-in', label: 'Zoom in' },
      { value: 'zoom-out', label: 'Zoom out' },
    ],
  },
];

const meta = {
  title: 'Components/Menubar',
  component: Menubar,
} satisfies Meta<typeof Menubar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { menus: MENUS, 'aria-label': 'Application' },
};

export const OnDarkSurface: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <Menubar menus={MENUS} aria-label="Application" />
    </div>
  ),
};

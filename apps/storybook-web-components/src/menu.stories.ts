import type { Meta, StoryObj } from '@storybook/web-components';
import '@ghds/web-components/menu';
import type { GhMenuItem } from '@ghds/web-components/menu';

const ITEMS: GhMenuItem[] = [
  { value: 'edit', label: 'Edit' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'archive', label: 'Archive', disabled: true },
  { value: 'delete', label: 'Delete' },
];

const WITH_LINKS: GhMenuItem[] = [
  { value: 'edit', label: 'Edit' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'source', label: 'View source on GitHub', href: 'https://github.com/' },
  { value: 'docs', label: 'Read the docs', href: '#docs' },
];

function renderMenu(items: GhMenuItem[]): HTMLElement {
  const el = document.createElement('gh-menu');
  const menu = el as HTMLElement & { items: GhMenuItem[]; label: string };
  menu.items = items;
  menu.label = 'Actions';
  const wrapper = document.createElement('div');
  wrapper.style.padding = '24px';
  wrapper.append(el);
  return wrapper;
}

const meta: Meta = {
  title: 'Components/Menu',
  tags: ['autodocs'],
  render: () => renderMenu(ITEMS),
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

/** Action items mixed with `href` items, which render as real `<a role="menuitem">` links. */
export const WithLinks: Story = {
  render: () => renderMenu(WITH_LINKS),
};

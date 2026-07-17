import type { Meta, StoryObj } from '@storybook/web-components';
import '@ghds/web-components/menu';
import type { GhMenuItem } from '@ghds/web-components/menu';

const ITEMS: GhMenuItem[] = [
  { value: 'edit', label: 'Edit' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'archive', label: 'Archive', disabled: true },
  { value: 'delete', label: 'Delete' },
];

const meta: Meta = {
  title: 'Components/Menu',
  tags: ['autodocs'],
  render: () => {
    const el = document.createElement('gh-menu');
    const menu = el as HTMLElement & { items: GhMenuItem[]; label: string };
    menu.items = ITEMS;
    menu.label = 'Actions';
    const wrapper = document.createElement('div');
    wrapper.style.padding = '24px';
    wrapper.append(el);
    return wrapper;
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

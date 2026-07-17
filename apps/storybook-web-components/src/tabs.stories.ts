import type { Meta, StoryObj } from '@storybook/web-components';
import '@ghds/web-components/tabs';
import type { GhTabItem } from '@ghds/web-components/tabs';

const ITEMS: GhTabItem[] = [
  { value: 'overview', label: 'Overview', content: 'The overview panel.' },
  { value: 'specs', label: 'Specs', content: 'The specifications panel.' },
  { value: 'reviews', label: 'Reviews', content: 'The reviews panel.' },
];

function make(items: GhTabItem[], value?: string): HTMLElement {
  const el = document.createElement('gh-tabs');
  const tabs = el as HTMLElement & { items: GhTabItem[]; value?: string; label: string };
  tabs.items = items;
  tabs.label = 'Product details';
  if (value) {
    tabs.value = value;
  }
  el.addEventListener('value-change', (e) => {
    tabs.value = (e as CustomEvent<string>).detail;
  });
  el.style.maxWidth = '480px';
  return el;
}

const meta: Meta = {
  title: 'Components/Tabs',
  tags: ['autodocs'],
  render: () => make(ITEMS),
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const WithDisabledTab: Story = {
  render: () =>
    make([
      ITEMS[0] as GhTabItem,
      { value: 'specs', label: 'Specs', content: 'Specs', disabled: true },
      ITEMS[2] as GhTabItem,
    ]),
};

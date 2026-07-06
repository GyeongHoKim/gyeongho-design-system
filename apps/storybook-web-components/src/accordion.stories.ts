import type { Meta, StoryObj } from '@storybook/web-components';
import '@ghds/web-components';
import type { GhAccordionItemData } from '@ghds/web-components';

const ITEMS: GhAccordionItemData[] = [
  { value: 'shipping', label: 'Shipping', content: 'Ships in 2–3 business days.' },
  { value: 'returns', label: 'Returns', content: 'Free returns within 30 days.' },
  { value: 'warranty', label: 'Warranty', content: 'Covered for one year.' },
];

function make(type: 'single' | 'multiple', open: string[]): HTMLElement {
  const el = document.createElement('gh-accordion');
  const acc = el as HTMLElement & {
    items: GhAccordionItemData[];
    type: string;
    value?: string[];
  };
  acc.items = ITEMS;
  acc.type = type;
  acc.value = open;
  el.addEventListener('value-change', (e) => {
    acc.value = (e as CustomEvent<string[]>).detail;
  });
  el.style.maxWidth = '480px';
  el.style.display = 'block';
  return el;
}

const meta: Meta = {
  title: 'Components/Accordion',
  tags: ['autodocs'],
  render: () => make('single', ['shipping']),
};

export default meta;
type Story = StoryObj;

export const Single: Story = {};

export const Multiple: Story = {
  render: () => make('multiple', ['shipping', 'returns']),
};

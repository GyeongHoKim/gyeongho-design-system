import type { Meta, StoryObj } from '@storybook/web-components';
import '@ghds/web-components/nav-menu';
import type { GhNavMenuItem } from '@ghds/web-components/nav-menu';

const ITEMS: GhNavMenuItem[] = [
  { href: '#design-style', label: 'Design Style' },
  { href: '#foundations', label: 'Foundations' },
  { href: '#principles', label: 'Design Principles' },
  { href: '#ux-writing', label: 'UX Writing' },
];

// Path hrefs for the `current` story: `current` compares paths, ignoring hashes.
const PAGE_ITEMS: GhNavMenuItem[] = [
  { href: '/design-style/', label: 'Design Style' },
  { href: '/foundations/', label: 'Foundations' },
  { href: '/principles/', label: 'Design Principles' },
  { href: '/ux-writing/', label: 'UX Writing' },
];

function renderNavMenu(theme?: 'dark', current?: string): HTMLElement {
  const el = document.createElement('gh-nav-menu');
  const navMenu = el as HTMLElement & { items: GhNavMenuItem[]; label: string; current: string };
  navMenu.items = current ? PAGE_ITEMS : ITEMS;
  navMenu.label = 'Design';
  if (current) {
    navMenu.current = current;
  }
  // In a real header, wrap the triggers in a <nav> landmark.
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Main');
  nav.style.padding = '24px';
  if (theme) {
    nav.dataset.theme = theme;
    nav.style.background = 'var(--sys-color-bg-canvas)';
  }
  nav.append(el);
  return nav;
}

/** Opens the panel so the visual snapshot captures the floating link list. */
async function openPanel(canvasElement: HTMLElement): Promise<void> {
  const el = canvasElement.querySelector('gh-nav-menu');
  await (el as (HTMLElement & { updateComplete: Promise<boolean> }) | null)?.updateComplete;
  el?.shadowRoot?.querySelector<HTMLButtonElement>('.trigger')?.click();
}

const meta: Meta = {
  title: 'Components/NavMenu',
  tags: ['autodocs'],
  render: () => renderNavMenu(),
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

/** The panel open: a plain list of real `<a href>` links (no menu roles). */
export const Open: Story = {
  play: async ({ canvasElement }) => openPanel(canvasElement),
};

/** `current` marks the active page: `aria-current="page"` link, underlined trigger. */
export const Current: Story = {
  render: () => renderNavMenu(undefined, '/foundations/'),
  play: async ({ canvasElement }) => openPanel(canvasElement),
};

export const Dark: Story = {
  render: () => renderNavMenu('dark'),
  play: async ({ canvasElement }) => openPanel(canvasElement),
};

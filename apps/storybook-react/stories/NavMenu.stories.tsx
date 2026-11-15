import { NavMenu, type NavMenuItem } from '@ghds/react/nav-menu';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

const ITEMS: NavMenuItem[] = [
  { href: '#design-style', label: 'Design Style' },
  { href: '#foundations', label: 'Foundations' },
  { href: '#principles', label: 'Design Principles' },
  { href: '#ux-writing', label: 'UX Writing' },
];

const meta = {
  title: 'Components/NavMenu',
  component: NavMenu,
  args: { label: 'Design', items: ITEMS },
  decorators: [
    (Story) => (
      // In a real header, wrap the triggers in a <nav> landmark.
      <nav aria-label="Main" style={{ padding: 24 }}>
        <Story />
      </nav>
    ),
  ],
} satisfies Meta<typeof NavMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The panel open: a plain list of real `<a href>` links — no menu roles anywhere. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Design' }));
    const link = canvas.getByRole('link', { name: 'Foundations' });
    await expect(link.tagName).toBe('A');
    await expect(link).toHaveAttribute('href', '#foundations');
    await expect(canvas.queryByRole('menu')).toBeNull();
    await expect(canvas.queryAllByRole('menuitem')).toHaveLength(0);
  },
};

/** ArrowDown on the trigger opens the panel and focuses the first link. */
export const KeyboardOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('button', { name: 'Design' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('link', { name: 'Design Style' })).toHaveFocus();
  },
};

export const Dark: Story = {
  decorators: [
    (Story) => (
      <div data-theme="dark" style={{ background: 'var(--sys-color-bg-canvas)', padding: 24 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Design' }));
    await expect(canvas.getAllByRole('link')).toHaveLength(4);
  },
};

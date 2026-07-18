import { Attachment } from '@ghds/react/attachment';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

const meta = {
  title: 'Components/Attachment',
  component: Attachment,
  args: {
    name: 'quarterly-report.pdf',
    meta: '2.4 MB',
  },
} satisfies Meta<typeof Attachment>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutMeta: Story = {
  args: { name: 'notes.txt', meta: undefined },
};

export const WithIcon: Story = {
  args: { name: 'newsletter.eml', meta: '12 KB', icon: 'mail' },
};

export const Removable: Story = {
  args: { name: 'report.pdf', meta: '2.4 MB', onRemove: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Remove report.pdf' }));
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
  },
};

export const List: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sys-spacing-sm)' }}>
      <Attachment name="newsletter.eml" meta="12 KB" icon="mail" />
      <Attachment name="event.ics" meta="2 KB" icon="calendar" />
      <Attachment name="quarterly-report.pdf" meta="2.4 MB" onRemove={() => {}} />
    </div>
  ),
};

/** Visual-regression guard: the chip's sketch fill + stroke stay scoped on a dark surface. */
export const OnOpaqueSurfaceDark: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{
        background: 'var(--sys-color-bg-surface)',
        padding: 'var(--sys-spacing-lg)',
        display: 'flex',
        gap: 'var(--sys-spacing-sm)',
        flexWrap: 'wrap',
      }}
    >
      <Attachment name="newsletter.eml" meta="12 KB" icon="mail" />
      <Attachment name="quarterly-report.pdf" meta="2.4 MB" onRemove={() => {}} />
    </div>
  ),
};

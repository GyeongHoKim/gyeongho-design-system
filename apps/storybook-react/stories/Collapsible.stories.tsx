import { Collapsible } from '@ghds/react/collapsible';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Collapsible',
  component: Collapsible,
} satisfies Meta<typeof Collapsible>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Show more',
    children: 'This content is revealed when the disclosure is expanded.',
  },
};

export const Open: Story = {
  args: {
    label: 'Show more',
    defaultOpen: true,
    children: 'This content starts expanded.',
  },
};

export const OnDarkSurface: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <Collapsible label="Show more" defaultOpen>
        Dark-mode disclosure content.
      </Collapsible>
    </div>
  ),
};

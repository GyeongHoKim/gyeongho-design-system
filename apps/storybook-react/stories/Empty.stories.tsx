import { Button } from '@ghds/react/button';
import { Empty } from '@ghds/react/empty';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Empty',
  component: Empty,
} satisfies Meta<typeof Empty>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: 'search',
    title: 'No results found',
    description: 'Try adjusting your filters or search terms.',
  },
};

export const WithAction: Story = {
  args: {
    icon: 'star',
    title: 'No favourites yet',
    description: 'Star items to find them quickly later.',
    action: <Button>Browse items</Button>,
  },
};

export const TitleOnly: Story = {
  args: { title: 'Nothing here' },
};

export const OnDarkSurface: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <Empty icon="search" title="No results found" description="Try a different search." />
    </div>
  ),
};

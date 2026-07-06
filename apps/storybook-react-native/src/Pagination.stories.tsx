import { Pagination } from '@ghds/react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  args: { count: 12, page: 1 },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const FewPages: Story = { args: { count: 5, page: 2 } };

export const ManyPages: Story = { args: { count: 20, page: 10 } };

export const Interactive: Story = {
  render: (args) => {
    const [page, setPage] = useState(args.page);
    return <Pagination {...args} page={page} onPageChange={setPage} />;
  },
};

import { Pagination } from '@ghds/react/pagination';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FewPages: Story = {
  args: { count: 5, page: 2 },
};

export const ManyPages: Story = {
  args: { count: 20, page: 10 },
};

export const FirstPage: Story = {
  args: { count: 10, page: 1 },
};

/** Interactive: clicking a page updates the current page. */
export const Interactive: Story = {
  args: { count: 12, page: 1 },
  render: (args) => {
    const [page, setPage] = useState(args.page);
    return <Pagination {...args} page={page} onPageChange={setPage} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // With count=12/page=1 and the default siblingCount, only pages 1, 2, an
    // ellipsis, and 12 render — page 3 isn't in the visible window.
    await userEvent.click(canvas.getByRole('button', { name: 'Page 2' }));
    await expect(canvas.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
};

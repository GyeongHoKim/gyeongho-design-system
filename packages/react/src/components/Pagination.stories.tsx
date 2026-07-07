import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Pagination } from './Pagination.js';

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
    await userEvent.click(canvas.getByRole('button', { name: 'Page 3' }));
    await expect(canvas.getByRole('button', { name: 'Page 3' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
};

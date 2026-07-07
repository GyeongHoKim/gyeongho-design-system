import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@ghds/web-components';

interface PaginationArgs {
  count: number;
  page: number;
  siblingCount: number;
}

const meta: Meta<PaginationArgs> = {
  title: 'Components/Pagination',
  tags: ['autodocs'],
  render: (args) => html`
    <gh-pagination
      .count=${args.count}
      .page=${args.page}
      .siblingCount=${args.siblingCount}
      @page-change=${(e: CustomEvent<number>) => {
        const el = e.currentTarget as HTMLElement & { page: number };
        el.page = e.detail;
      }}
    ></gh-pagination>
  `,
  args: { count: 12, page: 1, siblingCount: 1 },
  argTypes: {
    count: { control: { type: 'number' } },
    page: { control: { type: 'number' } },
    siblingCount: { control: { type: 'number' } },
  },
};

export default meta;
type Story = StoryObj<PaginationArgs>;

export const FewPages: Story = { args: { count: 5, page: 2 } };

export const ManyPages: Story = { args: { count: 20, page: 10 } };

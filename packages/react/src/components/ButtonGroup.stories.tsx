import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button.js';
import { ButtonGroup } from './ButtonGroup.js';

const meta = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
} satisfies Meta<typeof ButtonGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <ButtonGroup aria-label="Text alignment">
      <Button variant="neutral">Left</Button>
      <Button variant="neutral">Center</Button>
      <Button variant="neutral">Right</Button>
    </ButtonGroup>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical" aria-label="Actions">
      <Button variant="neutral">Copy</Button>
      <Button variant="neutral">Paste</Button>
      <Button variant="neutral">Delete</Button>
    </ButtonGroup>
  ),
};

export const OnDarkSurface: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <ButtonGroup aria-label="Text alignment">
        <Button variant="neutral">Left</Button>
        <Button variant="neutral">Center</Button>
        <Button variant="neutral">Right</Button>
      </ButtonGroup>
    </div>
  ),
};

import { Alert, type AlertVariant } from '@ghds/react/alert';
import type { Meta, StoryObj } from '@storybook/react-vite';

const VARIANTS: AlertVariant[] = ['info', 'success', 'warning', 'danger'];

const meta = {
  title: 'Components/Alert',
  component: Alert,
  args: { variant: 'info', title: 'Heads up', children: 'This is an informational message.' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sys-spacing-sm)' }}>
      {VARIANTS.map((variant) => (
        <Alert key={variant} variant={variant} title={variant}>
          A {variant} message.
        </Alert>
      ))}
    </div>
  ),
};

export const Dismissible: Story = {
  args: { variant: 'success', title: 'Saved', onDismiss: () => {} },
};

export const Dark: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-canvas)', padding: 'var(--sys-spacing-lg)' }}
    >
      <Alert variant="danger" title="Error">
        Something went wrong.
      </Alert>
    </div>
  ),
};

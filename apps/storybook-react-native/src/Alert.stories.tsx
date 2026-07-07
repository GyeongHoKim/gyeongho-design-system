import { Alert, type AlertVariant } from '@ghds/react-native';
import type { Meta, StoryObj } from '@storybook/react';

const VARIANTS: AlertVariant[] = ['info', 'success', 'warning', 'danger'];

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  args: { variant: 'info', title: 'Heads up', children: 'This is an informational message.' },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <>
      {VARIANTS.map((variant) => (
        <Alert key={variant} variant={variant} title={variant}>
          A {variant} message.
        </Alert>
      ))}
    </>
  ),
};

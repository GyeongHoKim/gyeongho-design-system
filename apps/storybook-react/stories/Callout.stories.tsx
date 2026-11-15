import { Callout, type CalloutVariant } from '@ghds/react/callout';
import type { Meta, StoryObj } from '@storybook/react-vite';

const VARIANTS: CalloutVariant[] = ['info', 'tip', 'warning'];

const meta = {
  title: 'Components/Callout',
  component: Callout,
  args: {
    variant: 'info',
    heading: 'Note',
    children: 'Fonts are loaded by the consuming app, not by the tokens package.',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 520 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Callout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sys-spacing-sm)' }}>
      {VARIANTS.map((variant) => (
        <Callout key={variant} variant={variant} heading={variant}>
          A {variant} aside for documentation content.
        </Callout>
      ))}
    </div>
  ),
};

export const WithoutHeading: Story = {
  args: { variant: 'tip', heading: undefined, children: 'Prefer sys tokens over ref tokens.' },
};

export const RichContent: Story = {
  args: {
    variant: 'warning',
    heading: 'Before you commit',
    children: (
      <p style={{ margin: 0 }}>
        Run <code>pnpm check</code>, not only <code>pnpm lint</code>. See the{' '}
        <a href="#contributing">contributing guide</a>.
      </p>
    ),
  },
};

export const Dark: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sys-spacing-sm)',
        background: 'var(--sys-color-bg-canvas)',
        padding: 'var(--sys-spacing-lg)',
      }}
    >
      {VARIANTS.map((variant) => (
        <Callout key={variant} variant={variant} heading={variant}>
          A {variant} aside in the dark theme.
        </Callout>
      ))}
    </div>
  ),
};

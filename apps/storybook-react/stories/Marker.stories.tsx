import { Marker, type MarkerVariant } from '@ghds/react/marker';
import type { Meta, StoryObj } from '@storybook/react-vite';

const VARIANTS: MarkerVariant[] = ['default', 'success', 'info', 'danger'];

const proseStyle = {
  maxWidth: 520,
  fontFamily: 'var(--sys-typography-body-fontFamily)',
  fontSize: 'var(--sys-typography-body-fontSize)',
  color: 'var(--sys-color-text-primary)',
  lineHeight: 1.7,
};

const meta = {
  title: 'Components/Marker',
  component: Marker,
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
  },
  args: { variant: 'default', children: 'highlighted' },
} satisfies Meta<typeof Marker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <p style={proseStyle}>
      The hand-drawn <Marker {...args} /> stroke sits behind the words, so they stay readable.
    </p>
  ),
};

export const Variants: Story = {
  render: () => (
    <p style={proseStyle}>
      Highlight tones read as intent: <Marker variant="default">default</Marker>,{' '}
      <Marker variant="success">success</Marker>, <Marker variant="info">info</Marker>, and{' '}
      <Marker variant="danger">danger</Marker> each paint a different sketchy colour.
    </p>
  ),
};

/** Visual-regression guard: the hachure stroke stays scoped on an opaque dark surface. */
export const OnOpaqueSurfaceDark: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <p style={proseStyle}>
        On a dark surface the <Marker variant="default">default</Marker> and{' '}
        <Marker variant="info">info</Marker> highlights keep their words legible.
      </p>
    </div>
  ),
};

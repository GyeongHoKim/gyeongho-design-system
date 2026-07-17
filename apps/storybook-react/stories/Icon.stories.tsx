import { iconNames } from '@ghds/icons';
import { Icon } from '@ghds/react/icon';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Icon',
  component: Icon,
  args: { name: 'search', size: 'md' },
  argTypes: {
    name: { control: 'select', options: iconNames },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <Icon {...args} size="sm" />
      <Icon {...args} size="md" />
      <Icon {...args} size="lg" />
    </div>
  ),
};

/** Icons inherit their color from `currentColor` — here the container's text color. */
export const InheritsColor: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 24, color: 'var(--sys-color-icon-danger)' }}>
      <Icon {...args} name="trash" />
      <Icon {...args} name="warning" />
      <Icon {...args} name="close" />
    </div>
  ),
};

/** The full icon set — the catalog a designer or engineer browses to pick a name. */
export const Catalog: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
        gap: 16,
        maxWidth: 720,
      }}
    >
      {iconNames.map((name) => (
        <div
          key={name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            padding: 12,
          }}
        >
          <Icon name={name} size="lg" />
          <code style={{ fontSize: 11, textAlign: 'center' }}>{name}</code>
        </div>
      ))}
    </div>
  ),
};

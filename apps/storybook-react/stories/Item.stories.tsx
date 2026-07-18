import { Badge } from '@ghds/react/badge';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  type ItemVariant,
} from '@ghds/react/item';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

const VARIANTS: ItemVariant[] = ['default', 'muted', 'outline'];

/** A round media chip standing in for an icon or avatar. */
function MediaChip({ label }: { label: string }) {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 'var(--sys-radius-pill)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--sys-color-bg-subtle)',
        color: 'var(--sys-color-text-primary)',
        fontFamily: 'var(--sys-typography-label-fontFamily)',
      }}
    >
      {label}
    </div>
  );
}

const meta = {
  title: 'Components/Item',
  component: Item,
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    selected: { control: 'boolean' },
  },
  args: {
    variant: 'default',
    selected: false,
    style: { maxWidth: 420 },
    children: (
      <ItemContent>
        <ItemTitle>Design tokens</ItemTitle>
        <ItemDescription>The single source of truth for every value.</ItemDescription>
      </ItemContent>
    ),
  },
} satisfies Meta<typeof Item>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Muted: Story = {
  args: { variant: 'muted' },
};

export const Outline: Story = {
  args: { variant: 'outline' },
};

export const Selected: Story = {
  args: { selected: true },
};

/** The full anatomy: leading media, a content column, and trailing actions. */
export const WithMediaAndActions: Story = {
  args: {
    variant: 'outline',
    children: (
      <>
        <ItemMedia>
          <MediaChip label="GH" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>GyeongHo Kim</ItemTitle>
          <ItemDescription>Maintainer · 3 open PRs</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Badge variant="success">Online</Badge>
        </ItemActions>
      </>
    ),
  },
};

export const Variants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sys-spacing-sm)',
        maxWidth: 420,
      }}
    >
      {VARIANTS.map((variant) => (
        <Item key={variant} variant={variant}>
          <ItemContent>
            <ItemTitle>{variant}</ItemTitle>
            <ItemDescription>The {variant} surface treatment.</ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </div>
  ),
};

/** A selectable list built from rows — one marked selected. */
export const AsList: Story = {
  render: () => (
    <div role="listbox" aria-label="Frameworks" style={{ maxWidth: 420 }}>
      {[
        { label: 'React', selected: true },
        { label: 'Web Components', selected: false },
        { label: 'React Native', selected: false },
      ].map((row) => (
        <Item
          key={row.label}
          role="option"
          aria-selected={row.selected}
          selected={row.selected}
          variant="muted"
        >
          <ItemContent>
            <ItemTitle>{row.label}</ItemTitle>
          </ItemContent>
        </Item>
      ))}
    </div>
  ),
};

/** Rows are plain divs, so a caller can wire click/keyboard semantics on top. */
export const Clickable: Story = {
  args: {
    variant: 'outline',
    role: 'button',
    tabIndex: 0,
    onClick: fn(),
    children: (
      <ItemContent>
        <ItemTitle>Open settings</ItemTitle>
        <ItemDescription>Click to trigger the handler.</ItemDescription>
      </ItemContent>
    ),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /open settings/i }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/**
 * Visual-regression guard: on an opaque dark surface the sketch outline of the
 * `outline` variant and the selected fill must stay scoped to each row.
 */
export const OnOpaqueSurfaceDark: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{
        background: 'var(--sys-color-bg-surface)',
        padding: 'var(--sys-spacing-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sys-spacing-sm)',
        maxWidth: 420,
      }}
    >
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Outline on dark</ItemTitle>
          <ItemDescription>Sketch stroke stays put.</ItemDescription>
        </ItemContent>
      </Item>
      <Item selected>
        <ItemContent>
          <ItemTitle>Selected on dark</ItemTitle>
          <ItemDescription>Selected fill stays scoped.</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  ),
};

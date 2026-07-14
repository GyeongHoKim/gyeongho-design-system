import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from './Button.js';
import { Command, CommandDialog, type CommandGroup } from './Command.js';

const GROUPS: CommandGroup[] = [
  {
    heading: 'Suggestions',
    items: [
      { value: 'calendar', label: 'Calendar' },
      { value: 'search', label: 'Search emoji', keywords: ['icon', 'symbol'] },
      { value: 'calculator', label: 'Calculator' },
    ],
  },
  {
    heading: 'Settings',
    items: [
      { value: 'profile', label: 'Profile' },
      { value: 'billing', label: 'Billing' },
      { value: 'settings', label: 'Settings', disabled: true },
    ],
  },
];

const meta = {
  title: 'Components/Command',
  component: Command,
} satisfies Meta<typeof Command>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Palette: Story = {
  render: () => (
    <div
      style={{
        width: 420,
        border: '2px solid var(--sys-color-border-strong)',
        borderRadius: 'var(--sys-radius-lg)',
        overflow: 'hidden',
      }}
    >
      <Command groups={GROUPS} autoFocus={false} aria-label="Command palette" />
    </div>
  ),
};

export const Dialog: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open command palette</Button>
        <CommandDialog
          open={open}
          onClose={() => setOpen(false)}
          groups={GROUPS}
          aria-label="Command palette"
          onSelect={() => setOpen(false)}
        />
      </>
    );
  },
};

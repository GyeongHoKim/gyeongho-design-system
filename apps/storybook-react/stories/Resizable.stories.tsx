import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@ghds/react/resizable';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

/** A padded, centered pane face so each region is visible. */
function Pane({ label }: { label: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        padding: 'var(--sys-spacing-md)',
        background: 'var(--sys-color-bg-muted)',
        color: 'var(--sys-color-text-secondary)',
        fontFamily: 'var(--sys-typography-label-fontFamily)',
      }}
    >
      {label}
    </div>
  );
}

const meta = {
  title: 'Components/Resizable',
  component: ResizablePanelGroup,
  argTypes: {
    direction: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div style={{ width: 480, height: 240 }}>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>
          <Pane label="One" />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <Pane label="Two" />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ width: 480, height: 320 }}>
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={50}>
          <Pane label="Top" />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <Pane label="Bottom" />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
};

export const ThreePane: Story = {
  render: () => (
    <div style={{ width: 600, height: 240 }}>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25} minSize={15}>
          <Pane label="Nav" />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <Pane label="Editor" />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={25} minSize={15}>
          <Pane label="Inspector" />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
};

/** Focusing the separator and pressing ArrowRight redistributes size — aria-valuenow updates. */
export const KeyboardResize: Story = {
  render: () => (
    <div style={{ width: 480, height: 240 }}>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>
          <Pane label="One" />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <Pane label="Two" />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const separator = canvas.getByRole('separator');
    await expect(separator).toHaveAttribute('aria-valuenow', '50');
    separator.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(separator).toHaveAttribute('aria-valuenow', '55');
  },
};

/** Visual-regression guard: panes + hand-drawn handle on an opaque dark surface. */
export const OnOpaqueSurfaceDark: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <div style={{ width: 480, height: 240 }}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={50}>
            <Pane label="One" />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <Pane label="Two" />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  ),
};

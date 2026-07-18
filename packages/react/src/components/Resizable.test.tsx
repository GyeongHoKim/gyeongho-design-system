import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './Resizable.js';

function TwoPane() {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={50}>Left</ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>Right</ResizablePanel>
    </ResizablePanelGroup>
  );
}

describe('Resizable', () => {
  it('renders its panels', () => {
    render(<TwoPane />);
    expect(screen.getByText('Left')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();
  });

  it('exposes the handle as an oriented separator with a value', () => {
    render(<TwoPane />);
    const handle = screen.getByRole('separator');
    expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    expect(handle).toHaveAttribute('aria-valuenow', '50');
    expect(handle).toHaveAttribute('tabindex', '0');
  });

  it('resizes via the keyboard, keeping the pair total constant', async () => {
    const user = userEvent.setup();
    render(<TwoPane />);
    const handle = screen.getByRole('separator');
    handle.focus();
    await user.keyboard('{ArrowRight}');
    expect(handle).toHaveAttribute('aria-valuenow', '55');
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(handle).toHaveAttribute('aria-valuenow', '45');
  });

  it('clamps to the panel min/max sizes', async () => {
    const user = userEvent.setup();
    render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50} maxSize={60}>
          Left
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>Right</ResizablePanel>
      </ResizablePanelGroup>,
    );
    const handle = screen.getByRole('separator');
    handle.focus();
    // 50 -> 55 -> capped at 60 (not 65).
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
    expect(handle).toHaveAttribute('aria-valuenow', '60');
  });

  it('orients the separator across the axis for a vertical group', () => {
    render(
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={50}>Top</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>Bottom</ResizablePanel>
      </ResizablePanelGroup>,
    );
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
  });
});

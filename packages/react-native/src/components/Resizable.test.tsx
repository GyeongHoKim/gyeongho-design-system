import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Text } from '../theme/primitives.js';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './Resizable.js';

describe('Resizable', () => {
  it('renders its panels', () => {
    renderWithTheme(
      <ResizablePanelGroup direction="horizontal" testID="group">
        <ResizablePanel defaultSize={50}>
          <Text>Left panel</Text>
        </ResizablePanel>
        <ResizableHandle testID="handle" />
        <ResizablePanel defaultSize={50}>
          <Text>Right panel</Text>
        </ResizablePanel>
      </ResizablePanelGroup>,
    );
    expect(screen.getByTestId('group')).toBeInTheDocument();
    expect(screen.getByText('Left panel')).toBeInTheDocument();
    expect(screen.getByText('Right panel')).toBeInTheDocument();
  });

  it('renders a draggable handle exposing its resize value', () => {
    renderWithTheme(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={40}>
          <Text>A</Text>
        </ResizablePanel>
        <ResizableHandle testID="handle" />
        <ResizablePanel defaultSize={60}>
          <Text>B</Text>
        </ResizablePanel>
      </ResizablePanelGroup>,
    );
    const handle = screen.getByTestId('handle');
    expect(handle).toBeInTheDocument();
    expect(handle).toHaveAttribute('aria-valuenow', '40');
  });

  it('renders a grip when withHandle is set', () => {
    renderWithTheme(
      <ResizablePanelGroup direction="vertical" testID="group">
        <ResizablePanel>
          <Text>Top</Text>
        </ResizablePanel>
        <ResizableHandle withHandle testID="handle" />
        <ResizablePanel>
          <Text>Bottom</Text>
        </ResizablePanel>
      </ResizablePanelGroup>,
    );
    expect(screen.getByTestId('group')).toBeInTheDocument();
    expect(screen.getByTestId('handle')).toBeInTheDocument();
    expect(screen.getByText('Top')).toBeInTheDocument();
    expect(screen.getByText('Bottom')).toBeInTheDocument();
  });
});

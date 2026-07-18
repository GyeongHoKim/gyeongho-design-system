import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@ghds/react/resizable';

/** A padded, centered pane face. */
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

/** Live demo of a horizontal resizable split view — drag or arrow-key the handle (React). */
export default function ResizableDemo(): React.JSX.Element {
  return (
    <div style={{ width: '100%', maxWidth: 480, height: 240 }}>
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
  );
}

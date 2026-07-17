import { Button } from '@ghds/react/button';
import { Toast, Toaster, type ToastVariant, toast } from '@ghds/react/toast';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Toast',
  component: Toast,
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

const VARIANTS: ToastVariant[] = ['info', 'success', 'warning', 'danger'];

/** The presentational card, rendered directly (no store / auto-dismiss). */
export const Presentational: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sys-spacing-md)' }}>
      {VARIANTS.map((variant) => (
        <Toast key={variant} variant={variant} title={variant} onDismiss={() => {}}>
          This is a {variant} message.
        </Toast>
      ))}
    </div>
  ),
};

/** The full system: a `Toaster` viewport driven by the imperative `toast()` API. */
export const WithToaster: Story = {
  render: () => (
    <>
      <div style={{ display: 'flex', gap: 'var(--sys-spacing-sm)', flexWrap: 'wrap' }}>
        <Button onClick={() => toast.info('Heads up — something happened.')}>Info</Button>
        <Button onClick={() => toast.success('Saved', { title: 'Done' })}>Success</Button>
        <Button variant="neutral" onClick={() => toast.warning('Storage almost full.')}>
          Warning
        </Button>
        <Button variant="danger" onClick={() => toast.error('Upload failed', { title: 'Error' })}>
          Error
        </Button>
      </div>
      <Toaster position="bottom-right" />
    </>
  ),
};

export const OnDarkSurface: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <Toast variant="success" title="Saved" onDismiss={() => {}}>
        Your changes have been saved.
      </Toast>
    </div>
  ),
};

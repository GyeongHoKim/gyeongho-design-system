import { Alert, Button, Modal, Toast, type ToastVariant } from '@ghds/react';
import { useState } from 'react';

const VARIANTS: ToastVariant[] = ['success', 'danger', 'warning', 'info'];

/** Live demo of feedback patterns — toast, alert, and modal side by side. */
export default function PatternFeedbackDemo(): React.JSX.Element {
  const [toast, setToast] = useState<{ open: boolean; variant: ToastVariant }>({
    open: false,
    variant: 'success',
  });
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="demo-stack" style={{ gap: 'var(--sys-spacing-md, 16px)' }}>
      <Alert variant="info" title="Maintenance notice">
        The system will be updated tonight at 2 AM UTC. Your work will not be affected.
      </Alert>

      <div className="demo-row">
        {VARIANTS.map((v) => (
          <Button
            key={v}
            variant={v === 'danger' ? 'danger' : v === 'warning' ? 'neutral' : 'primary'}
            onClick={() => setToast({ open: true, variant: v })}
          >
            {v}
          </Button>
        ))}
      </div>

      <Button variant="danger" onClick={() => setShowModal(true)}>
        Delete account
      </Button>

      <Toast
        open={toast.open}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        variant={toast.variant}
        title={toast.variant.charAt(0).toUpperCase() + toast.variant.slice(1)}
        duration={0}
      >
        This is a {toast.variant} toast message.
      </Toast>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Delete account?">
        <p style={{ marginTop: 0 }}>
          This action cannot be undone. All your data will be permanently removed.
        </p>
        <div
          style={{ display: 'flex', gap: 'var(--sys-spacing-sm)', justifyContent: 'flex-end' }}
        >
          <Button variant="neutral" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => setShowModal(false)}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

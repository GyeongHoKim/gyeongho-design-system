import { Button } from '@ghds/react/button';
import { Modal } from '@ghds/react/modal';
import { useState } from 'react';

/** Live Modal demo (React). */
export default function ModalDemo(): React.JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: 24 }}>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Delete item?">
        <p style={{ marginTop: 0 }}>This action cannot be undone.</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="neutral" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => setOpen(false)}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

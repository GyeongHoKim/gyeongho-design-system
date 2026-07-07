import { Button, Toast } from '@ghds/react';
import { useState } from 'react';

/** Live Toast demo (React). */
export default function ToastDemo(): React.JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: 24 }}>
      <Button onClick={() => setOpen(true)}>Show toast</Button>
      <Toast
        open={open}
        onClose={() => setOpen(false)}
        variant="success"
        title="Saved"
        duration={0}
      >
        Your changes have been saved.
      </Toast>
    </div>
  );
}

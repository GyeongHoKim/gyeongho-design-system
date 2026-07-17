import { Button } from '@ghds/react/button';
import { Toaster, toast } from '@ghds/react/toast';

/** Live Toast demo (React) — imperative `toast()` API + a `Toaster` viewport. */
export default function ToastDemo(): React.JSX.Element {
  return (
    <div style={{ padding: 24 }}>
      <Button onClick={() => toast.success('Your changes have been saved.', { title: 'Saved' })}>
        Show toast
      </Button>
      <Toaster position="bottom-right" />
    </div>
  );
}

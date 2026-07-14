import type { IconName } from '@ghds/icons';
import { tokens } from '@ghds/tokens';
import {
  type CSSProperties,
  forwardRef,
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { Icon } from './Icon.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

/** Severity of a {@link Toast}. */
export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';

/** Where the {@link Toaster} viewport is anchored. */
export type ToasterPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

const toast_ = tokens.comp.toast;
const c = cssVars.comp.toast;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;
const DEFAULT_DURATION = 5000;

const ICON: Record<ToastVariant, IconName> = {
  info: 'info',
  success: 'check',
  warning: 'warning',
  danger: 'warning',
};

// ---------------------------------------------------------------------------
// Store — a tiny module-level notification store the `toast()` API writes to
// and every mounted `Toaster` subscribes to (react-hot-toast / sonner shape).
// ---------------------------------------------------------------------------

/** A queued notification. */
export interface ToastRecord {
  readonly id: string;
  readonly message: ReactNode;
  readonly title?: ReactNode;
  readonly variant: ToastVariant;
  /** Auto-dismiss after this many ms; `0` to persist. */
  readonly duration: number;
}

/** Options for the imperative `toast()` API. */
export interface ToastOptions {
  title?: ReactNode;
  variant?: ToastVariant;
  /** Auto-dismiss delay in ms; `0` to persist. Defaults to 5000. */
  duration?: number;
}

let records: ToastRecord[] = [];
const listeners = new Set<() => void>();
let counter = 0;

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ToastRecord[] {
  return records;
}

const EMPTY: ToastRecord[] = [];
function getServerSnapshot(): ToastRecord[] {
  return EMPTY;
}

function addToast(message: ReactNode, options: ToastOptions = {}): string {
  counter += 1;
  const id = `toast-${counter}`;
  records = [
    ...records,
    {
      id,
      message,
      title: options.title,
      variant: options.variant ?? 'info',
      duration: options.duration ?? DEFAULT_DURATION,
    },
  ];
  emit();
  return id;
}

function dismissToast(id: string): void {
  records = records.filter((record) => record.id !== id);
  emit();
}

interface ToastFn {
  (message: ReactNode, options?: ToastOptions): string;
  success: (message: ReactNode, options?: Omit<ToastOptions, 'variant'>) => string;
  error: (message: ReactNode, options?: Omit<ToastOptions, 'variant'>) => string;
  warning: (message: ReactNode, options?: Omit<ToastOptions, 'variant'>) => string;
  info: (message: ReactNode, options?: Omit<ToastOptions, 'variant'>) => string;
  dismiss: (id: string) => void;
}

/**
 * Imperative notification API. Call `toast('Saved')` (or `toast.success(...)`,
 * `toast.error(...)`, `toast.warning(...)`, `toast.info(...)`) to enqueue a
 * notification; each returns an id you can pass to `toast.dismiss(id)`. A
 * {@link Toaster} must be mounted somewhere in the tree to render them.
 */
export const toast: ToastFn = Object.assign(
  (message: ReactNode, options?: ToastOptions) => addToast(message, options),
  {
    success: (message: ReactNode, options?: Omit<ToastOptions, 'variant'>) =>
      addToast(message, { ...options, variant: 'success' }),
    error: (message: ReactNode, options?: Omit<ToastOptions, 'variant'>) =>
      addToast(message, { ...options, variant: 'danger' }),
    warning: (message: ReactNode, options?: Omit<ToastOptions, 'variant'>) =>
      addToast(message, { ...options, variant: 'warning' }),
    info: (message: ReactNode, options?: Omit<ToastOptions, 'variant'>) =>
      addToast(message, { ...options, variant: 'info' }),
    dismiss: (id: string) => dismissToast(id),
  },
);

// ---------------------------------------------------------------------------
// Presentational Toast — renders a single notification card.
// ---------------------------------------------------------------------------

export interface ToastProps {
  /** Severity. Defaults to `'info'`. */
  variant?: ToastVariant;
  /** Optional bold title. */
  title?: ReactNode;
  /** Message body. */
  children?: ReactNode;
  /** Called when the close button is pressed. */
  onDismiss?: () => void;
}

/**
 * A hand-drawn toast card: a sketchy, elevated box (`@ghds/sketch-core`) with a
 * severity icon, an optional title, a message and a dismiss button. This is the
 * presentational unit rendered by {@link Toaster} for each notification; use the
 * imperative {@link toast} API to enqueue them. `danger` uses `role="alert"`
 * (assertive); the rest use `role="status"` (polite). Colours and sketch
 * parameters come from `@ghds/tokens` (`comp.toast.*`).
 */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  { variant = 'info', title, children, onDismiss },
  forwardedRef,
) {
  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLDivElement>({
    fillStyle: 'solid',
    roughness: toast_.sketch.roughness,
    bowing: toast_.sketch.bowing,
    inset: INSET,
  });
  const ref = mergeRefs(sketchRef, forwardedRef);

  const rootStyle: CSSProperties = {
    ...sketchHostStyle,
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    gap: toast_.gap,
    boxSizing: 'border-box',
    width: '20rem',
    maxWidth: '90vw',
    padding: toast_.padding,
    color: c.text.body,
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
    lineHeight: String(tokens.sys.typography.body.lineHeight),
  };

  return (
    <div
      ref={ref}
      role={variant === 'danger' ? 'alert' : 'status'}
      aria-live={variant === 'danger' ? 'assertive' : 'polite'}
      style={rootStyle}
    >
      <SketchSurface
        drawable={drawable}
        width={size.width}
        height={size.height}
        strokeColor={c.stroke[variant]}
        strokeWidth={STROKE_WIDTH}
        fillColor={c.bg}
        fillRendering="fill"
        shadowColor={c.stroke[variant]}
      />
      <span style={{ position: 'relative', display: 'inline-flex', color: c.icon[variant] }}>
        <Icon name={ICON[variant]} size="sm" />
      </span>
      <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
        {title !== undefined && (
          <div style={{ color: c.text.title, fontWeight: tokens.sys.typography.label.fontWeight }}>
            {title}
          </div>
        )}
        {children !== undefined && <div>{children}</div>}
      </div>
      {onDismiss !== undefined && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          style={{
            position: 'relative',
            display: 'inline-flex',
            padding: 0,
            border: 'none',
            background: 'transparent',
            color: c.text.body,
            cursor: 'pointer',
          }}
        >
          <Icon name="close" size="sm" />
        </button>
      )}
    </div>
  );
});

// ---------------------------------------------------------------------------
// Toaster — the portal viewport that renders and auto-dismisses queued toasts.
// ---------------------------------------------------------------------------

export interface ToasterProps {
  /** Viewport anchor. Defaults to `'bottom-right'`. */
  position?: ToasterPosition;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function ToasterItem({ record }: { record: ToastRecord }) {
  const [entered, setEntered] = useState(false);
  const reduced = useRef(prefersReducedMotion());

  useEffect(() => {
    // Flip to the entered state after mount so the transition runs from the
    // initial (offset/transparent) style. Reduced motion skips the transition.
    setEntered(true);
  }, []);

  useEffect(() => {
    if (record.duration <= 0) {
      return;
    }
    const timer = setTimeout(() => dismissToast(record.id), record.duration);
    return () => clearTimeout(timer);
  }, [record.id, record.duration]);

  const wrapperStyle: CSSProperties = {
    opacity: entered ? 1 : 0,
    transform: entered ? 'translateY(0)' : 'translateY(0.5rem)',
    transition: reduced.current
      ? undefined
      : `opacity ${tokens.sys.animation.duration.normal} ${tokens.sys.animation.easing.enter}, transform ${tokens.sys.animation.duration.normal} ${tokens.sys.animation.easing.enter}`,
  };

  return (
    <div style={wrapperStyle}>
      <Toast
        variant={record.variant}
        title={record.title}
        onDismiss={() => dismissToast(record.id)}
      >
        {record.message}
      </Toast>
    </div>
  );
}

function viewportStyle(position: ToasterPosition): CSSProperties {
  const [vertical, horizontal] = position.split('-') as [
    'top' | 'bottom',
    'left' | 'center' | 'right',
  ];
  const align =
    horizontal === 'left' ? 'flex-start' : horizontal === 'right' ? 'flex-end' : 'center';
  return {
    position: 'fixed',
    zIndex: toast_.zIndex,
    display: 'flex',
    flexDirection: vertical === 'top' ? 'column' : 'column-reverse',
    alignItems: align,
    gap: toast_.gap,
    padding: tokens.sys.spacing.lg,
    pointerEvents: 'none',
    [vertical]: 0,
    left: horizontal === 'left' || horizontal === 'center' ? 0 : undefined,
    right: horizontal === 'right' || horizontal === 'center' ? 0 : undefined,
  };
}

/**
 * The notification viewport. Mount one {@link Toaster} near the root; it renders
 * (through a portal) every toast enqueued via the imperative {@link toast} API,
 * stacking them at `position` and auto-dismissing each after its duration. Enter
 * motion respects `prefers-reduced-motion`.
 */
export function Toaster({ position = 'bottom-right' }: ToasterProps) {
  const toasts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div style={viewportStyle(position)}>
      {toasts.map((record) => (
        <div key={record.id} style={{ pointerEvents: 'auto' }}>
          <ToasterItem record={record} />
        </div>
      ))}
    </div>,
    document.body,
  );
}

import type { IconName } from '@ghds/icons';
import { useTheme } from '@shopify/restyle';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, Modal as RNModal, View } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';
import { Icon } from './Icon.js';

/** Severity of a toast. */
export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';

/** A live toast tracked by the notification system. */
export interface ToastRecord {
  /** Stable id (used with {@link dismiss}). */
  id: string;
  variant: ToastVariant;
  title?: string;
  description?: string;
  /** Auto-dismiss delay in ms; `0` persists until dismissed. */
  duration: number;
}

/** Options accepted by {@link toast} and its variant helpers. */
export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  /** Auto-dismiss delay in ms; `0` persists. Defaults to 5000. */
  duration?: number;
}

const DEFAULT_DURATION = 5000;

const ICON: Record<ToastVariant, IconName> = {
  info: 'info',
  success: 'check',
  warning: 'warning',
  danger: 'warning',
};

type ColorKey = keyof Theme['colors'];

const STROKE: Record<ToastVariant, ColorKey> = {
  info: 'toastStrokeInfo',
  success: 'toastStrokeSuccess',
  warning: 'toastStrokeWarning',
  danger: 'toastStrokeDanger',
};

// ---------------------------------------------------------------------------
// Module-level store: a tiny emitter that any `Toaster` mounted in the tree
// subscribes to, and the imperative `toast()` API writes to. This decouples
// firing a toast from rendering it — callers never need a ref to the viewport.
// ---------------------------------------------------------------------------

type Listener = (toasts: ToastRecord[]) => void;

let queue: ToastRecord[] = [];
const listeners = new Set<Listener>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();
let counter = 0;

function emit(): void {
  for (const listener of listeners) {
    listener(queue);
  }
}

/** Subscribe to store changes; immediately receives the current toasts. */
export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  listener(queue);
  return () => {
    listeners.delete(listener);
  };
}

/** Remove a toast by id. */
export function dismiss(id: string): void {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  queue = queue.filter((toast) => toast.id !== id);
  emit();
}

/** Remove every toast. */
export function dismissAll(): void {
  for (const timer of timers.values()) {
    clearTimeout(timer);
  }
  timers.clear();
  queue = [];
  emit();
}

function normalize(input: string | ToastOptions): ToastOptions {
  return typeof input === 'string' ? { title: input } : input;
}

function push(options: ToastOptions): string {
  counter += 1;
  const id = `toast-${counter}`;
  const duration = options.duration ?? DEFAULT_DURATION;
  const record: ToastRecord = {
    id,
    variant: options.variant ?? 'info',
    title: options.title,
    description: options.description,
    duration,
  };
  queue = [...queue, record];
  emit();
  if (duration > 0) {
    timers.set(
      id,
      setTimeout(() => dismiss(id), duration),
    );
  }
  return id;
}

interface ToastApi {
  (input: string | ToastOptions): string;
  success: (input: string | ToastOptions) => string;
  error: (input: string | ToastOptions) => string;
  warning: (input: string | ToastOptions) => string;
  info: (input: string | ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

/**
 * Imperative toast API. Call `toast('Saved')` or `toast.success({ title, description })`
 * from anywhere; a mounted {@link Toaster} renders the result. Returns the new
 * toast's id (pass it to `toast.dismiss`). This is the breaking replacement for
 * the old single controlled `<Toast open …>`.
 */
export const toast: ToastApi = Object.assign(
  (input: string | ToastOptions): string => push(normalize(input)),
  {
    success: (input: string | ToastOptions): string =>
      push({ ...normalize(input), variant: 'success' }),
    error: (input: string | ToastOptions): string =>
      push({ ...normalize(input), variant: 'danger' }),
    warning: (input: string | ToastOptions): string =>
      push({ ...normalize(input), variant: 'warning' }),
    info: (input: string | ToastOptions): string => push({ ...normalize(input), variant: 'info' }),
    dismiss,
    dismissAll,
  },
);

/** Props for the per-item {@link Toast} visual. */
export interface ToastProps {
  variant?: ToastVariant;
  title?: string;
  description?: string;
  /** Called when the close button is pressed. */
  onDismiss?: () => void;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * The per-item toast visual: a hand-drawn card with a variant icon, title/body
 * and a close button. It is presentational only — the {@link Toaster} owns the
 * queue, positioning and auto-dismiss. `danger` uses `role="alert"`; the rest
 * `role="status"`. Token-driven (`comp.toast.*`).
 */
export function Toast({ variant = 'info', title, description, onDismiss, testID }: ToastProps) {
  const theme = useTheme<Theme>();
  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.toastSketch.roughness,
    bowing: theme.toastSketch.bowing,
  });
  const strokeHex = theme.colors[STROKE[variant]];

  return (
    <Box
      onLayout={onLayout}
      flexDirection="row"
      alignItems="flex-start"
      padding="md"
      backgroundColor="toastBg"
      role={variant === 'danger' ? 'alert' : 'status'}
      accessibilityLiveRegion={variant === 'danger' ? 'assertive' : 'polite'}
      testID={testID}
      style={{ gap: theme.spacing.sm, maxWidth: 384, width: '100%' }}
    >
      <SketchBackground
        drawable={drawable}
        size={size}
        strokeColor={strokeHex}
        strokeWidth={theme.borderWidths.default}
      />
      <Icon name={ICON[variant]} size="sm" color={strokeHex} />
      <Box flex={1}>
        {title !== undefined && (
          <Text variant="label" color="toastTextTitle">
            {title}
          </Text>
        )}
        {description !== undefined && (
          <Text variant="body" color="toastTextBody">
            {description}
          </Text>
        )}
      </Box>
      {onDismiss && (
        <Pressable onPress={onDismiss} accessibilityRole="button" accessibilityLabel="Dismiss">
          <Icon name="close" size="sm" color={theme.colors.toastTextBody} />
        </Pressable>
      )}
    </Box>
  );
}

/** Props for {@link Toaster}. */
export interface ToasterProps {
  /** Edge to anchor the stack to. Defaults to `'bottom'`. */
  position?: 'top' | 'bottom';
  /** Maximum toasts shown at once (older ones wait in the queue). Defaults to 3. */
  max?: number;
  /** Test handle for queries. */
  testID?: string;
}

/** One animated entry in the {@link Toaster} stack. */
function ToasterItem({ record }: { record: ToastRecord }) {
  const theme = useTheme<Theme>();
  const opacity = useRef(new Animated.Value(0)).current;
  const duration = theme.animationDuration.fast;

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) {
        return;
      }
      if (reduce) {
        opacity.setValue(1);
        return;
      }
      Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true }).start();
    });
    return () => {
      cancelled = true;
    };
  }, [opacity, duration]);

  return (
    <Animated.View style={{ opacity, width: '100%', alignItems: 'center' }}>
      <Toast
        variant={record.variant}
        title={record.title}
        description={record.description}
        onDismiss={() => dismiss(record.id)}
        testID={`toast-${record.id}`}
      />
    </Animated.View>
  );
}

/**
 * The toast viewport. Mount one `Toaster` near the root of the app; it
 * subscribes to the module-level store and renders the active toasts in a
 * stacked overlay (a transparent `Modal` so touches pass through to the app).
 * Entrance is faded unless the OS "reduce motion" setting is on. Also exported
 * as `ToastProvider`.
 */
export function Toaster({ position = 'bottom', max = 3, testID }: ToasterProps) {
  const theme = useTheme<Theme>();
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  useEffect(() => subscribeToasts(setToasts), []);

  // Keep the most recent `max`; older ones stay queued until room frees up.
  const visible = toasts.slice(-max);

  return (
    <RNModal visible={toasts.length > 0} transparent animationType="fade">
      <View
        pointerEvents="box-none"
        style={{
          flex: 1,
          justifyContent: position === 'top' ? 'flex-start' : 'flex-end',
          alignItems: 'center',
          padding: theme.spacing.md,
          gap: theme.spacing.sm,
        }}
        testID={testID}
      >
        {visible.map((record) => (
          <ToasterItem key={record.id} record={record} />
        ))}
      </View>
    </RNModal>
  );
}

/** Alias for {@link Toaster} — the provider you mount once in the tree. */
export const ToastProvider = Toaster;

import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { GhToastVariant } from './toast.js';
import './toast.js';

/** Where a `gh-toaster` anchors its stack. */
export type GhToasterPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/** Options accepted when raising a toast. */
export interface ToastOptions {
  /** Bold title line. */
  heading?: string;
  /** Body text. */
  message?: string;
  /** Severity / colour role. */
  variant?: GhToastVariant;
  /** Auto-dismiss after this many ms; `0` to persist. Defaults to 5000. */
  duration?: number;
  /** Provide to control/replace an existing toast id. */
  id?: string;
}

/** A live toast record held by a `gh-toaster`. */
export interface ToastRecord extends ToastOptions {
  id: string;
}

const DEFAULT_DURATION = 5000;
let toastSeq = 0;

/** The most recently connected toaster — the default target for `toast()`. */
let activeToaster: GhToaster | undefined;

/**
 * `<gh-toaster>` — the fixed viewport region that stacks `<gh-toast>` items.
 *
 * Add toasts imperatively with {@link show} (or the exported {@link toast}
 * helper) and remove them with {@link dismiss}. Auto-dismiss timing is owned
 * here (each `gh-toast` is rendered with `duration=0`). The `position`
 * attribute anchors the stack; enter animation is skipped under
 * `prefers-reduced-motion`. Token-driven (`comp.toast.*`).
 */
@customElement('gh-toaster')
export class GhToaster extends LitElement {
  static override styles = css`
    :host {
      position: fixed;
      z-index: var(--comp-toast-zIndex);
      display: flex;
      flex-direction: column;
      gap: var(--sys-spacing-sm);
      box-sizing: border-box;
      max-width: 100vw;
      padding: var(--sys-spacing-lg);
      pointer-events: none;
    }

    :host([position='top-left']) {
      inset: 0 auto auto 0;
      align-items: flex-start;
    }
    :host([position='top-center']) {
      inset: 0 0 auto 0;
      align-items: center;
    }
    :host([position='top-right']) {
      inset: 0 0 auto auto;
      align-items: flex-end;
    }
    :host([position='bottom-left']) {
      inset: auto auto 0 0;
      align-items: flex-start;
      flex-direction: column-reverse;
    }
    :host([position='bottom-center']) {
      inset: auto 0 0 0;
      align-items: center;
      flex-direction: column-reverse;
    }
    :host([position='bottom-right']) {
      inset: auto 0 0 auto;
      align-items: flex-end;
      flex-direction: column-reverse;
    }

    .item {
      pointer-events: auto;
      animation: gh-toast-in var(--sys-animation-duration-fast) var(--sys-animation-easing-standard);
    }

    @keyframes gh-toast-in {
      from {
        opacity: 0;
        transform: translateY(var(--sys-spacing-sm));
      }
      to {
        opacity: 1;
        transform: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .item {
        animation: none;
      }
    }
  `;

  /** Stack anchor position. */
  @property({ type: String, reflect: true }) position: GhToasterPosition = 'bottom-right';

  @state() private toasts: ToastRecord[] = [];

  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly internals: ElementInternals = this.attachInternals();

  override connectedCallback(): void {
    super.connectedCallback();
    this.internals.role = 'region';
    this.internals.ariaLabel = 'Notifications';
    activeToaster = this;
  }

  override disconnectedCallback(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    if (activeToaster === this) {
      activeToaster = undefined;
    }
    super.disconnectedCallback();
  }

  /** Raise a toast; returns its id. Reusing an id replaces that toast. */
  show(options: ToastOptions): string {
    const id = options.id ?? `gh-toast-${++toastSeq}`;
    const record: ToastRecord = { duration: DEFAULT_DURATION, variant: 'info', ...options, id };
    const existing = this.timers.get(id);
    if (existing) {
      clearTimeout(existing);
      this.timers.delete(id);
    }
    this.toasts = [...this.toasts.filter((t) => t.id !== id), record];
    const duration = record.duration ?? DEFAULT_DURATION;
    if (duration > 0) {
      this.timers.set(
        id,
        setTimeout(() => this.dismiss(id), duration),
      );
    }
    return id;
  }

  /** Remove a toast by id. */
  dismiss(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    if (this.toasts.some((t) => t.id === id)) {
      this.toasts = this.toasts.filter((t) => t.id !== id);
      this.dispatchEvent(new CustomEvent('dismiss', { detail: id, bubbles: true, composed: true }));
    }
  }

  /** Remove all toasts. */
  clear(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.toasts = [];
  }

  protected override render(): unknown {
    return html`${this.toasts.map(
      (t) => html`<div class="item">
        <gh-toast
          .open=${true}
          .variant=${t.variant ?? 'info'}
          .heading=${t.heading ?? ''}
          .duration=${0}
          @close=${() => this.dismiss(t.id)}
          >${t.message ?? ''}</gh-toast
        >
      </div>`,
    )}`;
  }
}

/** Resolve (or lazily create) the active toaster. */
function ensureToaster(): GhToaster {
  if (activeToaster?.isConnected) {
    return activeToaster;
  }
  const toaster = document.createElement('gh-toaster') as GhToaster;
  document.body.appendChild(toaster);
  return toaster;
}

/** The imperative toast API bound to the active `gh-toaster`. */
export interface ToastApi {
  (options: ToastOptions): string;
  info(message: string, options?: Omit<ToastOptions, 'variant' | 'message'>): string;
  success(message: string, options?: Omit<ToastOptions, 'variant' | 'message'>): string;
  warning(message: string, options?: Omit<ToastOptions, 'variant' | 'message'>): string;
  danger(message: string, options?: Omit<ToastOptions, 'variant' | 'message'>): string;
  dismiss(id: string): void;
  clear(): void;
}

const base = (options: ToastOptions): string => ensureToaster().show(options);
const withVariant =
  (variant: GhToastVariant) =>
  (message: string, options: Omit<ToastOptions, 'variant' | 'message'> = {}): string =>
    ensureToaster().show({ ...options, message, variant });

/**
 * Imperative toast controller. `toast(opts)` (or `toast.success('Saved')`)
 * appends to the active `<gh-toaster>`, creating one on `document.body` if none
 * is mounted. Returns the toast id; dismiss with `toast.dismiss(id)`.
 */
export const toast: ToastApi = Object.assign(base, {
  info: withVariant('info'),
  success: withVariant('success'),
  warning: withVariant('warning'),
  danger: withVariant('danger'),
  dismiss: (id: string): void => activeToaster?.dismiss(id),
  clear: (): void => activeToaster?.clear(),
});

/** Bind an imperative controller to a specific toaster instance. */
export class ToastController {
  constructor(private readonly toaster: GhToaster) {}
  show(options: ToastOptions): string {
    return this.toaster.show(options);
  }
  dismiss(id: string): void {
    this.toaster.dismiss(id);
  }
  clear(): void {
    this.toaster.clear();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-toaster': GhToaster;
  }
}

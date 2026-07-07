import type { IconName } from '@ghds/icons';
import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';
import './icon.js';

/** Severity of a `<gh-toast>`. */
export type GhToastVariant = 'info' | 'success' | 'warning' | 'danger';

const ICON: Record<GhToastVariant, IconName> = {
  info: 'info',
  success: 'check',
  warning: 'warning',
  danger: 'warning',
};

/** Auto-dismiss timeout (behavioural timing, not a motion token). */
const DEFAULT_DURATION = 5000;

/**
 * `<gh-toast>` — a hand-drawn toast notification. A sketchy, elevated box
 * fixed to the bottom-right that auto-dismisses after `duration`. `danger`
 * exposes `role="alert"`; the rest `role="status"`. Reflects `open` and
 * dispatches a `close` event on auto-dismiss / close button. Token-driven
 * (`comp.toast.*`).
 */
@customElement('gh-toast')
export class GhToast extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        --_toast-stroke: var(--comp-toast-stroke-info);
        --_toast-icon: var(--comp-toast-icon-info);
        color: var(--_toast-stroke);
      }
      :host([variant='success']) {
        --_toast-stroke: var(--comp-toast-stroke-success);
        --_toast-icon: var(--comp-toast-icon-success);
      }
      :host([variant='warning']) {
        --_toast-stroke: var(--comp-toast-stroke-warning);
        --_toast-icon: var(--comp-toast-icon-warning);
      }
      :host([variant='danger']) {
        --_toast-stroke: var(--comp-toast-stroke-danger);
        --_toast-icon: var(--comp-toast-icon-danger);
      }
      :host {
        display: none;
      }
      :host([open]) {
        display: block;
      }
      .toast {
        position: fixed;
        right: var(--sys-spacing-lg);
        bottom: var(--sys-spacing-lg);
        z-index: var(--comp-toast-zIndex);
        display: flex;
        align-items: flex-start;
        gap: var(--comp-toast-gap);
        box-sizing: border-box;
        max-width: 24rem;
        padding: var(--comp-toast-padding);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        line-height: var(--sys-typography-body-lineHeight);
      }
      .icon {
        position: relative;
        display: inline-flex;
        color: var(--_toast-icon);
      }
      .content {
        position: relative;
        flex: 1;
        min-width: 0;
        color: var(--comp-toast-text-body);
      }
      .title {
        color: var(--comp-toast-text-title);
        font-weight: var(--sys-typography-label-fontWeight);
      }
      .close {
        position: relative;
        display: inline-flex;
        padding: 0;
        border: none;
        background: transparent;
        color: var(--comp-toast-text-body);
        cursor: pointer;
      }
      .sketch-fill {
        fill: var(--comp-toast-bg);
        stroke: none;
      }
    `,
  ];

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: String, reflect: true }) variant: GhToastVariant = 'info';
  @property({ type: String }) heading = '';
  /** Auto-dismiss after this many ms; `0` to persist. */
  @property({ type: Number }) duration = DEFAULT_DURATION;

  @query('.toast') private toastEl?: HTMLElement;

  private readonly internals: ElementInternals = this.attachInternals();
  private timer: ReturnType<typeof setTimeout> | null = null;

  // Measure the fixed-positioned panel, not the (zero-height) host.
  protected override get frame(): HTMLElement {
    return this.toastEl ?? this;
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  override disconnectedCallback(): void {
    this.clearTimer();
    super.disconnectedCallback();
  }

  private requestClose(): void {
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('variant')) {
      this.internals.role = this.variant === 'danger' ? 'alert' : 'status';
    }
    if (changed.has('open') || changed.has('duration')) {
      // Re-arm on either `open` or `duration` changing, so setting duration=0 on
      // an already-open toast cancels the pending auto-dismiss (matching React/RN).
      this.clearTimer();
      if (this.open) {
        if (changed.has('open')) {
          this.measure();
        }
        if (this.duration > 0) {
          this.timer = setTimeout(() => this.requestClose(), this.duration);
        }
      }
    }
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.toast.sketch.roughness,
      bowing: tokens.comp.toast.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override render(): unknown {
    return html`<div class="toast" part="toast">
      ${this.renderSketch()}
      <span class="icon"><gh-icon name=${ICON[this.variant]} size="sm"></gh-icon></span>
      <div class="content">
        ${this.heading ? html`<div class="title">${this.heading}</div>` : nothing}
        <div><slot></slot></div>
      </div>
      <button class="close" aria-label="Dismiss" @click=${() => this.requestClose()}>
        <gh-icon name="close" size="sm"></gh-icon>
      </button>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-toast': GhToast;
  }
}

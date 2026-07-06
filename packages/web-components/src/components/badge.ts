import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

/** Semantic colour role of a `<gh-badge>`. */
export type GhBadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

/**
 * `<gh-badge>` — a small hand-drawn status/label pill.
 *
 * Draws a sketchy rectangle outline (`@ghds/sketch-core`) over a token-driven
 * solid background. The outline stroke uses `currentColor`, set per `variant`
 * to the badge's stroke token; the label text and background come from the
 * matching `comp.badge.*` tokens. Presentational by default — pass `label` to
 * expose it as an ARIA `status` region for live values.
 */
@customElement('gh-badge')
export class GhBadge extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: inline-flex;
        /* Per-variant palette, defaulting to neutral; overridden below. */
        --_badge-bg: var(--comp-badge-bg-neutral);
        --_badge-text: var(--comp-badge-text-neutral);
        --_badge-stroke: var(--comp-badge-stroke-neutral);
      }

      :host([variant='primary']) {
        --_badge-bg: var(--comp-badge-bg-primary);
        --_badge-text: var(--comp-badge-text-primary);
        --_badge-stroke: var(--comp-badge-stroke-primary);
      }

      :host([variant='success']) {
        --_badge-bg: var(--comp-badge-bg-success);
        --_badge-text: var(--comp-badge-text-success);
        --_badge-stroke: var(--comp-badge-stroke-success);
      }

      :host([variant='warning']) {
        --_badge-bg: var(--comp-badge-bg-warning);
        --_badge-text: var(--comp-badge-text-warning);
        --_badge-stroke: var(--comp-badge-stroke-warning);
      }

      :host([variant='danger']) {
        --_badge-bg: var(--comp-badge-bg-danger);
        --_badge-text: var(--comp-badge-text-danger);
        --_badge-stroke: var(--comp-badge-stroke-danger);
      }

      :host([variant='info']) {
        --_badge-bg: var(--comp-badge-bg-info);
        --_badge-text: var(--comp-badge-text-info);
        --_badge-stroke: var(--comp-badge-stroke-info);
      }

      .badge {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: var(--comp-badge-gap);
        box-sizing: border-box;
        padding: var(--comp-badge-padding-vertical) var(--comp-badge-padding-horizontal);
        background: var(--_badge-bg);
        border-radius: var(--comp-badge-radius);
        /* Drives the sketch stroke (currentColor). */
        color: var(--_badge-stroke);
        white-space: nowrap;
      }

      .label {
        position: relative;
        color: var(--_badge-text);
        font-family: var(--sys-typography-caption-fontFamily);
        font-size: var(--sys-typography-caption-fontSize);
        font-weight: var(--sys-typography-label-fontWeight);
        line-height: var(--sys-typography-caption-lineHeight);
      }
    `,
  ];

  /** Visual/semantic colour role. */
  @property({ type: String, reflect: true }) variant: GhBadgeVariant = 'neutral';

  /** When set, exposes the badge as an ARIA `status` region with this label. */
  @property({ type: String }) label = '';

  private readonly internals: ElementInternals = this.attachInternals();

  protected override updated(): void {
    if (this.label) {
      this.internals.role = 'status';
      this.internals.ariaLabel = this.label;
    } else {
      this.internals.role = null;
      this.internals.ariaLabel = null;
    }
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.badge.sketch.roughness,
      bowing: tokens.comp.badge.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override render(): unknown {
    return html`<span class="badge" part="badge">
      ${this.renderSketch()}
      <span class="label"><slot></slot></span>
    </span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-badge': GhBadge;
  }
}

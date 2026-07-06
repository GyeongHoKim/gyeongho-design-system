import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { ellipse } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

/** Rendered diameter of a `<gh-spinner>`. */
export type GhSpinnerSize = 'sm' | 'md' | 'lg';

/**
 * `<gh-spinner>` — a hand-drawn loading spinner.
 *
 * A sketchy ellipse ring (`@ghds/sketch-core`) that rotates; the wobble of the
 * hand-drawn outline makes the spin legible. Colour, size and the spin duration
 * are token-driven (`comp.spinner.*`). Rotation is suppressed under
 * `prefers-reduced-motion: reduce`. Exposed as `role="status"` with a label.
 */
@customElement('gh-spinner')
export class GhSpinner extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: inline-block;
        --_spinner-size: var(--comp-spinner-size-md);
        width: var(--_spinner-size);
        height: var(--_spinner-size);
        /* Drives the sketch stroke (currentColor). */
        color: var(--comp-spinner-indicator);
      }

      :host([size='sm']) {
        --_spinner-size: var(--comp-spinner-size-sm);
      }

      :host([size='lg']) {
        --_spinner-size: var(--comp-spinner-size-lg);
      }

      .spinner {
        position: relative;
        width: 100%;
        height: 100%;
        animation: gh-spin var(--comp-spinner-duration) linear infinite;
      }

      @keyframes gh-spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .spinner {
          animation: none;
        }
      }
    `,
  ];

  /** Rendered diameter. */
  @property({ type: String, reflect: true }) size: GhSpinnerSize = 'md';
  /** Accessible label for the busy state. */
  @property({ type: String }) label = 'Loading';

  private readonly internals: ElementInternals = this.attachInternals();

  override connectedCallback(): void {
    super.connectedCallback();
    this.internals.role = 'status';
  }

  protected override updated(): void {
    this.internals.ariaLabel = this.label;
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return ellipse(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.spinner.sketch.roughness,
      bowing: tokens.comp.spinner.sketch.bowing,
    };
  }

  protected override render(): unknown {
    return html`<span class="spinner" part="spinner">${this.renderSketch()}</span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-spinner': GhSpinner;
  }
}

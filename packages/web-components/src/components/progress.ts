import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing, svg } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

const INSET = Number.parseFloat(tokens.sys.border.width.default);
/** Width fraction of the sweeping segment while indeterminate. */
const INDETERMINATE_FRACTION = 0.4;

/**
 * `<gh-progress>` — a hand-drawn progress bar.
 *
 * The rail and fill are sketchy rectangles (`@ghds/sketch-core`); colours,
 * height and sketch parameters are token-driven (`comp.progress.*`). Set `value`
 * for a determinate bar or leave it unset for an indeterminate sweep
 * (suppressed under `prefers-reduced-motion: reduce`). Exposed as
 * `role="progressbar"` with the appropriate `aria-value*`.
 */
@customElement('gh-progress')
export class GhProgress extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: block;
        width: 100%;
      }

      .track {
        position: relative;
        box-sizing: border-box;
        width: 100%;
        height: var(--comp-progress-track-height);
        border-radius: var(--comp-progress-radius);
        overflow: hidden;
      }

      .fill {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        border-radius: var(--comp-progress-radius);
        overflow: hidden;
      }

      .fill.indeterminate {
        width: 40%;
        animation: gh-progress-sweep calc(var(--comp-progress-duration) * 3) ease-in-out infinite;
      }

      @keyframes gh-progress-sweep {
        from {
          transform: translateX(-100%);
        }
        to {
          transform: translateX(250%);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .fill.indeterminate {
          animation: none;
        }
      }

      svg {
        position: absolute;
        inset: 0;
        overflow: visible;
        pointer-events: none;
      }

      .rail-fill {
        fill: var(--comp-progress-bg-rail);
      }

      .rail-stroke {
        fill: none;
        stroke: var(--comp-progress-stroke-rail);
        stroke-width: var(--sys-border-width-default);
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .bar-fill {
        fill: var(--comp-progress-bg-fill);
      }

      .bar-stroke {
        fill: none;
        stroke: var(--comp-progress-stroke-fill);
        stroke-width: var(--sys-border-width-default);
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    `,
  ];

  /** Current value. Leave unset for an indeterminate bar. */
  @property({ type: Number }) value?: number;
  /** Maximum value. */
  @property({ type: Number }) max = 100;
  /** Accessible label describing what is progressing. */
  @property({ type: String }) label = '';

  private get indeterminate(): boolean {
    return this.value === undefined || this.value === null || Number.isNaN(this.value);
  }

  private get fraction(): number {
    if (this.indeterminate) {
      return INDETERMINATE_FRACTION;
    }
    return Math.min(1, Math.max(0, (this.value ?? 0) / this.max));
  }

  protected override updated(): void {
    this.setAttribute('role', 'progressbar');
    if (this.label) {
      this.setAttribute('aria-label', this.label);
    } else {
      this.removeAttribute('aria-label');
    }
    if (this.indeterminate) {
      this.removeAttribute('aria-valuenow');
      this.removeAttribute('aria-valuemin');
      this.removeAttribute('aria-valuemax');
    } else {
      this.setAttribute('aria-valuemin', '0');
      this.setAttribute('aria-valuemax', String(this.max));
      this.setAttribute('aria-valuenow', String(this.value));
    }
  }

  // Required by SketchyBase; unused because `render()` draws two layers directly.
  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.progress.sketch.roughness,
      bowing: tokens.comp.progress.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  private renderLayer(width: number, height: number, fillClass: string, strokeClass: string) {
    if (width <= 0 || height <= 0) {
      return nothing;
    }
    const drawable = rectangle(
      INSET,
      INSET,
      Math.max(1, width - INSET * 2),
      Math.max(1, height - INSET * 2),
      { ...this.sketchParams(), seed: this.effectiveSeed },
    );
    return html`<svg
      width=${width}
      height=${height}
      viewBox="0 0 ${width} ${height}"
      aria-hidden="true"
      focusable="false"
    >
      ${drawable.fillPaths.map((d) => svg`<path class=${fillClass} d=${d} fill-rule="evenodd"></path>`)}
      ${drawable.strokePaths.map((d) => svg`<path class=${strokeClass} d=${d}></path>`)}
    </svg>`;
  }

  protected override render(): unknown {
    const width = this.sketchWidth;
    const height = this.sketchHeight;
    const fillWidth = width * this.fraction;
    return html`<div class="track" part="track">
      ${this.renderLayer(width, height, 'rail-fill', 'rail-stroke')}
      <div
        class=${this.indeterminate ? 'fill indeterminate' : 'fill'}
        style=${this.indeterminate ? nothing : `width: ${this.fraction * 100}%`}
      >
        ${this.renderLayer(fillWidth, height, 'bar-fill', 'bar-stroke')}
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-progress': GhProgress;
  }
}

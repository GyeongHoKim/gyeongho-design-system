import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { line } from '@ghds/sketch-core';
import { css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { SketchyBase } from '../sketchy-base.js';

export type GhSeparatorOrientation = 'horizontal' | 'vertical';

/**
 * `<gh-separator>` — a hand-drawn divider.
 *
 * Draws a single sketchy line (`@ghds/sketch-core`) across the measured box,
 * horizontally or vertically. Exposes `role="separator"` with the matching
 * `aria-orientation`; set `decorative` to remove it from the accessibility tree.
 * Colour and thickness come from `@ghds/tokens` (`comp.separator.*`).
 */
@customElement('gh-separator')
export class GhSeparator extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: block;
        position: relative;
        color: var(--comp-separator-color);
      }

      :host([orientation='horizontal']) {
        width: 100%;
        height: var(--sys-spacing-sm);
      }

      :host([orientation='vertical']) {
        width: var(--sys-spacing-sm);
        height: 100%;
        align-self: stretch;
      }

      .sketch-stroke {
        stroke-width: var(--comp-separator-thickness);
      }
    `,
  ];

  /** Line direction. */
  @property({ type: String, reflect: true }) orientation: GhSeparatorOrientation = 'horizontal';
  /** When true the separator is purely visual and hidden from assistive tech. */
  @property({ type: Boolean, reflect: true }) decorative = false;

  private readonly internals: ElementInternals = this.attachInternals();

  protected override updated(): void {
    if (this.decorative) {
      this.internals.role = 'none';
      this.internals.ariaOrientation = null;
    } else {
      this.internals.role = 'separator';
      this.internals.ariaOrientation = this.orientation;
    }
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return this.orientation === 'vertical'
      ? line(width / 2, 0, width / 2, height, options)
      : line(0, height / 2, width, height / 2, options);
  }

  protected override render(): unknown {
    return this.renderSketch();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-separator': GhSeparator;
  }
}

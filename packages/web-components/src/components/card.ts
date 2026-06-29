import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

/**
 * `<gh-card>` — a hand-drawn surface container.
 *
 * Draws a sketchy rectangle outline around slotted content. When `elevated`,
 * the sketch engine emits an offset "drop shadow" outline (`shadowPaths`) using
 * the `sys.sketch.elevation` token to fake depth. Background, padding, radius
 * and text colour are all token-driven.
 */
@customElement('gh-card')
export class GhCard extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: block;
        color: var(--sys-color-border-default);
      }

      .content {
        position: relative;
        box-sizing: border-box;
        padding: var(--sys-spacing-lg);
        background: var(--sys-color-bg-surface);
        border-radius: var(--sys-radius-md);
        color: var(--sys-color-text-primary);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        font-weight: var(--sys-typography-body-fontWeight);
        line-height: var(--sys-typography-body-lineHeight);
      }

      .body {
        position: relative;
      }

      ::slotted(h1),
      ::slotted(h2),
      ::slotted(h3),
      ::slotted([slot='title']) {
        margin: 0 0 var(--sys-spacing-sm);
        font-family: var(--sys-typography-title-fontFamily);
        font-size: var(--sys-typography-title-fontSize);
        font-weight: var(--sys-typography-title-fontWeight);
        line-height: var(--sys-typography-title-lineHeight);
        color: var(--sys-color-text-primary);
      }
    `,
  ];

  /** When true, render a sketch drop-shadow to suggest elevation. */
  @property({ type: Boolean, reflect: true }) elevated = false;

  /** Optional accessible label; when set the card exposes a labelled group. */
  @property({ type: String }) label = '';

  private readonly internals: ElementInternals = this.attachInternals();

  protected override updated(): void {
    if (this.label) {
      this.internals.role = 'group';
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
    const base: SketchParams = {
      roughness: tokens.sys.sketch.roughness,
      bowing: tokens.sys.sketch.bowing,
    };
    return this.elevated ? { ...base, elevation: tokens.sys.sketch.elevation } : base;
  }

  protected override render(): unknown {
    return html`<div class="content" part="content">
      ${this.renderSketch()}
      <div class="body">
        <slot></slot>
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-card': GhCard;
  }
}

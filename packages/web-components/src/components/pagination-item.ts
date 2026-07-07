import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

/**
 * `<gh-pagination-item>` — one sketchy page button inside `<gh-pagination>`.
 * Internal: not meant to be used standalone. Its `click` bubbles (composed) so
 * the parent can handle activation; a disabled item emits none.
 */
@customElement('gh-pagination-item')
export class GhPaginationItem extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: inline-block;
        --_pi-bg: var(--comp-pagination-item-bg-default);
        --_pi-stroke: var(--comp-pagination-item-stroke-default);
        --_pi-text: var(--comp-pagination-item-text-default);
        color: var(--_pi-stroke);
      }

      :host([selected]) {
        --_pi-bg: var(--comp-pagination-item-bg-selected);
        --_pi-stroke: var(--comp-pagination-item-stroke-selected);
        --_pi-text: var(--comp-pagination-item-text-selected);
      }

      :host([disabled]) {
        --_pi-bg: var(--comp-pagination-item-bg-disabled);
        --_pi-stroke: var(--comp-pagination-item-stroke-disabled);
        --_pi-text: var(--comp-pagination-item-text-disabled);
      }

      button {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        min-width: var(--comp-pagination-size);
        height: var(--comp-pagination-size);
        margin: 0;
        padding: 0 var(--sys-spacing-xs);
        border: none;
        background: transparent;
        color: var(--_pi-text);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        cursor: pointer;
      }

      button:disabled {
        cursor: not-allowed;
      }

      button:focus-visible {
        outline: var(--sys-border-width-thick) solid var(--sys-color-border-focus);
        outline-offset: var(--sys-spacing-xs);
      }

      .content {
        position: relative;
        display: inline-flex;
        align-items: center;
      }

      /* Solid region fill (overrides the base's line-stroked fill). */
      .sketch-fill {
        fill: var(--_pi-bg);
        stroke: none;
      }
    `,
  ];

  /** Marks the item as the current page (filled + aria-current). */
  @property({ type: Boolean, reflect: true }) selected = false;
  /** Disables the control (used for Prev/Next at the ends). */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Accessible label (e.g. "Page 3", "Previous page"). */
  @property({ type: String }) label = '';

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.pagination.sketch.roughness,
      bowing: tokens.comp.pagination.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override render(): unknown {
    return html`<button
      part="button"
      type="button"
      aria-label=${this.label}
      aria-current=${this.selected ? 'page' : nothing}
      ?disabled=${this.disabled}
    >
      ${this.renderSketch()}
      <span class="content"><slot></slot></span>
    </button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-pagination-item': GhPaginationItem;
  }
}

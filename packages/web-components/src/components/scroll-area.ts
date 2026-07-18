import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

/** Which axis (or axes) a `<gh-scroll-area>` scrolls. */
export type GhScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';

/**
 * `<gh-scroll-area>` — a bounded, hand-drawn scroll viewport.
 *
 * Draws a sketchy rectangle border (`@ghds/sketch-core`) around a scrollable
 * region whose native scrollbar is themed from `comp.scrollArea.*` tokens via
 * the standard `scrollbar-color` / `scrollbar-width` properties plus a
 * `::-webkit-scrollbar` fallback. Constrain the scroll region by setting
 * `max-height` (or `max-width`) on the host.
 */
@customElement('gh-scroll-area')
export class GhScrollArea extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: block;
        color: var(--comp-scrollArea-thumb-default);
      }

      .area {
        position: relative;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        height: 100%;
        max-height: inherit;
        padding: var(--sys-spacing-sm);
      }

      .viewport {
        position: relative;
        flex: 1;
        min-height: 0;
        /* Standard scrollbar theming (Firefox + Chromium 121+). */
        scrollbar-width: thin;
        scrollbar-color: var(--comp-scrollArea-thumb-default) var(--comp-scrollArea-track-default);
      }

      :host([orientation='vertical']) .viewport {
        overflow-x: hidden;
        overflow-y: auto;
      }

      :host([orientation='horizontal']) .viewport {
        overflow-x: auto;
        overflow-y: hidden;
      }

      :host([orientation='both']) .viewport {
        overflow-x: auto;
        overflow-y: auto;
      }

      /* WebKit/Blink fallback for browsers without standard scrollbar props. */
      .viewport::-webkit-scrollbar {
        width: var(--comp-scrollArea-size);
        height: var(--comp-scrollArea-size);
      }

      .viewport::-webkit-scrollbar-track {
        background: var(--comp-scrollArea-track-default);
      }

      .viewport::-webkit-scrollbar-thumb {
        background: var(--comp-scrollArea-thumb-default);
        border-radius: var(--comp-scrollArea-radius);
      }

      .viewport::-webkit-scrollbar-thumb:hover {
        background: var(--comp-scrollArea-thumb-hover);
      }
    `,
  ];

  /** Scroll axis. Defaults to `'vertical'`. */
  @property({ type: String, reflect: true }) orientation: GhScrollAreaOrientation = 'vertical';

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.scrollArea.sketch.roughness,
      bowing: tokens.comp.scrollArea.sketch.bowing,
    };
  }

  protected override render(): unknown {
    return html`<div class="area" part="area">
      ${this.renderSketch()}
      <div class="viewport" part="viewport">
        <slot></slot>
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-scroll-area': GhScrollArea;
  }
}

import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

/** Highlight tone of a `<gh-marker>`. */
export type GhMarkerVariant = 'default' | 'success' | 'info' | 'danger';

/**
 * `<gh-marker>` — a hand-drawn highlighter.
 *
 * Wraps inline slotted text in a semantic `<mark>` and paints a sketchy hachure
 * scribble (`@ghds/sketch-core`) behind it — a fill with no hard box — so the
 * words stay readable through the highlight. The highlight colour comes from
 * `comp.marker.color.<variant>`; the text colour is inherited, never set.
 */
@customElement('gh-marker')
export class GhMarker extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: inline;
        position: relative;
        /* A little horizontal breathing room so the scribble overshoots the glyphs. */
        padding: 0 var(--sys-spacing-xs);
        /* Paints the hachure fill lines; text colour stays inherited. */
        --ghds-sketch-fill-color: var(--comp-marker-color-default);
      }

      :host([variant='success']) {
        --ghds-sketch-fill-color: var(--comp-marker-color-success);
      }

      :host([variant='info']) {
        --ghds-sketch-fill-color: var(--comp-marker-color-info);
      }

      :host([variant='danger']) {
        --ghds-sketch-fill-color: var(--comp-marker-color-danger);
      }

      /* Highlighter strokes read thicker than a regular fill. */
      .sketch-fill {
        stroke-width: var(--sys-border-width-thick);
      }

      mark {
        position: relative;
        background: transparent;
        color: inherit;
      }
    `,
  ];

  /** Highlight colour. Defaults to `'default'` (a warm highlighter yellow). */
  @property({ type: String, reflect: true }) variant: GhMarkerVariant = 'default';

  /** A hachure-filled rectangle with the outline box stripped — fill only. */
  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    const drawable = rectangle(0, 0, width, height, options);
    return { ...drawable, strokePaths: [] };
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.marker.sketch.roughness,
      bowing: tokens.comp.marker.sketch.bowing,
      fillStyle: 'hachure',
      hachureGap: tokens.sys.sketch.hachureGap,
      hachureAngle: tokens.sys.sketch.hachureAngle,
    };
  }

  protected override render(): unknown {
    return html`${this.renderSketch()}<mark part="mark"><slot></slot></mark>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-marker': GhMarker;
  }
}

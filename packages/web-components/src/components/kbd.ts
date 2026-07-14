import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

/**
 * `<gh-kbd>` — a hand-drawn keyboard key.
 *
 * Wraps slotted key text in a small sketchy, solid-filled box
 * (`@ghds/sketch-core`). Rendered as an inline `<kbd>` element. Colours, padding
 * and sketch parameters come from `@ghds/tokens` (`comp.kbd.*`).
 */
@customElement('gh-kbd')
export class GhKbd extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: inline-flex;
        color: var(--comp-kbd-stroke);
        vertical-align: middle;
      }

      kbd {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        min-width: 1.5em;
        padding: var(--comp-kbd-padding-vertical) var(--comp-kbd-padding-horizontal);
        color: var(--comp-kbd-text);
        font-family: var(--sys-typography-caption-fontFamily);
        font-size: var(--sys-typography-caption-fontSize);
        line-height: var(--sys-typography-caption-lineHeight);
      }

      .label {
        position: relative;
      }

      .sketch-fill {
        fill: var(--comp-kbd-bg);
        stroke: none;
      }
    `,
  ];

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.kbd.sketch.roughness,
      bowing: tokens.comp.kbd.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override render(): unknown {
    return html`<kbd part="key">
      ${this.renderSketch()}
      <span class="label"><slot></slot></span>
    </kbd>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-kbd': GhKbd;
  }
}

import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

/**
 * `<gh-input-group>` — a hand-drawn field that wraps addons (icons, text,
 * buttons) and a bare `<input>` / `<gh-*>` control inside a single sketchy box.
 *
 * The box is a sketchy rectangle outline from `@ghds/sketch-core` drawn over a
 * token-driven solid background. The outline stroke uses `currentColor`: the
 * host resolves it to `comp.inputGroup.stroke.default`, switches to the focus
 * colour on `:focus-within`, and to the danger colour when `invalid`. When
 * `disabled` the surface mutes to the disabled background. Every colour,
 * padding, radius and sketch parameter comes from `comp.inputGroup.*` tokens.
 */
@customElement('gh-input-group')
export class GhInputGroup extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: block;
        /* Drives the sketch stroke (currentColor). */
        color: var(--comp-inputGroup-stroke-default);
      }

      :host(:focus-within) {
        color: var(--comp-inputGroup-stroke-focus);
      }

      :host([invalid]) {
        color: var(--comp-inputGroup-stroke-danger);
      }

      .group {
        position: relative;
        display: flex;
        align-items: center;
        gap: var(--comp-inputGroup-gap);
        box-sizing: border-box;
        padding: var(--comp-inputGroup-padding-vertical) var(--comp-inputGroup-padding-horizontal);
        background: var(--comp-inputGroup-bg-default);
        border-radius: var(--comp-inputGroup-radius);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        font-weight: var(--sys-typography-body-fontWeight);
        line-height: var(--sys-typography-body-lineHeight);
        color: var(--comp-inputGroup-text-value);
      }

      :host([disabled]) .group {
        background: var(--comp-inputGroup-bg-disabled);
      }

      .body {
        position: relative;
        display: flex;
        align-items: center;
        gap: var(--comp-inputGroup-gap);
        flex: 1;
        min-width: 0;
      }

      /* A bare input placed in the group loses its own chrome — the group
         paints the box. */
      ::slotted(input) {
        flex: 1;
        min-width: 0;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        border: none;
        outline: none;
        background: transparent;
        color: var(--comp-inputGroup-text-value);
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
        line-height: inherit;
      }
    `,
  ];

  /** Disables the whole group and mutes the surface. */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Marks the group invalid, painting the danger stroke. */
  @property({ type: Boolean, reflect: true }) invalid = false;

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.inputGroup.sketch.roughness,
      bowing: tokens.comp.inputGroup.sketch.bowing,
    };
  }

  protected override render(): unknown {
    return html`<div class="group" part="group">
      ${this.renderSketch()}
      <div class="body">
        <slot></slot>
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-input-group': GhInputGroup;
  }
}

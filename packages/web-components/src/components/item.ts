import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

/** Visual treatment of a `<gh-item>` row. */
export type GhItemVariant = 'default' | 'muted' | 'outline';

/**
 * `<gh-item>` — a flexible list-row primitive: a horizontal band of optional
 * leading media (`media` slot), a growing content column (default slot), and
 * trailing actions (`actions` slot).
 *
 * The `'outline'` variant paints a sketchy border via `@ghds/sketch-core`;
 * `'muted'` fills a subtle hover background; `'default'` is transparent. The
 * `selected` state fills the selected background. All colours, spacing and
 * sketch parameters come from `@ghds/tokens` (`comp.item.*`).
 */
@customElement('gh-item')
export class GhItem extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: block;
        color: var(--comp-item-stroke-default);
      }

      .item {
        position: relative;
        display: flex;
        align-items: center;
        gap: var(--comp-item-gap);
        box-sizing: border-box;
        padding: var(--comp-item-padding-vertical) var(--comp-item-padding-horizontal);
        border-radius: var(--comp-item-radius);
        color: var(--comp-item-text-title);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        font-weight: var(--sys-typography-body-fontWeight);
        line-height: var(--sys-typography-body-lineHeight);
      }

      :host([variant='muted']) .item {
        background: var(--comp-item-bg-hover);
      }

      :host([selected]) .item {
        background: var(--comp-item-bg-selected);
      }

      .media {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .content {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: var(--sys-spacing-xs);
        flex: 1;
        min-width: 0;
      }

      .actions {
        position: relative;
        display: flex;
        align-items: center;
        gap: var(--sys-spacing-sm);
        flex-shrink: 0;
      }

      ::slotted([slot='title']) {
        color: var(--comp-item-text-title);
        font-family: var(--sys-typography-label-fontFamily);
        font-size: var(--sys-typography-label-fontSize);
        font-weight: var(--sys-typography-label-fontWeight);
        line-height: var(--sys-typography-label-lineHeight);
      }

      ::slotted([slot='description']) {
        color: var(--comp-item-text-description);
        font-family: var(--sys-typography-caption-fontFamily);
        font-size: var(--sys-typography-caption-fontSize);
        font-weight: var(--sys-typography-caption-fontWeight);
        line-height: var(--sys-typography-caption-lineHeight);
      }
    `,
  ];

  /**
   * Surface treatment. `'default'` is transparent; `'muted'` fills a subtle
   * background; `'outline'` draws a hand-drawn border. Defaults to `'default'`.
   */
  @property({ type: String, reflect: true }) variant: GhItemVariant = 'default';
  /** Marks the row as the selected/active one (fills the selected background). */
  @property({ type: Boolean, reflect: true }) selected = false;

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.item.sketch.roughness,
      bowing: tokens.comp.item.sketch.bowing,
    };
  }

  protected override render(): unknown {
    return html`<div class="item" part="item">
      ${this.variant === 'outline' ? this.renderSketch() : nothing}
      <div class="media" part="media"><slot name="media"></slot></div>
      <div class="content" part="content">
        <slot name="title"></slot>
        <slot></slot>
        <slot name="description"></slot>
      </div>
      <div class="actions" part="actions"><slot name="actions"></slot></div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-item': GhItem;
  }
}

import type { IconName } from '@ghds/icons';
import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';
import './icon.js';

/** Kind of a `<gh-callout>` aside. */
export type GhCalloutVariant = 'info' | 'tip' | 'warning';

const ICON: Record<GhCalloutVariant, IconName> = {
  info: 'info',
  tip: 'star',
  warning: 'warning',
};

/**
 * `<gh-callout>` — a hand-drawn, static aside for documentation and other
 * long-form content (a note, a tip, a caveat). A sketchy box
 * (`@ghds/sketch-core`) with a variant-coloured outline and icon, an optional
 * `heading`, and a slotted body.
 *
 * Unlike `<gh-alert>` it is not a live region and cannot be dismissed: it
 * exposes `role="note"` and dispatches no events. Token-driven (`comp.callout.*`).
 */
@customElement('gh-callout')
export class GhCallout extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: block;
        --_callout-stroke: var(--comp-callout-stroke-info);
        --_callout-icon: var(--comp-callout-icon-info);
        color: var(--_callout-stroke);
      }
      :host([variant='tip']) {
        --_callout-stroke: var(--comp-callout-stroke-tip);
        --_callout-icon: var(--comp-callout-icon-tip);
      }
      :host([variant='warning']) {
        --_callout-stroke: var(--comp-callout-stroke-warning);
        --_callout-icon: var(--comp-callout-icon-warning);
      }
      .callout {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: var(--comp-callout-gap);
        box-sizing: border-box;
        padding: var(--comp-callout-padding);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        line-height: var(--sys-typography-body-lineHeight);
      }
      .icon {
        position: relative;
        display: inline-flex;
        color: var(--_callout-icon);
      }
      .content {
        position: relative;
        flex: 1;
        min-width: 0;
        color: var(--comp-callout-text-body);
      }
      .heading {
        color: var(--comp-callout-text-heading);
        font-weight: var(--sys-typography-label-fontWeight);
      }
      .sketch-fill {
        fill: var(--comp-callout-bg);
        stroke: none;
      }
    `,
  ];

  /** Kind of aside: `info` (default), `tip` or `warning`. Reflected. */
  @property({ type: String, reflect: true }) variant: GhCalloutVariant = 'info';
  /** Optional bold heading shown above the body. */
  @property({ type: String }) heading = '';

  private readonly internals: ElementInternals = this.attachInternals();

  constructor() {
    super();
    // A static aside, not a live region. An explicit `role` attribute on the
    // host still takes precedence over this default.
    this.internals.role = 'note';
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.callout.sketch.roughness,
      bowing: tokens.comp.callout.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override render(): unknown {
    const icon = ICON[this.variant] ?? ICON.info;
    return html`<div class="callout" part="callout">
      ${this.renderSketch()}
      <span class="icon" part="icon"><gh-icon name=${icon} size="sm"></gh-icon></span>
      <div class="content" part="content">
        ${this.heading ? html`<div class="heading" part="heading">${this.heading}</div>` : nothing}
        <div class="body"><slot></slot></div>
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-callout': GhCallout;
  }
}

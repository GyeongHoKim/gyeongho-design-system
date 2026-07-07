import type { IconName } from '@ghds/icons';
import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';
import './icon.js';

/** Severity of a `<gh-alert>`. */
export type GhAlertVariant = 'info' | 'success' | 'warning' | 'danger';

const ICON: Record<GhAlertVariant, IconName> = {
  info: 'info',
  success: 'check',
  warning: 'warning',
  danger: 'warning',
};

/**
 * `<gh-alert>` — a hand-drawn inline alert/banner. A sketchy box
 * (`@ghds/sketch-core`) with a severity-coloured outline + icon and a slotted
 * message. `danger` exposes `role="alert"`; the rest `role="status"`. Dispatches
 * a `dismiss` event from the optional close button. Token-driven (`comp.alert.*`).
 */
@customElement('gh-alert')
export class GhAlert extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: block;
        --_alert-stroke: var(--comp-alert-stroke-info);
        --_alert-icon: var(--comp-alert-icon-info);
        color: var(--_alert-stroke);
      }
      :host([variant='success']) {
        --_alert-stroke: var(--comp-alert-stroke-success);
        --_alert-icon: var(--comp-alert-icon-success);
      }
      :host([variant='warning']) {
        --_alert-stroke: var(--comp-alert-stroke-warning);
        --_alert-icon: var(--comp-alert-icon-warning);
      }
      :host([variant='danger']) {
        --_alert-stroke: var(--comp-alert-stroke-danger);
        --_alert-icon: var(--comp-alert-icon-danger);
      }
      .alert {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: var(--comp-alert-gap);
        box-sizing: border-box;
        padding: var(--comp-alert-padding);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        line-height: var(--sys-typography-body-lineHeight);
      }
      .icon {
        position: relative;
        display: inline-flex;
        color: var(--_alert-icon);
      }
      .content {
        position: relative;
        flex: 1;
        min-width: 0;
        color: var(--comp-alert-text-body);
      }
      .title {
        color: var(--comp-alert-text-title);
        font-weight: var(--sys-typography-label-fontWeight);
      }
      .close {
        position: relative;
        display: inline-flex;
        padding: 0;
        border: none;
        background: transparent;
        color: var(--comp-alert-text-body);
        cursor: pointer;
      }
      .sketch-fill {
        fill: var(--comp-alert-bg);
        stroke: none;
      }
    `,
  ];

  @property({ type: String, reflect: true }) variant: GhAlertVariant = 'info';
  @property({ type: String }) heading = '';
  @property({ type: Boolean }) dismissible = false;

  private readonly internals: ElementInternals = this.attachInternals();

  protected override updated(): void {
    this.internals.role = this.variant === 'danger' ? 'alert' : 'status';
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.alert.sketch.roughness,
      bowing: tokens.comp.alert.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override render(): unknown {
    return html`<div class="alert" part="alert">
      ${this.renderSketch()}
      <span class="icon"><gh-icon name=${ICON[this.variant]} size="sm"></gh-icon></span>
      <div class="content">
        ${this.heading ? html`<div class="title">${this.heading}</div>` : nothing}
        <div><slot></slot></div>
      </div>
      ${
        this.dismissible
          ? html`<button
              class="close"
              aria-label="Dismiss"
              @click=${() =>
                this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }))}
            >
              <gh-icon name="close" size="sm"></gh-icon>
            </button>`
          : nothing
      }
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-alert': GhAlert;
  }
}

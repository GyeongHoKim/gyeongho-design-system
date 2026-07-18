import type { IconName } from '@ghds/icons';
import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';
import './icon.js';

/**
 * `<gh-attachment>` — a hand-drawn attachment chip.
 *
 * Shows an optional leading icon, a file `name` with optional `meta` (e.g. a
 * size), and, when `removable`, a close button that emits a `gh-remove`
 * `CustomEvent`. The sketchy box (outline from `@ghds/sketch-core` over a
 * token-driven fill) and every colour, padding, radius and sketch parameter come
 * from `comp.attachment.*` tokens.
 */
@customElement('gh-attachment')
export class GhAttachment extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: inline-flex;
      }

      .attachment {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: var(--comp-attachment-gap);
        box-sizing: border-box;
        padding: var(--comp-attachment-padding-vertical) var(--comp-attachment-padding-horizontal);
        background: var(--comp-attachment-bg-default);
        border-radius: var(--comp-attachment-radius);
        /* Drives the sketch stroke (currentColor). */
        color: var(--comp-attachment-stroke-default);
        font-family: var(--sys-typography-body-fontFamily);
      }

      .icon {
        position: relative;
        display: inline-flex;
        color: var(--comp-attachment-icon-default);
      }

      .text {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        min-width: 0;
      }

      .name {
        color: var(--comp-attachment-text-name);
        font-family: var(--sys-typography-label-fontFamily);
        font-size: var(--sys-typography-label-fontSize);
        font-weight: var(--sys-typography-label-fontWeight);
        line-height: var(--sys-typography-label-lineHeight);
      }

      .meta {
        color: var(--comp-attachment-text-meta);
        font-family: var(--sys-typography-caption-fontFamily);
        font-size: var(--sys-typography-caption-fontSize);
        font-weight: var(--sys-typography-caption-fontWeight);
        line-height: var(--sys-typography-caption-lineHeight);
      }

      .remove {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: none;
        background: transparent;
        color: var(--comp-attachment-icon-default);
        cursor: pointer;
      }

      .remove:focus-visible {
        outline: var(--sys-border-width-thick) solid var(--sys-color-border-focus);
        outline-offset: var(--sys-spacing-xs);
        border-radius: var(--sys-radius-sm);
      }
    `,
  ];

  /** File (or resource) name shown as the primary label. */
  @property({ type: String }) name = '';
  /** Secondary metadata, e.g. a human-readable size like `"2.4 MB"`. */
  @property({ type: String }) meta?: string;
  /** Optional leading icon (a `@ghds/icons` name). */
  @property({ type: String }) icon?: string;
  /** When true, renders a remove button that emits `gh-remove`. */
  @property({ type: Boolean, reflect: true }) removable = false;

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.attachment.sketch.roughness,
      bowing: tokens.comp.attachment.sketch.bowing,
    };
  }

  private readonly handleRemove = (): void => {
    this.dispatchEvent(new CustomEvent('gh-remove', { bubbles: true, composed: true }));
  };

  protected override render(): unknown {
    return html`<div class="attachment" part="attachment">
      ${this.renderSketch()}
      ${
        this.icon
          ? html`<span class="icon"
            ><gh-icon name=${this.icon as IconName} size="sm"></gh-icon
          ></span>`
          : nothing
      }
      <span class="text">
        <span class="name">${this.name}</span>
        ${this.meta !== undefined ? html`<span class="meta">${this.meta}</span>` : nothing}
      </span>
      ${
        this.removable
          ? html`<button
            class="remove"
            type="button"
            aria-label=${`Remove ${this.name}`}
            @click=${this.handleRemove}
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
    'gh-attachment': GhAttachment;
  }
}

import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';
import './icon.js';

/**
 * `<gh-accordion-item>` — one collapsible section inside `<gh-accordion>`.
 * Internal: not used standalone. Draws a sketchy surface box; the header button
 * dispatches `accordion-toggle` (with its `value`) on click.
 */
@customElement('gh-accordion-item')
export class GhAccordionItem extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: block;
        position: relative;
        color: var(--comp-accordion-stroke);
      }

      .header {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--sys-spacing-sm);
        width: 100%;
        box-sizing: border-box;
        margin: 0;
        padding: var(--comp-accordion-padding);
        border: none;
        background: transparent;
        color: var(--comp-accordion-text-header);
        font-family: var(--sys-typography-label-fontFamily);
        font-size: var(--sys-typography-label-fontSize);
        font-weight: var(--sys-typography-label-fontWeight);
        line-height: var(--sys-typography-label-lineHeight);
        text-align: left;
        cursor: pointer;
      }

      .header:disabled {
        color: var(--sys-color-text-disabled);
        cursor: not-allowed;
      }

      .header:focus-visible {
        outline: var(--sys-border-width-thick) solid var(--sys-color-border-focus);
        outline-offset: calc(-1 * var(--sys-spacing-xs));
      }

      .chevron {
        display: inline-flex;
        color: var(--comp-accordion-text-icon);
        transition: transform var(--sys-animation-duration-fast) var(--sys-animation-easing-standard);
      }

      :host([open]) .chevron {
        transform: rotate(180deg);
      }

      .content {
        position: relative;
        padding: 0 var(--comp-accordion-padding) var(--comp-accordion-padding);
        color: var(--comp-accordion-text-content);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        line-height: var(--sys-typography-body-lineHeight);
      }

      .sketch-fill {
        fill: var(--comp-accordion-bg);
        stroke: none;
      }
    `,
  ];

  @property({ type: String }) value = '';
  @property({ type: String }) label = '';
  @property({ type: String }) content = '';
  @property({ type: String }) headerId = '';
  @property({ type: String }) regionId = '';
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Move DOM focus to the header button (called by the parent on arrow nav). */
  focusHeader(): void {
    this.shadowRoot?.querySelector<HTMLButtonElement>('.header')?.focus();
  }

  private readonly handleClick = (): void => {
    if (!this.disabled) {
      this.dispatchEvent(
        new CustomEvent('accordion-toggle', {
          detail: this.value,
          bubbles: true,
          composed: true,
        }),
      );
    }
  };

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.accordion.sketch.roughness,
      bowing: tokens.comp.accordion.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override render(): unknown {
    return html`${this.renderSketch()}
      <button
        class="header"
        id=${this.headerId}
        aria-expanded=${this.open ? 'true' : 'false'}
        aria-controls=${this.regionId}
        ?disabled=${this.disabled}
        @click=${this.handleClick}
      >
        <span>${this.label}</span>
        <span class="chevron"><gh-icon name="chevron-down" size="sm"></gh-icon></span>
      </button>
      <div
        class="content"
        id=${this.regionId}
        role="region"
        aria-labelledby=${this.headerId}
        ?hidden=${!this.open}
      >
        ${this.open ? this.content : ''}
      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-accordion-item': GhAccordionItem;
  }
}

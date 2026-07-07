import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

/**
 * `<gh-tab>` — one tab button inside `<gh-tabs>`. Internal: not used standalone.
 * Draws a sketchy filled box when selected; dispatches `tab-select` (with its
 * `value`) on click. The parent drives selection and roving tabindex.
 */
@customElement('gh-tab')
export class GhTab extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: inline-block;
        color: var(--comp-tabs-tab-stroke-selected);
      }

      button {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        margin: 0;
        padding: var(--sys-spacing-xs) var(--sys-spacing-md);
        border: none;
        background: transparent;
        color: var(--comp-tabs-tab-text-default);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        font-weight: var(--sys-typography-body-fontWeight);
        line-height: var(--sys-typography-body-lineHeight);
        cursor: pointer;
      }

      :host([selected]) button {
        color: var(--comp-tabs-tab-text-selected);
        font-weight: var(--sys-typography-label-fontWeight);
      }

      button:disabled {
        color: var(--comp-tabs-tab-text-disabled);
        cursor: not-allowed;
      }

      button:focus-visible {
        outline: var(--sys-border-width-thick) solid var(--sys-color-border-focus);
        outline-offset: var(--sys-spacing-xs);
      }

      .label {
        position: relative;
      }

      .sketch-fill {
        fill: var(--comp-tabs-tab-bg-selected);
        stroke: none;
      }
    `,
  ];

  /** Value emitted on selection. */
  @property({ type: String }) value = '';
  /** DOM id for the tab button (referenced by the panel's aria-labelledby). */
  @property({ type: String }) tabId = '';
  /** DOM id of the controlled panel. */
  @property({ type: String }) panelId = '';
  /** Whether this tab is the active one. */
  @property({ type: Boolean, reflect: true }) selected = false;
  /** Disables the tab. */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Roving tabindex: only the active tab is tabbable. */
  @property({ type: Boolean }) tabbable = false;

  /** Move DOM focus to the inner button (called by the parent on arrow nav). */
  focusTab(): void {
    this.shadowRoot?.querySelector('button')?.focus();
  }

  private readonly handleClick = (): void => {
    if (!this.disabled) {
      this.dispatchEvent(
        new CustomEvent('tab-select', { detail: this.value, bubbles: true, composed: true }),
      );
    }
  };

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.tabs.sketch.roughness,
      bowing: tokens.comp.tabs.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override render(): unknown {
    return html`<button
      role="tab"
      id=${this.tabId}
      aria-selected=${this.selected ? 'true' : 'false'}
      aria-controls=${this.panelId}
      tabindex=${this.tabbable ? 0 : -1}
      ?disabled=${this.disabled}
      @click=${this.handleClick}
    >
      ${this.selected ? this.renderSketch() : nothing}
      <span class="label"><slot></slot></span>
    </button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-tab': GhTab;
  }
}

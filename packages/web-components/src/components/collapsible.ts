import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';
import './icon.js';

let collapsibleUid = 0;

/**
 * `<gh-collapsible>` — a hand-drawn single disclosure.
 *
 * A header `<button>` (slot `trigger`, or the `label` prop) toggles a content
 * region drawn inside a sketchy outlined box (`@ghds/sketch-core`). Wires
 * `aria-expanded` / `aria-controls`, dispatches a `toggle` `CustomEvent<boolean>`.
 * Colours, padding and sketch parameters come from `@ghds/tokens`
 * (`comp.collapsible.*`).
 */
@customElement('gh-collapsible')
export class GhCollapsible extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: block;
        color: var(--comp-collapsible-stroke);
      }

      .header {
        display: inline-flex;
        align-items: center;
        gap: var(--sys-spacing-sm);
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        border: none;
        background: transparent;
        color: var(--comp-collapsible-text);
        font-family: var(--sys-typography-label-fontFamily);
        font-size: var(--sys-typography-label-fontSize);
        font-weight: var(--sys-typography-label-fontWeight);
        line-height: var(--sys-typography-label-lineHeight);
        cursor: pointer;
      }

      .header:disabled {
        color: var(--sys-color-text-disabled);
        cursor: not-allowed;
      }

      .header:focus-visible {
        outline: var(--sys-border-width-thick) solid var(--comp-collapsible-stroke);
        outline-offset: var(--sys-spacing-xs);
      }

      .chevron {
        transition: transform var(--sys-animation-duration-fast) var(--sys-animation-easing-standard);
      }

      :host([open]) .chevron {
        transform: rotate(180deg);
      }

      .region {
        position: relative;
        box-sizing: border-box;
        margin-top: var(--sys-spacing-sm);
        padding: var(--comp-collapsible-padding);
        color: var(--comp-collapsible-text);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        line-height: var(--sys-typography-body-lineHeight);
      }

      .content {
        position: relative;
      }
    `,
  ];

  /** Fallback trigger text when the `trigger` slot is empty. */
  @property({ type: String }) label = '';
  /** Whether the region is expanded. */
  @property({ type: Boolean, reflect: true }) open = false;
  /** Disables the trigger. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  @query('.region') private regionEl?: HTMLElement;

  private readonly uid = `gh-collapsible-${collapsibleUid++}`;

  protected override get frame(): HTMLElement {
    return this.regionEl ?? this;
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('open') && this.open) {
      this.measure();
    }
  }

  private toggle(): void {
    if (this.disabled) {
      return;
    }
    this.open = !this.open;
    this.dispatchEvent(
      new CustomEvent('toggle', { detail: this.open, bubbles: true, composed: true }),
    );
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.collapsible.sketch.roughness,
      bowing: tokens.comp.collapsible.sketch.bowing,
    };
  }

  protected override render(): unknown {
    const regionId = `${this.uid}-region`;
    const headerId = `${this.uid}-header`;
    return html`<button
        class="header"
        id=${headerId}
        type="button"
        aria-expanded=${this.open ? 'true' : 'false'}
        aria-controls=${regionId}
        ?disabled=${this.disabled}
        @click=${() => this.toggle()}
      >
        <gh-icon class="chevron" name="chevron-down" size="sm" style="color: inherit"></gh-icon>
        <slot name="trigger">${this.label}</slot>
      </button>
      <div
        class="region"
        id=${regionId}
        role="region"
        aria-labelledby=${headerId}
        ?hidden=${!this.open}
      >
        ${this.open ? this.renderSketch() : nothing}
        <div class="content"><slot></slot></div>
      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-collapsible': GhCollapsible;
  }
}

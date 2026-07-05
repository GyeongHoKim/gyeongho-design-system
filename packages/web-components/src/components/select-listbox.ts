import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

export interface GhSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** The `id` a listbox option row gets, shared with the trigger's `aria-activedescendant`. */
export function getSelectOptionId(hostId: string, value: string): string {
  return `${hostId}-option-${value}`;
}

/**
 * `<gh-select-listbox>` — the floating panel for `<gh-select>`.
 *
 * **Internal — not intended for standalone use.** It is nested directly inside
 * `gh-select`'s own shadow-DOM template (not slotted, not reparented) and
 * positioned by its parent, which owns the trigger+panel relationship and
 * calls `@floating-ui/dom`'s `computePosition()`/`autoUpdate()` on it. It is
 * its own `SketchyBase` instance (own measured box, seed, `ResizeObserver`)
 * because the trigger and the panel are two visually-independent surfaces —
 * a sketch instance cannot span two shadow roots.
 */
@customElement('gh-select-listbox')
export class GhSelectListbox extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: none;
        color: var(--comp-select-panel-stroke);
      }

      :host([open]) {
        display: block;
      }

      .content {
        position: relative;
        box-sizing: border-box;
        background: var(--comp-select-panel-bg);
        border-radius: var(--comp-select-panel-radius);
        box-shadow: var(--comp-select-panel-shadow);
        padding: var(--comp-select-panel-padding);
        display: flex;
        flex-direction: column;
        gap: var(--comp-select-panel-gap);
        overflow-y: auto;
      }

      .option {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        padding: var(--comp-select-option-padding-vertical) var(--comp-select-option-padding-horizontal);
        border-radius: var(--comp-select-option-radius);
        cursor: pointer;
        color: var(--comp-select-option-text-default);
        background: var(--comp-select-option-bg-default);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
      }

      .option:hover,
      .option[data-highlighted] {
        background: var(--comp-select-option-bg-highlighted);
      }

      .option[data-selected] {
        color: var(--comp-select-option-text-selected);
        background: var(--comp-select-option-bg-selected);
      }

      .option[data-selected][data-highlighted],
      .option[data-selected]:hover {
        background: var(--comp-select-option-bg-selectedHover);
      }

      .option[data-disabled] {
        color: var(--comp-select-option-text-disabled);
        background: var(--comp-select-option-bg-default);
        cursor: not-allowed;
      }
    `,
  ];

  /** Whether the panel is visible. Reflected so `:host([open])` shows it. */
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Array }) options: GhSelectOption[] = [];
  @property({ type: String }) value = '';
  @property({ type: String }) highlightedValue = '';
  /** Id prefix shared with the trigger, so option ids match `aria-activedescendant`. */
  @property({ type: String }) hostId = '';
  @property({ type: String }) listboxLabel = '';

  private readonly internals: ElementInternals = this.attachInternals();

  protected override updated(): void {
    this.internals.role = 'listbox';
    this.internals.ariaLabel = this.listboxLabel || null;
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.select.sketch.roughness,
      bowing: tokens.comp.select.sketch.bowing,
    };
  }

  private readonly handleOptionClick = (option: GhSelectOption): void => {
    if (option.disabled) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent('option-select', {
        detail: { value: option.value },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private readonly handleOptionMouseEnter = (option: GhSelectOption): void => {
    if (option.disabled) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent('option-highlight', {
        detail: { value: option.value },
        bubbles: true,
        composed: true,
      }),
    );
  };

  protected override render(): unknown {
    return html`<div class="content" part="content">
      ${this.renderSketch()}
      ${this.options.map((option) => {
        const isSelected = option.value === this.value;
        const isHighlighted = option.value === this.highlightedValue;
        return html`<div
          id=${getSelectOptionId(this.hostId, option.value)}
          class="option"
          role="option"
          aria-selected=${isSelected}
          aria-disabled=${option.disabled ? 'true' : nothing}
          data-selected=${isSelected ? '' : nothing}
          data-highlighted=${isHighlighted ? '' : nothing}
          data-disabled=${option.disabled ? '' : nothing}
          @click=${() => this.handleOptionClick(option)}
          @mouseenter=${() => this.handleOptionMouseEnter(option)}
        >
          ${option.label}
        </div>`;
      })}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-select-listbox': GhSelectListbox;
  }
}

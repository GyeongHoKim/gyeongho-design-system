import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';
import './icon.js';

let nativeSelectIdCounter = 0;

/**
 * `<gh-native-select>` — a hand-drawn wrapper around a real native `<select>`.
 *
 * Unlike `<gh-select>` (a fully custom listbox), this keeps the platform's
 * native dropdown — useful on touch devices and for long option lists — and only
 * restyles the closed control with a sketchy box and a trailing chevron. Pass a
 * native `<select>` (with its `<option>`s) as the default slot:
 *
 * ```html
 * <gh-native-select label="Country"><select>…</select></gh-native-select>
 * ```
 *
 * The box is a sketchy rectangle outline from `@ghds/sketch-core` over a
 * token-driven fill. The outline stroke uses `currentColor`: the host resolves
 * it to `comp.nativeSelect.stroke.default`, switches to the focus colour on
 * `:focus-within`, and to the danger colour when `invalid`. Every colour,
 * padding, radius and sketch parameter comes from `comp.nativeSelect.*` tokens.
 */
@customElement('gh-native-select')
export class GhNativeSelect extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: inline-flex;
        flex-direction: column;
        gap: var(--comp-nativeSelect-gap);
        /* Drives the sketch stroke (currentColor). */
        color: var(--comp-nativeSelect-stroke-default);
        font-family: var(--sys-typography-body-fontFamily);
      }

      :host(:focus-within) {
        color: var(--comp-nativeSelect-stroke-focus);
      }

      :host([invalid]) {
        color: var(--comp-nativeSelect-stroke-danger);
      }

      .label {
        color: var(--comp-nativeSelect-text-label);
        font-family: var(--sys-typography-label-fontFamily);
        font-size: var(--sys-typography-label-fontSize);
        font-weight: var(--sys-typography-label-fontWeight);
        line-height: var(--sys-typography-label-lineHeight);
      }

      .control {
        position: relative;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        background: var(--comp-nativeSelect-bg-default);
        border-radius: var(--comp-nativeSelect-radius);
      }

      :host([disabled]) .control {
        background: var(--comp-nativeSelect-bg-disabled);
      }

      ::slotted(select) {
        position: relative;
        flex: 1;
        box-sizing: border-box;
        width: 100%;
        margin: 0;
        /* Room on the right for the overlaid chevron. */
        padding: var(--comp-nativeSelect-padding-vertical)
          calc(
            var(--comp-nativeSelect-padding-horizontal) + var(--sys-icon-size-sm) +
              var(--sys-spacing-xs)
          )
          var(--comp-nativeSelect-padding-vertical) var(--comp-nativeSelect-padding-horizontal);
        border: none;
        outline: none;
        background: transparent;
        appearance: none;
        -webkit-appearance: none;
        color: var(--comp-nativeSelect-text-value);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        font-weight: var(--sys-typography-body-fontWeight);
        line-height: var(--sys-typography-body-lineHeight);
        cursor: pointer;
      }

      ::slotted(select:disabled) {
        color: var(--comp-nativeSelect-text-disabled);
        cursor: not-allowed;
      }

      .chevron {
        position: absolute;
        right: var(--comp-nativeSelect-padding-horizontal);
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        color: var(--comp-nativeSelect-icon-default);
      }

      :host([disabled]) .chevron {
        color: var(--comp-nativeSelect-icon-disabled);
      }
    `,
  ];

  /** Disables the control and mutes the surface. Propagated to the slotted `<select>`. */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Marks the field invalid, painting the danger stroke. */
  @property({ type: Boolean, reflect: true }) invalid = false;
  /** Optional visible label; also the accessible name of the slotted `<select>`. */
  @property({ type: String }) label?: string;

  @query('.control') private controlEl!: HTMLDivElement;

  private readonly labelId = `gh-native-select-${++nativeSelectIdCounter}-label`;

  /** The drawn box is the control row only — not the label above it. */
  protected override get frame(): HTMLElement {
    return this.controlEl ?? this;
  }

  /** The slotted native `<select>`, if present. */
  private get selectEl(): HTMLSelectElement | null {
    const slot = this.shadowRoot?.querySelector('slot');
    const assigned = slot?.assignedElements({ flatten: true }) ?? [];
    for (const node of assigned) {
      if (node instanceof HTMLSelectElement) {
        return node;
      }
      const nested = node.querySelector?.('select');
      if (nested instanceof HTMLSelectElement) {
        return nested;
      }
    }
    return null;
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('disabled') || changed.has('invalid') || changed.has('label')) {
      this.syncSelect();
    }
  }

  private readonly syncSelect = (): void => {
    const select = this.selectEl;
    if (!select) {
      return;
    }
    select.disabled = this.disabled;
    if (this.invalid) {
      select.setAttribute('aria-invalid', 'true');
    } else {
      select.removeAttribute('aria-invalid');
    }
    if (this.label !== undefined) {
      select.setAttribute('aria-labelledby', this.labelId);
    } else {
      select.removeAttribute('aria-labelledby');
    }
    // Re-measure in case enabling/disabling changed the control's metrics.
    this.measure();
  };

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.nativeSelect.sketch.roughness,
      bowing: tokens.comp.nativeSelect.sketch.bowing,
    };
  }

  protected override render(): unknown {
    return html`${
      this.label !== undefined
        ? html`<span class="label" id=${this.labelId}>${this.label}</span>`
        : nothing
    }
      <div class="control" part="control">
        ${this.renderSketch()}
        <slot @slotchange=${this.syncSelect}></slot>
        <gh-icon class="chevron" name="chevron-down" size="sm"></gh-icon>
      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-native-select': GhNativeSelect;
  }
}

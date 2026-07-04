import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import './icon.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

/**
 * `<gh-checkbox>` — a hand-drawn checkbox.
 *
 * The sketchy box comes from `@ghds/sketch-core` (filled solid when checked);
 * the check/indeterminate mark reuses `<gh-icon>` rather than inventing new
 * glyph geometry. A real `<input type="checkbox">` in the shadow DOM carries
 * all native keyboard/click behavior; `ElementInternals` bridges its boolean
 * state to real `<form>` participation (form value present only when checked,
 * matching native `<input type="checkbox">` submission semantics) and exposes
 * `:state(checked)`/`:state(indeterminate)` for consumers to style by.
 */
@customElement('gh-checkbox')
export class GhCheckbox extends SketchyBase {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...SketchyBase.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        gap: var(--comp-checkbox-gap);
        color: var(--comp-checkbox-stroke-default);
        cursor: pointer;
      }

      :host(:hover) {
        color: var(--comp-checkbox-stroke-hover);
      }

      :host([checked]) {
        color: var(--comp-checkbox-stroke-checked);
        --ghds-sketch-fill-color: var(--comp-checkbox-bg-checked-default);
      }

      :host([checked]:hover) {
        --ghds-sketch-fill-color: var(--comp-checkbox-bg-checked-hover);
      }

      :host(:not([checked])) {
        --ghds-sketch-fill-color: var(--comp-checkbox-bg-unchecked-default);
      }

      :host([disabled]) {
        color: var(--comp-checkbox-stroke-disabled);
        cursor: not-allowed;
      }

      :host([disabled][checked]) {
        --ghds-sketch-fill-color: var(--comp-checkbox-bg-checked-disabled);
      }

      :host([disabled]:not([checked])) {
        --ghds-sketch-fill-color: var(--comp-checkbox-bg-unchecked-disabled);
      }

      .box {
        position: relative;
        box-sizing: border-box;
        width: var(--comp-checkbox-size);
        height: var(--comp-checkbox-size);
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .box:focus-within {
        outline: var(--sys-border-width-default) solid var(--comp-checkbox-stroke-focus);
        outline-offset: var(--sys-spacing-xs);
      }

      gh-icon {
        position: relative;
        color: var(--comp-checkbox-mark);
      }

      input {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        margin: 0;
        opacity: 0;
        cursor: inherit;
      }

      label {
        color: var(--comp-checkbox-text-label);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
      }

      :host([disabled]) label {
        color: var(--comp-checkbox-text-disabled);
      }
    `,
  ];

  /** Checked state. */
  @property({ type: Boolean, reflect: true }) checked = false;
  /** Tri-state visual indicator. Does not affect the submitted form value. */
  @property({ type: Boolean, reflect: true }) indeterminate = false;
  /** Disables interaction and form participation. */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Submitted control name. */
  @property({ type: String }) name = '';
  /** Submitted value when checked. */
  @property({ type: String }) value = 'on';
  /** Optional visible label, also the accessible name. */
  @property({ type: String }) label = '';

  @query('.box') private boxEl!: HTMLDivElement;
  @query('input') private inputEl!: HTMLInputElement;

  private readonly internals: ElementInternals = this.attachInternals();
  private readonly checkboxId = `gh-checkbox-${Math.random().toString(36).slice(2)}`;

  protected override get frame(): HTMLElement {
    return this.boxEl ?? this;
  }

  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.checkbox.sketch.roughness,
      bowing: tokens.comp.checkbox.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override firstUpdated(): void {
    super.firstUpdated();
    if (this.inputEl) {
      this.inputEl.indeterminate = this.indeterminate;
    }
    this.syncFormState();
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('indeterminate') && this.inputEl) {
      this.inputEl.indeterminate = this.indeterminate;
    }
    if (
      changed.has('checked') ||
      changed.has('indeterminate') ||
      changed.has('value') ||
      changed.has('disabled')
    ) {
      this.syncFormState();
    }
  }

  private syncFormState(): void {
    this.internals.setFormValue(this.checked ? this.value : null);
    // `ElementInternals.states` (CustomStateSet) isn't implemented in every
    // environment yet (e.g. jsdom) — guard so this degrades gracefully rather
    // than throwing where it's unsupported.
    this.internals.states?.delete('checked');
    this.internals.states?.delete('indeterminate');
    if (this.checked) {
      this.internals.states?.add('checked');
    }
    if (this.indeterminate) {
      this.internals.states?.add('indeterminate');
    }
  }

  private readonly handleChange = (): void => {
    this.checked = this.inputEl.checked;
    // Mirrors native checkbox activation: clicking clears `indeterminate`, so
    // our reflected property and the shadow `<input>`'s real DOM property
    // (already cleared by the browser) stay in sync.
    this.indeterminate = false;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  };

  formResetCallback(): void {
    this.checked = false;
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    this.checked = typeof state === 'string';
  }

  protected override render(): unknown {
    return html`<div class="box">
        ${this.renderSketch()}
        ${
          this.checked || this.indeterminate
            ? html`<gh-icon name=${this.indeterminate ? 'minus' : 'check'} size="sm"></gh-icon>`
            : nothing
        }
        <input
          id=${this.checkboxId}
          type="checkbox"
          .checked=${this.checked}
          aria-label=${this.label ? nothing : this.getAttribute('aria-label') || nothing}
          ?disabled=${this.disabled}
          @change=${this.handleChange}
        />
      </div>
      ${this.label ? html`<label for=${this.checkboxId}>${this.label}</label>` : nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-checkbox': GhCheckbox;
  }
}

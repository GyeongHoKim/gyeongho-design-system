import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { SketchyBase } from '../sketchy-base.js';

export type GhInputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number';

let inputIdCounter = 0;

/**
 * `<gh-input>` — a hand-drawn, form-associated text field.
 *
 * The box is a sketchy rectangle outline from `@ghds/sketch-core`; a real
 * `<input>` provides editing, caret and keyboard behaviour. Via `ElementInternals`
 * the element participates in `<form>` submission, reset, disabling and
 * constraint validation. All colours, spacing and typography come from tokens.
 */
@customElement('gh-input')
export class GhInput extends SketchyBase {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...SketchyBase.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: inline-block;
        color: var(--sys-color-border-default);
      }

      :host(:hover) {
        color: var(--sys-color-border-strong);
      }

      :host(:focus-within) {
        color: var(--sys-color-border-focus);
      }

      :host([disabled]) {
        color: var(--sys-color-border-subtle);
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: var(--sys-spacing-xs);
      }

      label {
        font-family: var(--sys-typography-label-fontFamily);
        font-size: var(--sys-typography-label-fontSize);
        font-weight: var(--sys-typography-label-fontWeight);
        line-height: var(--sys-typography-label-lineHeight);
        color: var(--sys-color-text-secondary);
      }

      .required-mark {
        color: var(--sys-color-border-danger);
      }

      .input-wrap {
        position: relative;
        display: block;
      }

      input {
        position: relative;
        box-sizing: border-box;
        width: 100%;
        margin: 0;
        padding: var(--sys-spacing-sm) var(--sys-spacing-md);
        background: transparent;
        border: none;
        outline: none;
        color: var(--sys-color-text-primary);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        font-weight: var(--sys-typography-body-fontWeight);
        line-height: var(--sys-typography-body-lineHeight);
        caret-color: var(--sys-color-border-focus);
      }

      input::placeholder {
        color: var(--sys-color-text-disabled);
      }

      input:disabled {
        cursor: not-allowed;
      }

      :host(:focus-within) input {
        outline: none;
      }
    `,
  ];

  /** Current field value. Mirrored to the form value. */
  @property({ type: String }) value = '';
  /** Submitted control name. */
  @property({ type: String }) name = '';
  /** Input mode. */
  @property({ type: String }) type: GhInputType = 'text';
  /** Placeholder text shown when empty. */
  @property({ type: String }) placeholder = '';
  /** Optional visible label, also used as the accessible name. */
  @property({ type: String }) label = '';
  /** Disables editing and form participation. */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Marks the field as required for constraint validation. */
  @property({ type: Boolean, reflect: true }) required = false;

  @query('input') private inputEl!: HTMLInputElement;
  @query('.input-wrap') private frameEl!: HTMLDivElement;

  private readonly internals: ElementInternals = this.attachInternals();
  private readonly inputId = `gh-input-${++inputIdCounter}`;

  /** The drawn box is the input row only — not the label above it. */
  protected override get frame(): HTMLElement {
    return this.frameEl ?? this;
  }

  /** Reflects the live form value of the underlying control. */
  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  /** Mirrors the control's validity (e.g. for `:host` constraint styling). */
  get validity(): ValidityState {
    return this.internals.validity;
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override firstUpdated(): void {
    super.firstUpdated();
    this.syncFormValue();
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('value') || changed.has('required') || changed.has('disabled')) {
      this.syncFormValue();
    }
  }

  private syncFormValue(): void {
    this.internals.setFormValue(this.value);
    const input = this.inputEl ?? null;
    const valid = !this.required || this.value.length > 0;
    this.internals.setValidity(
      valid ? {} : { valueMissing: true },
      valid ? undefined : 'Please fill out this field.',
      input ?? undefined,
    );
  }

  private readonly handleInput = (event: Event): void => {
    this.value = (event.target as HTMLInputElement).value;
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  };

  private readonly handleChange = (): void => {
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  };

  // --- Form-associated lifecycle callbacks ---------------------------------

  formResetCallback(): void {
    this.value = '';
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (typeof state === 'string') {
      this.value = state;
    }
  }

  protected override render(): unknown {
    const labelId = `${this.inputId}-label`;
    return html`<div class="field">
      ${
        this.label
          ? html`<label id=${labelId} for=${this.inputId}>
            ${this.label}${
              this.required
                ? html`<span class="required-mark" aria-hidden="true"> *</span>`
                : nothing
            }
          </label>`
          : nothing
      }
      <div class="input-wrap">
        ${this.renderSketch()}
        <input
          id=${this.inputId}
          part="input"
          .value=${this.value}
          type=${this.type}
          name=${this.name || nothing}
          placeholder=${this.placeholder || nothing}
          ?disabled=${this.disabled}
          ?required=${this.required}
          aria-label=${this.label ? nothing : this.placeholder || nothing}
          @input=${this.handleInput}
          @change=${this.handleChange}
        />
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-input': GhInput;
  }
}

import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { SketchyBase } from '../sketchy-base.js';

let textareaIdCounter = 0;

/**
 * `<gh-textarea>` — a hand-drawn, form-associated multi-line text field.
 *
 * The box is a sketchy rectangle outline from `@ghds/sketch-core`; a real
 * `<textarea>` provides editing, caret and keyboard behaviour. Via
 * `ElementInternals` the element participates in `<form>` submission, reset,
 * disabling and constraint validation. The native resize handle is disabled —
 * it visually collides with the hand-drawn border. Set `autoResize` to grow
 * the field to fit its content (measured via `scrollHeight` in JS, not CSS
 * `field-sizing: content`, which isn't supported in every browser yet).
 */
@customElement('gh-textarea')
export class GhTextarea extends SketchyBase {
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

      textarea {
        position: relative;
        box-sizing: border-box;
        width: 100%;
        margin: 0;
        padding: var(--sys-spacing-sm) var(--sys-spacing-md);
        background: transparent;
        border: none;
        outline: none;
        resize: none;
        color: var(--sys-color-text-primary);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        font-weight: var(--sys-typography-body-fontWeight);
        line-height: var(--sys-typography-body-lineHeight);
        caret-color: var(--sys-color-border-focus);
      }

      textarea::placeholder {
        color: var(--sys-color-text-disabled);
      }

      textarea:disabled {
        cursor: not-allowed;
      }

      :host(:focus-within) textarea {
        outline: none;
      }
    `,
  ];

  /** Current field value. Mirrored to the form value. */
  @property({ type: String }) value = '';
  /** Submitted control name. */
  @property({ type: String }) name = '';
  /** Placeholder text shown when empty. */
  @property({ type: String }) placeholder = '';
  /** Optional visible label, also used as the accessible name. */
  @property({ type: String }) label = '';
  /** Visible row count — also the minimum height once measured. */
  @property({ type: Number }) rows = 2;
  /** Disables editing and form participation. */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Marks the field as required for constraint validation. */
  @property({ type: Boolean, reflect: true }) required = false;
  /** Grows the field to fit its content instead of scrolling. */
  @property({ type: Boolean, reflect: true }) autoResize = false;

  @query('textarea') private textareaEl!: HTMLTextAreaElement;
  @query('.input-wrap') private frameEl!: HTMLDivElement;

  private readonly internals: ElementInternals = this.attachInternals();
  private readonly textareaId = `gh-textarea-${++textareaIdCounter}`;
  // Captured once on first render — the authored `value`, restored by
  // `formResetCallback`, matching native `<textarea>` reset behavior.
  private defaultValue = '';

  /** The drawn box is the textarea row only — not the label above it. */
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
    this.defaultValue = this.value;
    this.syncFormValue();
    this.syncHeight();
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('value') || changed.has('required') || changed.has('disabled')) {
      this.syncFormValue();
    }
    if (changed.has('value') || changed.has('autoResize') || changed.has('rows')) {
      this.syncHeight();
    }
  }

  private syncFormValue(): void {
    this.internals.setFormValue(this.value);
    const textarea = this.textareaEl ?? null;
    const valid = !this.required || this.value.length > 0;
    this.internals.setValidity(
      valid ? {} : { valueMissing: true },
      valid ? undefined : 'Please fill out this field.',
      textarea ?? undefined,
    );
  }

  private syncHeight(): void {
    if (!this.textareaEl) {
      return;
    }
    if (!this.autoResize) {
      // Resets the JS-set inline height back to the `rows`-based default.
      this.textareaEl.style.height = '';
      return;
    }
    this.textareaEl.style.height = 'auto';
    this.textareaEl.style.height = `${this.textareaEl.scrollHeight}px`;
  }

  private readonly handleInput = (event: Event): void => {
    this.value = (event.target as HTMLTextAreaElement).value;
    // `updated()` calls `syncHeight()` once this reactive property change is
    // processed — no need to also call it here, which would measure twice.
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  };

  private readonly handleChange = (): void => {
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  };

  // --- Form-associated lifecycle callbacks ---------------------------------

  formResetCallback(): void {
    this.value = this.defaultValue;
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
    const labelId = `${this.textareaId}-label`;
    return html`<div class="field">
      ${
        this.label
          ? html`<label id=${labelId} for=${this.textareaId}>
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
        <textarea
          id=${this.textareaId}
          part="input"
          .value=${this.value}
          rows=${this.rows}
          name=${this.name || nothing}
          placeholder=${this.placeholder || nothing}
          ?disabled=${this.disabled}
          ?required=${this.required}
          aria-label=${this.label ? nothing : this.placeholder || nothing}
          @input=${this.handleInput}
          @change=${this.handleChange}
        ></textarea>
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-textarea': GhTextarea;
  }
}

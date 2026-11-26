import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { SketchyBase } from '../sketchy-base.js';

export type GhInputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number';

let inputIdCounter = 0;

/** Validity flags mirrored from the inner `<input>` (all but `customError`). */
const VALIDITY_FLAGS = [
  'valueMissing',
  'typeMismatch',
  'patternMismatch',
  'tooLong',
  'tooShort',
  'rangeUnderflow',
  'rangeOverflow',
  'stepMismatch',
  'badInput',
] as const;

/**
 * The form's default button: its first submit button in tree order, native
 * (`<button>`, `<input type="submit|image">`) or `gh-button`.
 *
 * `form.elements` leaves out `<input type="image">`, so the candidates come
 * from the form's root in tree order, kept when the form owns them (which also
 * covers controls tied to the form by a `form` attribute).
 */
function defaultButton(form: HTMLFormElement): HTMLElement | null {
  const root = form.getRootNode() as Document | ShadowRoot;
  for (const element of Array.from(
    root.querySelectorAll<HTMLElement>('button, input, gh-button'),
  )) {
    if ((element as { form?: unknown }).form !== form || isLinkModeButton(element)) {
      continue;
    }
    if (element instanceof HTMLInputElement) {
      if (element.type === 'submit' || element.type === 'image') {
        return element;
      }
    } else if ((element as { type?: unknown }).type === 'submit') {
      return element;
    }
  }
  return null;
}

/**
 * An enabled `gh-button` with an `href` renders an anchor, not a submit
 * button, so it cannot be the default button.
 */
function isLinkModeButton(element: HTMLElement): boolean {
  if (element.localName !== 'gh-button') {
    return false;
  }
  const { href, disabled } = element as { href?: unknown; disabled?: unknown };
  return typeof href === 'string' && href !== '' && disabled !== true;
}

/** `:disabled` also covers a button inside a disabled `<fieldset>`. */
function isDisabled(button: HTMLElement): boolean {
  return button.matches(':disabled') || (button as { disabled?: unknown }).disabled === true;
}

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
    if (
      changed.has('value') ||
      changed.has('type') ||
      changed.has('required') ||
      changed.has('disabled')
    ) {
      this.syncFormValue();
    }
  }

  private syncFormValue(): void {
    this.internals.setFormValue(this.value);
    const input = this.inputEl ?? null;
    // Before the first render there is no inner input to ask, so only
    // `required` can be checked.
    if (!input) {
      const valid = !this.required || this.value.length > 0;
      this.internals.setValidity(
        valid ? {} : { valueMissing: true },
        valid ? undefined : 'Please fill out this field.',
      );
      return;
    }
    // Mirror the inner input's own constraint checks (type, required, …), so
    // a malformed email or URL is invalid as it is in a native input.
    const flags: ValidityStateFlags = {};
    for (const flag of VALIDITY_FLAGS) {
      if (input.validity[flag]) {
        flags[flag] = true;
      }
    }
    const valid = Object.keys(flags).length === 0;
    this.internals.setValidity(
      flags,
      valid ? undefined : input.validationMessage || 'Please enter a valid value.',
      input,
    );
  }

  private readonly handleInput = (event: Event): void => {
    this.value = (event.target as HTMLInputElement).value;
    // Validity can change while the value does not (a partial number such as
    // "-" reads as "" but is badInput), and then Lit schedules no update.
    this.syncFormValue();
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  };

  private readonly handleChange = (): void => {
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  };

  /**
   * Implicit submission. The browser only submits a form on Enter for inputs
   * the form owns, and the `<input>` in this shadow root has no form owner, so
   * the host does it. Like the native default action, it runs after dispatch
   * finishes, so any listener (on the host or an ancestor) can cancel it with
   * `preventDefault()`. Enter that confirms an IME composition is ignored.
   */
  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Enter' || event.isComposing) {
      return;
    }
    setTimeout(() => {
      const form = this.form;
      if (!form || event.defaultPrevented || this.disabled) {
        return;
      }
      // Follow native implicit submission: activate the default button, so
      // its name/value and form* overrides apply, and do nothing when it is
      // disabled. With no submit button at all, submit directly.
      const button = defaultButton(form);
      if (!button) {
        form.requestSubmit();
      } else if (isDisabled(button)) {
        return;
      } else if (button instanceof HTMLButtonElement || button instanceof HTMLInputElement) {
        // Native implicit submission clicks the default button, so its click
        // listeners run and can cancel the submission.
        button.click();
      } else {
        // gh-button handles clicks on its inner button, not on the host, so
        // fire the click on the host for its listeners and submit unless one
        // cancels it. A custom element cannot be a submitter.
        const click = new MouseEvent('click', { bubbles: true, cancelable: true, composed: true });
        if (button.dispatchEvent(click)) {
          form.requestSubmit();
        }
      }
    });
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
          @keydown=${this.handleKeydown}
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

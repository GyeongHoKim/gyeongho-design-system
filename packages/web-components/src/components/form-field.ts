import { css, html, LitElement, nothing, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

let formFieldIdCounter = 0;

/**
 * `<gh-form-field>` — composes a Label + HelperText + ErrorText around a
 * single slotted control, auto-wiring `id`/`aria-describedby`/`aria-invalid`
 * onto it.
 *
 * A string-form `aria-describedby` set on the slotted (light-DOM) control
 * can't reference this element's own `<span>`s directly — they live in
 * `gh-form-field`'s shadow root, a different tree scope, and ID references
 * never cross that boundary (the same category of limitation this repo's
 * `gh-select` already solved for `aria-activedescendant` via a reflected
 * element reference — not applicable here since `aria-describedby` has no
 * such reflected property in every browser yet). Instead, this element
 * reaches into its own light-DOM child directly (ordinary, unrestricted DOM
 * access — only style encapsulation and slot *projection* are shadow-scoped)
 * and sets the attributes on it imperatively, whenever `for`/`helperText`/
 * `error` change or the slotted content itself changes:
 *
 * ```html
 * <gh-form-field for="email" label="Email" error="Required">
 *   <input id="email" />
 * </gh-form-field>
 * ```
 */
@customElement('gh-form-field')
export class GhFormField extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--sys-spacing-xs);
      font-family: var(--sys-typography-body-fontFamily);
    }

    label {
      color: var(--sys-color-text-primary);
      font-family: var(--sys-typography-label-fontFamily);
      font-size: var(--sys-typography-label-fontSize);
      font-weight: var(--sys-typography-label-fontWeight);
      line-height: var(--sys-typography-label-lineHeight);
    }

    .helper,
    .error {
      font-family: var(--sys-typography-caption-fontFamily);
      font-size: var(--sys-typography-caption-fontSize);
      font-weight: var(--sys-typography-caption-fontWeight);
      line-height: var(--sys-typography-caption-lineHeight);
    }

    .helper {
      color: var(--sys-color-text-secondary);
    }

    .error {
      color: var(--sys-color-text-danger);
    }
  `;

  /** Id of the wrapped control — mirrors native `<label for>`. Auto-assigned to the slotted control if it has none. */
  @property({ type: String }) for = '';
  /** Visible label for the wrapped control. */
  @property({ type: String }) label = '';
  /** Non-error descriptive text, always shown regardless of error state. */
  @property({ type: String, attribute: 'helper-text' }) helperText = '';
  /** Error message. Rendered with `role="alert"` when set. */
  @property({ type: String }) error = '';

  @query('slot') private slotEl!: HTMLSlotElement;

  private readonly internalId = `gh-form-field-${++formFieldIdCounter}`;

  private get baseId(): string {
    return this.for || this.internalId;
  }

  /** Id of the rendered helper-text element. */
  get helperId(): string {
    return `${this.baseId}-helper`;
  }

  /** Id of the rendered error-text element. */
  get errorId(): string {
    return `${this.baseId}-error`;
  }

  /** The single wrapped control — the first light-DOM child. */
  private get slottedControl(): Element | null {
    return this.children[0] ?? null;
  }

  private readonly handleSlotChange = (): void => {
    this.syncSlottedControl();
  };

  protected override firstUpdated(): void {
    this.slotEl.addEventListener('slotchange', this.handleSlotChange);
    this.syncSlottedControl();
  }

  override disconnectedCallback(): void {
    this.slotEl?.removeEventListener('slotchange', this.handleSlotChange);
    super.disconnectedCallback();
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('for') || changed.has('helperText') || changed.has('error')) {
      this.syncSlottedControl();
    }
  }

  private syncSlottedControl(): void {
    const control = this.slottedControl;
    if (!control) {
      return;
    }
    if (this.for && !control.id) {
      control.id = this.for;
    }
    const describedByIds: string[] = [];
    if (this.helperText !== '') {
      describedByIds.push(this.helperId);
    }
    if (this.error !== '') {
      describedByIds.push(this.errorId);
    }
    if (describedByIds.length > 0) {
      control.setAttribute('aria-describedby', describedByIds.join(' '));
    } else {
      control.removeAttribute('aria-describedby');
    }
    if (this.error !== '') {
      control.setAttribute('aria-invalid', 'true');
    } else {
      control.removeAttribute('aria-invalid');
    }
  }

  protected override render(): unknown {
    const hasHelperText = this.helperText !== '';
    const hasError = this.error !== '';
    return html`
      ${this.label ? html`<label for=${this.for || nothing}>${this.label}</label>` : nothing}
      <slot></slot>
      ${
        hasHelperText
          ? html`<span id=${this.helperId} class="helper">${this.helperText}</span>`
          : nothing
      }
      ${
        hasError
          ? html`<span id=${this.errorId} role="alert" class="error">${this.error}</span>`
          : nothing
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-form-field': GhFormField;
  }
}

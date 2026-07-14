import { css, html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * `<gh-label>` — a form field label.
 *
 * Renders a `<label>` around its slotted content. When `for` names an element,
 * clicking the label focuses/activates that control (resolved against the
 * document so it works across the shadow boundary). Typography comes from
 * `sys.typography.label`; colours from `@ghds/tokens` (`comp.label.*`).
 */
@customElement('gh-label')
export class GhLabel extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--comp-label-gap);
      color: var(--comp-label-text-default);
      font-family: var(--sys-typography-label-fontFamily);
      font-size: var(--sys-typography-label-fontSize);
      font-weight: var(--sys-typography-label-fontWeight);
      line-height: var(--sys-typography-label-lineHeight);
      cursor: default;
    }

    :host([disabled]) {
      color: var(--comp-label-text-disabled);
      cursor: not-allowed;
    }

    label {
      display: inline-flex;
      align-items: center;
      gap: var(--comp-label-gap);
      color: inherit;
      font: inherit;
      cursor: inherit;
    }
  `;

  /** Id of the control this label describes (resolved against the document). */
  @property({ type: String }) for = '';
  /** Dims the label and blocks its click-to-focus behaviour. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  private readonly onClick = (): void => {
    if (this.disabled || !this.for) {
      return;
    }
    const target = this.ownerDocument.getElementById(this.for) as
      | (HTMLElement & { focus?: () => void; click?: () => void })
      | null;
    if (!target) {
      return;
    }
    target.focus?.();
    if (
      target instanceof HTMLInputElement &&
      (target.type === 'checkbox' || target.type === 'radio')
    ) {
      target.click();
    }
  };

  protected override render(): unknown {
    return html`<label for=${this.for || nothing} @click=${this.onClick}><slot></slot></label>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-label': GhLabel;
  }
}

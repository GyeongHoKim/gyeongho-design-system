import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { GhRadio } from './radio.js';

/**
 * `<gh-radio-group>` — enforces mutual exclusivity among slotted `<gh-radio>`
 * elements. Unlike native same-`name` `<input type="radio">`, the platform
 * gives form-associated custom elements no automatic radio-group behavior —
 * this element unchecks every sibling when one becomes checked, whether that
 * happened via a user click (a bubbling `change` event, handled
 * synchronously) or a consumer setting `.checked`/`checked` programmatically
 * (no `change` event fires, so a `MutationObserver` on the reflected
 * `checked` attribute catches it instead). It does **not** propagate `name`
 * onto slotted children (Light DOM has no context-like propagation
 * mechanism) — repeat `name` on each `<gh-radio>` explicitly.
 */
@customElement('gh-radio-group')
export class GhRadioGroup extends LitElement {
  static override styles = css`
    fieldset {
      border: none;
      margin: 0;
      padding: 0;
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: var(--sys-spacing-sm);
    }

    :host([layout='row']) .list {
      flex-direction: row;
    }
  `;

  /** Accessible name for the group, rendered as the `<legend>`. */
  @property({ type: String }) label = '';
  /** Direction to stack slotted radios. */
  @property({ type: String, reflect: true }) layout: 'row' | 'column' = 'column';
  /**
   * Disables every slotted `<gh-radio>`. Reflected onto the internal
   * `<fieldset>` — the browser's native fieldset-disabling algorithm cascades
   * `disabled` to form-associated descendants (via `formDisabledCallback`),
   * so no manual propagation into slotted children is needed.
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  private readonly internals: ElementInternals = this.attachInternals();

  private readonly handleSlotChange = (event: Event): void => {
    const target = event.target as GhRadio;
    if (target.tagName === 'GH-RADIO' && target.checked) {
      this.uncheckSiblings(target);
    }
  };

  // Catches `checked` being set programmatically (property or attribute),
  // which reflects the attribute but never dispatches a `change` event.
  private readonly observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const target = mutation.target as GhRadio;
      if (target.tagName === 'GH-RADIO' && target.checked) {
        this.uncheckSiblings(target);
      }
    }
  });

  private uncheckSiblings(target: GhRadio): void {
    for (const radio of this.querySelectorAll<GhRadio>('gh-radio')) {
      if (radio !== target && radio.name === target.name) {
        radio.checked = false;
      }
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('change', this.handleSlotChange);
    this.observer.observe(this, { attributes: true, attributeFilter: ['checked'], subtree: true });
    this.internals.role = 'radiogroup';
  }

  override disconnectedCallback(): void {
    this.removeEventListener('change', this.handleSlotChange);
    this.observer.disconnect();
    super.disconnectedCallback();
  }

  protected override updated(): void {
    this.internals.ariaLabel = this.label || null;
  }

  protected override render(): unknown {
    return html`<fieldset ?disabled=${this.disabled}>
      ${this.label ? html`<legend>${this.label}</legend>` : null}
      <div class="list"><slot></slot></div>
    </fieldset>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-radio-group': GhRadioGroup;
  }
}

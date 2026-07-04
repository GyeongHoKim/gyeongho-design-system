import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * `<gh-checkbox-group>` — a presentational grouping wrapper for slotted
 * `<gh-checkbox>` elements. Unlike `<gh-radio-group>`, checkboxes are
 * independently selectable, so this element does not manage shared state or
 * mutual exclusivity — it only provides layout and an accessible group name
 * (via `<fieldset>`/`<legend>`). Each slotted `<gh-checkbox>` manages its own
 * `checked`/`name`/`value`.
 */
@customElement('gh-checkbox-group')
export class GhCheckboxGroup extends LitElement {
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
  /** Direction to stack slotted checkboxes. */
  @property({ type: String, reflect: true }) layout: 'row' | 'column' = 'column';
  /**
   * Disables every slotted `<gh-checkbox>`. Reflected onto the internal
   * `<fieldset>` — the browser's native fieldset-disabling algorithm cascades
   * `disabled` to form-associated descendants (via `formDisabledCallback`),
   * so no manual propagation into slotted children is needed.
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  protected override render(): unknown {
    return html`<fieldset ?disabled=${this.disabled}>
      ${this.label ? html`<legend>${this.label}</legend>` : null}
      <div class="list"><slot></slot></div>
    </fieldset>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-checkbox-group': GhCheckboxGroup;
  }
}

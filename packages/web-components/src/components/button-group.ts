import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type GhButtonGroupOrientation = 'horizontal' | 'vertical';

/**
 * `<gh-button-group>` — a layout wrapper that groups related buttons.
 *
 * Slots `<gh-button>` (or any control) into a flex row/column and exposes
 * `role="group"` with an optional `aria-label`. Gap and radius come from
 * `@ghds/tokens` (`comp.buttonGroup.*`).
 */
@customElement('gh-button-group')
export class GhButtonGroup extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      gap: var(--comp-buttonGroup-gap);
    }

    :host([orientation='vertical']) {
      flex-direction: column;
      align-items: stretch;
    }

    ::slotted(*) {
      flex: 0 0 auto;
    }
  `;

  /** Layout direction. */
  @property({ type: String, reflect: true }) orientation: GhButtonGroupOrientation = 'horizontal';
  /** Accessible group label. */
  @property({ type: String }) label = '';

  private readonly internals: ElementInternals = this.attachInternals();

  protected override updated(): void {
    this.internals.role = 'group';
    this.internals.ariaLabel = this.label || null;
    this.internals.ariaOrientation = this.orientation;
  }

  protected override render(): unknown {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-button-group': GhButtonGroup;
  }
}

import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * `<gh-resizable-panel>` — a single resizable region inside a
 * `<gh-resizable-group>`.
 *
 * The group owns the layout: it reads `defaultSize`/`minSize`/`maxSize` (all
 * percentages of the group) and sets this panel's `flex-basis` as the user drags
 * the neighbouring handles. Standalone it simply grows to fill the group.
 */
@customElement('gh-resizable-panel')
export class GhResizablePanel extends LitElement {
  static override styles = css`
    :host {
      display: block;
      flex: 1 1 0;
      overflow: auto;
      min-width: 0;
      min-height: 0;
      box-sizing: border-box;
    }
  `;

  /** Initial size as a percentage of the group. Defaults to an equal split. */
  @property({ type: Number, attribute: 'default-size' }) defaultSize?: number;
  /** Smallest size (percent) the panel may shrink to. Defaults to `10`. */
  @property({ type: Number, attribute: 'min-size' }) minSize = 10;
  /** Largest size (percent) the panel may grow to. Defaults to `90`. */
  @property({ type: Number, attribute: 'max-size' }) maxSize = 90;

  protected override render(): unknown {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-resizable-panel': GhResizablePanel;
  }
}

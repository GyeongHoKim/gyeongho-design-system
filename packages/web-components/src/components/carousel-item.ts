import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
 * `<gh-carousel-item>` — a single slide inside a `<gh-carousel>`.
 *
 * Defaults to one-slide-per-view (`flex: 0 0 100%`) and snaps to the start of
 * the scroll-snap track. Exposes the ARIA APG carousel-slide semantics
 * (`role="group"` + `aria-roledescription="slide"`). Override `flex-basis` via
 * inline style to show several slides at once.
 */
@customElement('gh-carousel-item')
export class GhCarouselItem extends LitElement {
  static override styles = css`
    :host {
      display: block;
      flex: 0 0 100%;
      min-width: 0;
      min-height: 0;
      box-sizing: border-box;
      scroll-snap-align: start;
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'group');
    }
    if (!this.hasAttribute('aria-roledescription')) {
      this.setAttribute('aria-roledescription', 'slide');
    }
  }

  protected override render(): unknown {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-carousel-item': GhCarouselItem;
  }
}

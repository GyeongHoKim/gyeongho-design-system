import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * `<gh-aspect-ratio>` — a layout primitive that constrains its content to a
 * fixed width-to-height ratio using the native CSS `aspect-ratio` property.
 *
 * Purely structural: it owns no design values and paints nothing, so there is
 * no sketch layer (it extends `LitElement`, not `SketchyBase`). Size a single
 * child to `width: 100%; height: 100%` (e.g. an `<img>` with `object-fit: cover`)
 * to fill the ratio box.
 */
@customElement('gh-aspect-ratio')
export class GhAspectRatio extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
      overflow: hidden;
    }
  `;

  /**
   * Desired width-to-height ratio, e.g. `16 / 9` for widescreen media or `1`
   * for a square. Defaults to `1`.
   */
  @property({ type: Number }) ratio = 1;

  protected override updated(): void {
    this.style.aspectRatio = String(this.ratio);
  }

  protected override render(): unknown {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-aspect-ratio': GhAspectRatio;
  }
}

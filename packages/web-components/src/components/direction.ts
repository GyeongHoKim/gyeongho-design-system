import { css, html, LitElement, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/** Reading direction of the UI. */
export type GhDirectionValue = 'ltr' | 'rtl';

/**
 * `<gh-direction>` — propagates a reading direction (`ltr` / `rtl`) to its
 * slotted subtree by mirroring the value onto the host's own `dir` attribute,
 * so descendant GHDS components and CSS logical properties resolve against it.
 *
 * Behavioral only — it renders no visible box and owns no design values, so
 * there is no sketch layer (it extends `LitElement`, not `SketchyBase`).
 */
@customElement('gh-direction')
export class GhDirection extends LitElement {
  static override styles = css`
    :host {
      display: contents;
    }
  `;

  /** Reading direction applied to the slotted subtree. Defaults to `'ltr'`. */
  @property({ type: String, reflect: true }) override dir: GhDirectionValue = 'ltr';

  protected override updated(changed: PropertyValues): void {
    if (changed.has('dir')) {
      // Mirror onto the actual DOM attribute so logical properties inherit it.
      this.setAttribute('dir', this.dir);
    }
  }

  protected override render(): unknown {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-direction': GhDirection;
  }
}

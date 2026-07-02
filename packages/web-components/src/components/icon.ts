import { ICON_VIEWBOX, type IconName, iconPaths, iconSeed } from '@ghds/icons';
import { path } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, LitElement, nothing, svg } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/** Semantic icon size, mapped to `sys.icon.size.*` tokens via CSS. */
export type GhIconSize = 'sm' | 'md' | 'lg';

/**
 * `<gh-icon>` — a hand-drawn icon.
 *
 * The path geometry is the single source of truth in `@ghds/icons`; it is
 * sketched at render time by `@ghds/sketch-core` (so it matches the rest of
 * GHDS) and sized from `sys.icon.size` tokens. The seed is derived from the icon
 * name, so every instance of an icon looks identical. Colours come from
 * `currentColor` (defaulting to `sys.color.icon.default`), so an icon adopts its
 * context's colour just like text.
 */
@customElement('gh-icon')
export class GhIcon extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      color: var(--sys-color-icon-default);
    }

    svg {
      display: block;
      width: var(--sys-icon-size-md);
      height: var(--sys-icon-size-md);
    }

    :host([size='sm']) svg {
      width: var(--sys-icon-size-sm);
      height: var(--sys-icon-size-sm);
    }

    :host([size='lg']) svg {
      width: var(--sys-icon-size-lg);
      height: var(--sys-icon-size-lg);
    }

    path {
      fill: none;
      stroke: currentColor;
      stroke-width: var(--sys-border-width-default);
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `;

  /** Which icon to render (a key of `@ghds/icons`). */
  @property() name!: IconName;

  /** Size role. Defaults to `'md'`. */
  @property({ reflect: true }) size: GhIconSize = 'md';

  /**
   * Accessible name. When set, the icon is exposed as an image with this label;
   * otherwise it is decorative and hidden from assistive tech.
   */
  @property() label?: string;

  protected override render(): unknown {
    const d = iconPaths[this.name];
    if (d === undefined) {
      return nothing;
    }
    const drawable = path(d, {
      roughness: tokens.sys.sketch.roughness,
      bowing: tokens.sys.sketch.bowing,
      seed: iconSeed(this.name),
    });
    return html`<svg
      viewBox="0 0 ${ICON_VIEWBOX} ${ICON_VIEWBOX}"
      fill="none"
      role=${this.label ? 'img' : nothing}
      aria-label=${this.label ?? nothing}
      aria-hidden=${this.label ? nothing : 'true'}
      focusable="false"
    >
      ${this.label ? svg`<title>${this.label}</title>` : nothing}
      ${drawable.strokePaths.map((pd) => svg`<path d=${pd}></path>`)}
    </svg>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-icon': GhIcon;
  }
}

import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

/**
 * `<gh-sidebar>` — a hand-drawn collapsible navigation shell.
 *
 * A `<nav>` region with `header`, default (navigation) and `footer` slots and a
 * built-in collapse toggle. `collapsed` narrows it to an icon rail and is
 * reflected so slotted content can restyle via `:host([collapsed])`; toggling
 * dispatches a `toggle` `CustomEvent<boolean>`. Expanded width comes from
 * `comp.sidebar.width` (override with the `--gh-sidebar-width` custom property).
 * The frame is a sketchy, solid box (`@ghds/sketch-core`). Colours and sketch
 * parameters come from `@ghds/tokens` (`comp.sidebar.*`).
 */
@customElement('gh-sidebar')
export class GhSidebar extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        height: 100%;
        /*
         * Consumers may override --gh-sidebar-width. The comp.sidebar.width
         * token currently resolves to 0 (it aliases sys.breakpoint.mobile,
         * which is 0px), so we fall back to a usable panel width instead of the
         * token until it is corrected upstream. Sidebar width is layout geometry
         * (cf. gh-sheet's 24rem panel), not a themeable design value.
         */
        width: var(--gh-sidebar-width, 16rem);
        color: var(--comp-sidebar-stroke);
        transition: width var(--sys-animation-duration-fast) var(--sys-animation-easing-standard);
      }

      :host([collapsed]) {
        width: var(--sys-spacing-2xl);
      }

      @media (prefers-reduced-motion: reduce) {
        :host {
          transition: none;
        }
      }

      nav {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: var(--sys-spacing-sm);
        box-sizing: border-box;
        height: 100%;
        padding: var(--comp-sidebar-padding);
        color: var(--comp-sidebar-text);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
      }

      .bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--sys-spacing-sm);
      }

      :host([collapsed]) .bar {
        justify-content: center;
      }

      .toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.75rem;
        height: 1.75rem;
        border: none;
        border-radius: var(--sys-radius-sm);
        background: transparent;
        color: inherit;
        cursor: pointer;
      }

      .toggle:hover {
        background: var(--comp-sidebar-item-hover);
      }

      .content {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
      }

      :host([collapsed]) .header,
      :host([collapsed]) .footer {
        display: none;
      }

      .sketch-fill {
        fill: var(--comp-sidebar-bg);
        stroke: none;
      }
    `,
  ];

  /** Collapsed (icon-rail) state. */
  @property({ type: Boolean, reflect: true }) collapsed = false;
  /** Accessible label for the navigation region. */
  @property({ type: String }) label = 'Sidebar';

  @query('nav') private navEl?: HTMLElement;

  protected override get frame(): HTMLElement {
    return this.navEl ?? this;
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('collapsed')) {
      this.measure();
    }
  }

  private toggle(): void {
    this.collapsed = !this.collapsed;
    this.dispatchEvent(
      new CustomEvent('toggle', { detail: this.collapsed, bubbles: true, composed: true }),
    );
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.sidebar.sketch.roughness,
      bowing: tokens.comp.sidebar.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override render(): unknown {
    return html`<nav aria-label=${this.label || nothing}>
      ${this.renderSketch()}
      <div class="bar">
        <div class="header"><slot name="header"></slot></div>
        <button
          class="toggle"
          type="button"
          aria-label=${this.collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded=${this.collapsed ? 'false' : 'true'}
          @click=${() => this.toggle()}
        >
          ${this.collapsed ? '›' : '‹'}
        </button>
      </div>
      <div class="content"><slot></slot></div>
      <div class="footer"><slot name="footer"></slot></div>
    </nav>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-sidebar': GhSidebar;
  }
}

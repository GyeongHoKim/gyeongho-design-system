import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

/** A leaf navigation link. */
export interface GhNavigationLink {
  label: string;
  href: string;
  description?: string;
}

/** A top-level navigation item: a direct link or a group with a dropdown. */
export interface GhNavigationItem {
  label: string;
  href?: string;
  children?: GhNavigationLink[];
}

let navigationMenuUid = 0;

/**
 * `<gh-navigation-menu>` — a hand-drawn site navigation bar.
 *
 * Renders a `role="navigation"` row of links; items with `children` open a
 * shared floating panel of sub-links on hover / click, positioned with
 * `@floating-ui/dom` and drawn as a sketchy, solid box (`@ghds/sketch-core`).
 * Arrow Left/Right rove the top-level items, Escape closes. Colours and sketch
 * parameters come from `@ghds/tokens` (`comp.navigationMenu.*`).
 */
@customElement('gh-navigation-menu')
export class GhNavigationMenu extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: block;
        color: var(--comp-navigationMenu-stroke);
      }

      .list {
        display: inline-flex;
        align-items: center;
        gap: var(--sys-spacing-xs);
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .top {
        display: inline-flex;
        align-items: center;
        gap: var(--sys-spacing-xs);
        box-sizing: border-box;
        margin: 0;
        padding: var(--comp-navigationMenu-padding);
        border: none;
        border-radius: var(--comp-navigationMenu-radius);
        background: transparent;
        color: var(--comp-navigationMenu-text-default);
        font-family: var(--sys-typography-label-fontFamily);
        font-size: var(--sys-typography-label-fontSize);
        font-weight: var(--sys-typography-label-fontWeight);
        line-height: var(--sys-typography-label-lineHeight);
        text-decoration: none;
        cursor: pointer;
      }

      .top:hover {
        background: var(--comp-navigationMenu-item-hover);
      }

      .top:focus-visible {
        outline: var(--sys-border-width-thick) solid var(--comp-navigationMenu-stroke);
        outline-offset: var(--sys-spacing-xs);
      }

      .panel {
        position: fixed;
        left: 0;
        top: 0;
        z-index: var(--sys-zIndex-popover, var(--sys-zIndex-dropdown));
        display: none;
        box-sizing: border-box;
        min-width: 14rem;
        padding: var(--comp-navigationMenu-padding);
        color: var(--comp-navigationMenu-text-default);
      }

      .panel.open {
        display: block;
      }

      .links {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: var(--sys-spacing-xs);
      }

      .link {
        display: flex;
        flex-direction: column;
        padding: var(--sys-spacing-xs) var(--sys-spacing-sm);
        border-radius: var(--sys-radius-sm);
        color: var(--comp-navigationMenu-text-default);
        text-decoration: none;
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
      }

      .link:hover {
        background: var(--comp-navigationMenu-item-hover);
        color: var(--comp-navigationMenu-text-active);
      }

      .link .desc {
        color: var(--sys-color-text-secondary);
        font-size: var(--sys-typography-caption-fontSize);
      }

      .sketch-fill {
        fill: var(--comp-navigationMenu-bg);
        stroke: none;
      }
    `,
  ];

  /** The navigation items. */
  @property({ attribute: false }) items: GhNavigationItem[] = [];
  /** Accessible label for the navigation region. */
  @property({ type: String }) label = '';

  @state() private activeIndex = -1;

  @query('.panel') private panelEl?: HTMLElement;

  private readonly uid = `gh-navigation-menu-${navigationMenuUid++}`;
  private cleanupAutoUpdate?: () => void;
  private triggers: HTMLElement[] = [];

  protected override get frame(): HTMLElement {
    return this.panelEl ?? this;
  }

  override disconnectedCallback(): void {
    this.cleanupAutoUpdate?.();
    document.removeEventListener('pointerdown', this.onPointerDown);
    super.disconnectedCallback();
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (!event.composedPath().includes(this)) {
      this.close();
    }
  };

  private async openAt(index: number, trigger: HTMLElement): Promise<void> {
    this.activeIndex = index;
    document.addEventListener('pointerdown', this.onPointerDown);
    await this.updateComplete;
    const panel = this.panelEl;
    if (panel) {
      this.cleanupAutoUpdate?.();
      this.cleanupAutoUpdate = autoUpdate(trigger, panel, () => {
        computePosition(trigger, panel, {
          strategy: 'fixed',
          placement: 'bottom-start',
          middleware: [
            offset(Number.parseFloat(tokens.sys.spacing.xs)),
            flip(),
            shift({ padding: Number.parseFloat(tokens.sys.spacing.sm) }),
          ],
        }).then(({ x, y }) => {
          panel.style.left = `${x}px`;
          panel.style.top = `${y}px`;
          this.measure();
        });
      });
    }
  }

  private close(): void {
    this.activeIndex = -1;
    this.cleanupAutoUpdate?.();
    this.cleanupAutoUpdate = undefined;
    document.removeEventListener('pointerdown', this.onPointerDown);
  }

  private readonly onKeydown = (event: KeyboardEvent): void => {
    this.triggers = [...(this.shadowRoot?.querySelectorAll<HTMLElement>('.top') ?? [])];
    const current = this.triggers.findIndex((el) => el === this.shadowRoot?.activeElement);
    if (event.key === 'Escape') {
      this.close();
      return;
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }
    if (current === -1 || this.triggers.length === 0) {
      return;
    }
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const next = (current + direction + this.triggers.length) % this.triggers.length;
    this.triggers[next]?.focus();
  };

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.navigationMenu.sketch.roughness,
      bowing: tokens.comp.navigationMenu.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override render(): unknown {
    const active = this.activeIndex >= 0 ? this.items[this.activeIndex] : undefined;
    const panelId = `${this.uid}-panel`;
    return html`<nav aria-label=${this.label || nothing} @keydown=${this.onKeydown}>
      <ul class="list">
        ${this.items.map((item, index) => {
          if (item.children && item.children.length > 0) {
            return html`<li>
              <button
                class="top"
                type="button"
                aria-haspopup="true"
                aria-expanded=${this.activeIndex === index ? 'true' : 'false'}
                aria-controls=${panelId}
                @click=${(e: MouseEvent) =>
                  this.activeIndex === index
                    ? this.close()
                    : this.openAt(index, e.currentTarget as HTMLElement)}
                @mouseenter=${(e: MouseEvent) => this.openAt(index, e.currentTarget as HTMLElement)}
              >
                ${item.label}
              </button>
            </li>`;
          }
          return html`<li>
            <a class="top" href=${item.href ?? '#'} @mouseenter=${() => this.close()}
              >${item.label}</a
            >
          </li>`;
        })}
      </ul>
      <div
        class=${active ? 'panel open' : 'panel'}
        id=${panelId}
        role="menu"
        @mouseleave=${() => this.close()}
      >
        ${this.renderSketch()}
        <div class="links">
          ${(active?.children ?? []).map(
            (link) => html`<a class="link" role="menuitem" href=${link.href}>
              <span>${link.label}</span>
              ${link.description ? html`<span class="desc">${link.description}</span>` : nothing}
            </a>`,
          )}
        </div>
      </div>
    </nav>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-navigation-menu': GhNavigationMenu;
  }
}

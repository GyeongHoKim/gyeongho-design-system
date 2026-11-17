import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { anchorMenuPanel } from '../floating.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

/** One navigation link in a `gh-nav-menu` panel. */
export interface GhNavMenuItem {
  /** Link target. Rendered as a real `<a href>`. */
  href: string;
  /** Visible link text. */
  label: string;
}

let navMenuUid = 0;

/**
 * Strip query / hash and trailing slashes so paths compare cleanly. A hash- or
 * query-only href (`#`, `#section`, `?tab=x`) has no path to compare and
 * returns `null`, so it never matches the current page.
 */
function normalizePath(path: string): string | null {
  // String scans instead of `/[?#].*$/` and `/\/+$/`, which backtrack
  // polynomially on long runs of `#` or `/`.
  const cut = path.search(/[?#]/);
  const bare = cut === -1 ? path : path.slice(0, cut);
  if (bare === '') {
    return null;
  }
  let end = bare.length;
  while (end > 0 && bare[end - 1] === '/') {
    end--;
  }
  return bare.slice(0, end) || '/';
}

/**
 * `<gh-nav-menu>` — a hand-drawn site-navigation dropdown.
 *
 * A disclosure, not an action menu: a `<button aria-expanded aria-controls>`
 * trigger shows / hides a floating panel holding a plain list (`<ul>` / `<li>`)
 * of real `<a href>` links, so every entry keeps native link behaviour (open in
 * new tab, copy link address, crawlability). There is deliberately **no**
 * `role="menu"` / `role="menuitem"` anywhere — those roles are for command
 * sets (ARIA APG), use `gh-menu` for actions.
 *
 * Keyboard: Enter / Space on the trigger toggle the panel; ArrowDown / ArrowUp
 * on the trigger open it and focus the first / last link; Tab moves through
 * the links natively, and ArrowDown / ArrowUp / Home / End also move between
 * them; Escape closes and returns focus to the trigger. Clicking outside or
 * tabbing out of the component closes it.
 *
 * Set `current` to the active page's path to mark it: the link whose `href`
 * matches exactly gets `aria-current="page"`, and the trigger is underlined
 * when any link is the current path or an ancestor of it (`/components/` on
 * `/components/button/`). Query strings, hashes and trailing slashes are
 * ignored when comparing. Positioned with `@floating-ui/dom`;
 * colours and sketch parameters come from `comp.menu.*` (the same visual
 * family as `gh-menu`).
 */
@customElement('gh-nav-menu')
export class GhNavMenu extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: inline-block;
        color: var(--comp-menu-trigger-stroke-default);
      }

      .trigger {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: var(--sys-spacing-xs);
        box-sizing: border-box;
        margin: 0;
        padding: var(--comp-menu-trigger-padding-vertical) var(--comp-menu-trigger-padding-horizontal);
        border: none;
        background: transparent;
        color: var(--comp-menu-trigger-text-default);
        font-family: var(--sys-typography-label-fontFamily);
        font-size: var(--sys-typography-label-fontSize);
        font-weight: var(--sys-typography-label-fontWeight);
        line-height: var(--sys-typography-label-lineHeight);
        cursor: pointer;
      }

      .trigger:focus-visible {
        outline: var(--sys-border-width-thick) solid var(--comp-menu-trigger-stroke-focus);
        outline-offset: var(--sys-spacing-xs);
      }

      .label {
        position: relative;
      }

      .trigger.current .label {
        text-decoration: underline;
        text-underline-offset: var(--sys-spacing-xs);
      }

      .panel {
        position: fixed;
        left: 0;
        top: 0;
        z-index: var(--comp-menu-panel-zIndex);
        display: none;
        min-width: var(--comp-menu-panel-minWidth);
        box-sizing: border-box;
        padding: var(--comp-menu-panel-padding);
        background: var(--comp-menu-panel-bg);
        border: var(--sys-border-width-default) solid var(--comp-menu-panel-stroke);
        border-radius: var(--comp-menu-panel-radius);
        box-shadow: var(--comp-menu-panel-shadow);
      }

      .panel.open {
        display: block;
      }

      .list {
        display: flex;
        flex-direction: column;
        gap: var(--comp-menu-panel-gap);
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .list-item {
        display: flex;
        flex-direction: column;
      }

      .link {
        display: flex;
        align-items: center;
        padding: var(--comp-menu-item-padding-vertical) var(--comp-menu-item-padding-horizontal);
        border-radius: var(--comp-menu-item-radius);
        color: var(--comp-menu-item-text-default);
        background: var(--comp-menu-item-bg-default);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        text-decoration: none;
        cursor: pointer;
      }

      .link:hover,
      .link:focus-visible {
        background: var(--comp-menu-item-bg-highlighted);
      }

      .link:focus-visible {
        outline: var(--sys-border-width-thick) solid var(--comp-menu-trigger-stroke-focus);
        outline-offset: 0;
      }

      .link[aria-current='page'] {
        font-weight: var(--sys-typography-label-fontWeight);
        text-decoration: underline;
        text-underline-offset: var(--sys-spacing-xs);
      }
    `,
  ];

  /** Panel links (property only — `attribute: false`, like `gh-menu`'s `items`). */
  @property({ attribute: false }) items: GhNavMenuItem[] = [];
  /** Trigger text. Slotted content, when given, replaces it visually. */
  @property({ type: String }) label = '';
  /** The active page's path; marks the matching link (see class docs). */
  @property({ type: String }) current = '';

  @state() private open = false;

  @query('.trigger') private triggerEl?: HTMLButtonElement;
  @query('.panel') private panelEl?: HTMLElement;

  private readonly uid = `gh-nav-menu-${navMenuUid++}`;
  private cleanupAutoUpdate?: () => void;

  protected override get frame(): HTMLElement {
    return this.triggerEl ?? this;
  }

  override disconnectedCallback(): void {
    // Reset to closed so a reattached element does not render an open panel
    // with no outside-click / focusout listeners or autoUpdate behind it.
    this.open = false;
    this.stopListening();
    super.disconnectedCallback();
  }

  /** True when `href` is exactly the current path. */
  private isExactCurrent(href: string): boolean {
    if (this.current === '') {
      return false;
    }
    const cur = normalizePath(this.current);
    return cur !== null && cur === normalizePath(href);
  }

  /** True when the current path is `href` or a descendant of it. */
  private containsCurrent(href: string): boolean {
    if (this.current === '') {
      return false;
    }
    const cur = normalizePath(this.current);
    const base = normalizePath(href);
    if (cur === null || base === null) {
      return false;
    }
    return cur === base || cur.startsWith(`${base}/`);
  }

  private links(): HTMLAnchorElement[] {
    return [...(this.panelEl?.querySelectorAll<HTMLAnchorElement>('.link') ?? [])];
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (!event.composedPath().includes(this)) {
      this.close(false);
    }
  };

  private readonly onFocusOut = (event: FocusEvent): void => {
    // Close when focus leaves the component (e.g. Tab past the last link).
    // A null relatedTarget (focus dropped onto a non-focusable area) is left
    // to the outside-pointerdown handler so clicks on the panel padding do
    // not close it.
    const next = event.relatedTarget;
    if (next instanceof Node && next !== this && !this.contains(next)) {
      if (!this.shadowRoot?.contains(next)) {
        this.close(false);
      }
    }
  };

  private stopListening(): void {
    this.cleanupAutoUpdate?.();
    this.cleanupAutoUpdate = undefined;
    document.removeEventListener('pointerdown', this.onPointerDown);
    this.removeEventListener('focusout', this.onFocusOut);
  }

  /** Open the panel, optionally moving focus to the first / last link. */
  private async show(focus?: 'first' | 'last'): Promise<void> {
    if (!this.open) {
      this.open = true;
      document.addEventListener('pointerdown', this.onPointerDown);
      this.addEventListener('focusout', this.onFocusOut);
      await this.updateComplete;
      // close() or a disconnect may have run during the await; anchoring now
      // would leak autoUpdate listeners that stopListening() already skipped.
      if (!this.open || !this.isConnected) {
        return;
      }
      const trigger = this.triggerEl;
      const panel = this.panelEl;
      if (trigger && panel) {
        this.cleanupAutoUpdate?.();
        this.cleanupAutoUpdate = anchorMenuPanel(trigger, panel);
      }
    }
    if (focus) {
      const links = this.links();
      (focus === 'first' ? links[0] : links[links.length - 1])?.focus();
    }
  }

  private close(restoreFocus = true): void {
    if (!this.open) {
      return;
    }
    this.open = false;
    this.stopListening();
    if (restoreFocus) {
      this.triggerEl?.focus();
    }
  }

  private readonly onTriggerKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      void this.show('first');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      void this.show('last');
    } else if (event.key === 'Escape' && this.open) {
      // Dismiss only this disclosure, not an enclosing dialog as well.
      event.preventDefault();
      event.stopPropagation();
      this.close();
    }
  };

  private readonly onPanelKeydown = (event: KeyboardEvent): void => {
    const links = this.links();
    const activeIndex = links.indexOf(this.shadowRoot?.activeElement as HTMLAnchorElement);
    let next: HTMLAnchorElement | undefined;
    switch (event.key) {
      case 'ArrowDown':
        next = links[(activeIndex + 1) % links.length];
        break;
      case 'ArrowUp':
        next = links[(activeIndex - 1 + links.length) % links.length];
        break;
      case 'Home':
        next = links[0];
        break;
      case 'End':
        next = links[links.length - 1];
        break;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        this.close();
        return;
      default:
        return;
    }
    event.preventDefault();
    next?.focus();
  };

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.menu.sketch.roughness,
      bowing: tokens.comp.menu.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override render(): unknown {
    const panelId = `${this.uid}-panel`;
    const groupCurrent = this.items.some((item) => this.containsCurrent(item.href));
    return html`<button
        class=${groupCurrent ? 'trigger current' : 'trigger'}
        id=${this.uid}
        type="button"
        aria-expanded=${this.open ? 'true' : 'false'}
        aria-controls=${panelId}
        @click=${() => (this.open ? this.close(false) : this.show())}
        @keydown=${this.onTriggerKeydown}
      >
        ${this.renderSketch()}
        <span class="label"><slot>${this.label}</slot></span>
      </button>
      <div
        class=${this.open ? 'panel open' : 'panel'}
        id=${panelId}
        @keydown=${this.onPanelKeydown}
      >
        <ul class="list">
          ${this.items.map(
            (item) =>
              html`<li class="list-item">
                <a
                  class="link"
                  href=${item.href}
                  aria-current=${ifDefined(this.isExactCurrent(item.href) ? 'page' : undefined)}
                  @click=${() => this.close(false)}
                  >${item.label}</a
                >
              </li>`,
          )}
        </ul>
      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-nav-menu': GhNavMenu;
  }
}

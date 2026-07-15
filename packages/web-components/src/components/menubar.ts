import { css, html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import type { GhMenu, GhMenuItem } from './menu.js';
import './menu.js';

export type { GhMenuItem };

/** One top-level menubar entry with its own dropdown. */
export interface GhMenubarMenu {
  label: string;
  items: GhMenuItem[];
  disabled?: boolean;
}

/** Detail of the `menu-select` event: which menu, which item. */
export interface GhMenubarSelectDetail {
  menu: string;
  value: string;
}

/**
 * `<gh-menubar>` — a hand-drawn application menu bar.
 *
 * Renders a `role="menubar"` row of `<gh-menu>` dropdowns (reused). Arrow
 * Left/Right roves focus between the top-level triggers. Re-emits child menu
 * selections as a `menu-select` `CustomEvent<GhMenubarSelectDetail>`. Colours
 * and sketch parameters come from `@ghds/tokens` (`comp.menubar.*` /
 * `comp.menu.*`).
 */
@customElement('gh-menubar')
export class GhMenubar extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
      color: var(--comp-menubar-text);
    }

    .bar {
      display: inline-flex;
      align-items: center;
      gap: var(--comp-menubar-padding);
      box-sizing: border-box;
      padding: var(--comp-menubar-padding);
    }
  `;

  /** The top-level menus. */
  @property({ attribute: false }) menus: GhMenubarMenu[] = [];
  /** Accessible label for the menubar. */
  @property({ type: String }) label = '';

  @query('.bar') private barEl?: HTMLElement;

  private readonly internals: ElementInternals = this.attachInternals();

  protected override updated(): void {
    this.internals.role = 'menubar';
    this.internals.ariaLabel = this.label || null;
  }

  private focusTrigger(menuEl: Element | null | undefined): void {
    (menuEl as GhMenu | null)?.shadowRoot?.querySelector<HTMLElement>('.trigger')?.focus();
  }

  private readonly onKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }
    const triggers = [...(this.barEl?.querySelectorAll<GhMenu>('gh-menu') ?? [])];
    const active = this.shadowRoot?.activeElement;
    const current = triggers.indexOf(active as GhMenu);
    if (current === -1 || triggers.length === 0) {
      return;
    }
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const next = (current + direction + triggers.length) % triggers.length;
    this.focusTrigger(triggers[next]);
  };

  private readonly onSelect =
    (menu: string) =>
    (event: Event): void => {
      event.stopPropagation();
      this.dispatchEvent(
        new CustomEvent<GhMenubarSelectDetail>('menu-select', {
          detail: { menu, value: (event as CustomEvent<string>).detail },
          bubbles: true,
          composed: true,
        }),
      );
    };

  protected override render(): unknown {
    return html`<div class="bar" @keydown=${this.onKeydown}>
      ${this.menus.map(
        (menu) => html`<gh-menu
          .items=${menu.items}
          .label=${menu.label}
          ?disabled=${menu.disabled ?? false}
          @select=${this.onSelect(menu.label)}
        ></gh-menu>`,
      )}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-menubar': GhMenubar;
  }
}

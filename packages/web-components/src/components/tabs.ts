import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './tab.js';

/** One tab and its panel content. */
export interface GhTabItem {
  value: string;
  label: string;
  /** Panel text. For rich content, render your own panel and use the events. */
  content?: string;
  disabled?: boolean;
}

let tabsUid = 0;

/**
 * `<gh-tabs>` — a hand-drawn tabbed interface (WAI-ARIA Tabs pattern).
 *
 * Renders a `role="tablist"` of `<gh-tab>` buttons driving `role="tabpanel"`
 * regions. Arrow / Home / End move between and activate tabs via roving
 * tabindex. Dispatches a `value-change` `CustomEvent<string>` on selection.
 */
@customElement('gh-tabs')
export class GhTabs extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .tablist {
      display: flex;
      flex-wrap: wrap;
      gap: var(--comp-tabs-gap);
    }

    .panel {
      margin-top: var(--sys-spacing-md);
      font-family: var(--sys-typography-body-fontFamily);
      font-size: var(--sys-typography-body-fontSize);
      line-height: var(--sys-typography-body-lineHeight);
      color: var(--sys-color-text-primary);
    }
  `;

  /** The tabs and their panels. */
  @property({ attribute: false }) items: GhTabItem[] = [];
  /** Controlled active value. */
  @property({ type: String }) value?: string;
  /** Accessible name for the tablist. */
  @property({ type: String }) label = '';

  @state() private internalValue?: string;

  private readonly uid = `gh-tabs-${tabsUid++}`;

  private get current(): string | undefined {
    const requested = this.value ?? this.internalValue;
    if (requested !== undefined && this.items.some((i) => i.value === requested && !i.disabled)) {
      return requested;
    }
    // Fall back to the first enabled tab so the tablist stays reachable when the
    // first tab is disabled or `items` changed out from under a stale selection.
    return this.items.find((i) => !i.disabled)?.value ?? this.items[0]?.value;
  }

  private select(next: string): void {
    if (this.value === undefined) {
      this.internalValue = next;
    }
    this.dispatchEvent(
      new CustomEvent('value-change', { detail: next, bubbles: true, composed: true }),
    );
  }

  private readonly handleSelect = (event: Event): void => {
    this.select((event as CustomEvent<string>).detail);
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    const enabled = this.items.map((item, i) => ({ item, i })).filter((x) => !x.item.disabled);
    // Key navigation off the *focused* tab (not the selected one) so it advances
    // correctly even in controlled mode when `value` is not synced back.
    const tabEls: Element[] = [...(this.shadowRoot?.querySelectorAll('gh-tab') ?? [])];
    const active = this.shadowRoot?.activeElement ?? null;
    const focusedIndex = active ? tabEls.indexOf(active) : -1;
    const currentIndex =
      focusedIndex === -1
        ? this.items.findIndex((item) => item.value === this.current)
        : focusedIndex;
    const pos = enabled.findIndex((x) => x.i === currentIndex);
    if (pos === -1 || enabled.length === 0) {
      return;
    }
    let nextPos = pos;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextPos = (pos + 1) % enabled.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextPos = (pos - 1 + enabled.length) % enabled.length;
        break;
      case 'Home':
        nextPos = 0;
        break;
      case 'End':
        nextPos = enabled.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const next = enabled[nextPos];
    if (!next) {
      return;
    }
    this.select(next.item.value);
    this.updateComplete.then(() => {
      const tabEls = this.shadowRoot?.querySelectorAll('gh-tab');
      const el = tabEls?.[next.i] as { focusTab?: () => void } | undefined;
      el?.focusTab?.();
    });
  };

  protected override render(): unknown {
    const current = this.current;
    return html`
      <div
        role="tablist"
        aria-label=${this.label}
        class="tablist"
        @keydown=${this.handleKeydown}
        @tab-select=${this.handleSelect}
      >
        ${this.items.map(
          (item) => html`<gh-tab
            .value=${item.value}
            .tabId=${`${this.uid}-tab-${item.value}`}
            .panelId=${`${this.uid}-panel-${item.value}`}
            ?selected=${item.value === current}
            ?disabled=${item.disabled ?? false}
            .tabbable=${item.value === current}
            >${item.label}</gh-tab
          >`,
        )}
      </div>
      ${this.items.map((item) => {
        const selected = item.value === current;
        return html`<div
          class="panel"
          role="tabpanel"
          id=${`${this.uid}-panel-${item.value}`}
          aria-labelledby=${`${this.uid}-tab-${item.value}`}
          tabindex="0"
          ?hidden=${!selected}
        >
          ${selected ? (item.content ?? '') : ''}
        </div>`;
      })}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-tabs': GhTabs;
  }
}

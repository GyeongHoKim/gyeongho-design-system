import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './accordion-item.js';

/** One collapsible section's data. */
export interface GhAccordionItemData {
  value: string;
  label: string;
  /** Revealed text. For rich content, render your own item and use the events. */
  content?: string;
  disabled?: boolean;
}

let accordionUid = 0;

const NAV_KEYS = new Set(['ArrowDown', 'ArrowUp', 'Home', 'End']);

/**
 * `<gh-accordion>` — a hand-drawn accordion (disclosure pattern).
 *
 * Composes `<gh-accordion-item>` sections. `type="single"` keeps at most one
 * open; `"multiple"` allows many. Arrow / Home / End move focus between headers.
 * Dispatches a `value-change` `CustomEvent<string[]>` (the open values).
 */
@customElement('gh-accordion')
export class GhAccordion extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: var(--comp-accordion-gap);
    }
  `;

  /** The collapsible sections. */
  @property({ attribute: false }) items: GhAccordionItemData[] = [];
  /** `'single'` keeps at most one open; `'multiple'` allows many. */
  @property({ type: String }) type: 'single' | 'multiple' = 'single';
  /** Controlled set of open values. */
  @property({ attribute: false }) value?: string[];

  @state() private internalValue: string[] = [];

  private readonly uid = `gh-accordion-${accordionUid++}`;

  private get open(): string[] {
    return this.value ?? this.internalValue;
  }

  private setOpen(next: string[]): void {
    if (this.value === undefined) {
      this.internalValue = next;
    }
    this.dispatchEvent(
      new CustomEvent('value-change', { detail: next, bubbles: true, composed: true }),
    );
  }

  private toggle(itemValue: string): void {
    const isOpen = this.open.includes(itemValue);
    if (this.type === 'single') {
      this.setOpen(isOpen ? [] : [itemValue]);
    } else {
      this.setOpen(isOpen ? this.open.filter((v) => v !== itemValue) : [...this.open, itemValue]);
    }
  }

  private readonly handleToggle = (event: Event): void => {
    this.toggle((event as CustomEvent<string>).detail);
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (!NAV_KEYS.has(event.key)) {
      return;
    }
    const itemEls = [...(this.shadowRoot?.querySelectorAll('gh-accordion-item') ?? [])];
    const enabled = itemEls
      .map((el, i) => ({ el, i }))
      .filter((x) => !(x.el as { disabled?: boolean }).disabled);
    const activeHost = this.shadowRoot?.activeElement;
    const pos = enabled.findIndex((x) => x.el === activeHost);
    if (pos === -1 || enabled.length === 0) {
      return;
    }
    let nextPos = pos;
    switch (event.key) {
      case 'ArrowDown':
        nextPos = (pos + 1) % enabled.length;
        break;
      case 'ArrowUp':
        nextPos = (pos - 1 + enabled.length) % enabled.length;
        break;
      case 'Home':
        nextPos = 0;
        break;
      case 'End':
        nextPos = enabled.length - 1;
        break;
    }
    event.preventDefault();
    const next = enabled[nextPos];
    (next?.el as { focusHeader?: () => void } | undefined)?.focusHeader?.();
  };

  protected override render(): unknown {
    const open = this.open;
    return html`<div class="list" @accordion-toggle=${this.handleToggle} @keydown=${this.handleKeydown}>
      ${this.items.map(
        (item) => html`<gh-accordion-item
          .value=${item.value}
          .label=${item.label}
          .content=${item.content ?? ''}
          .headerId=${`${this.uid}-header-${item.value}`}
          .regionId=${`${this.uid}-region-${item.value}`}
          ?open=${open.includes(item.value)}
          ?disabled=${item.disabled ?? false}
        ></gh-accordion-item>`,
      )}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-accordion': GhAccordion;
  }
}

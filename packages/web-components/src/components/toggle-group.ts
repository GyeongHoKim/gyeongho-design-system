import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './toggle.js';

/** One toggle-group item. */
export interface GhToggleGroupItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export type GhToggleGroupType = 'single' | 'multiple';
export type GhToggleGroupOrientation = 'horizontal' | 'vertical';

/**
 * `<gh-toggle-group>` — a set of `<gh-toggle>` buttons with shared selection.
 *
 * `type="single"` keeps at most one pressed; `"multiple"` allows many. Selection
 * is held in `value` (the pressed item values). Dispatches a `value-change`
 * `CustomEvent<string[]>`. Exposes `role="group"` with an optional label. Gap,
 * stroke and radius come from `@ghds/tokens` (`comp.toggleGroup.*`).
 */
@customElement('gh-toggle-group')
export class GhToggleGroup extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      flex-direction: row;
      gap: var(--comp-toggleGroup-gap);
    }

    :host([orientation='vertical']) {
      flex-direction: column;
      align-items: stretch;
    }
  `;

  /** The toggle items. */
  @property({ attribute: false }) items: GhToggleGroupItem[] = [];
  /** Selection mode. */
  @property({ type: String }) type: GhToggleGroupType = 'single';
  /** Layout direction. */
  @property({ type: String, reflect: true }) orientation: GhToggleGroupOrientation = 'horizontal';
  /** Controlled set of pressed values. */
  @property({ attribute: false }) value?: string[];
  /** Accessible group label. */
  @property({ type: String }) label = '';

  @state() private internalValue: string[] = [];

  private readonly internals: ElementInternals = this.attachInternals();

  private get selected(): string[] {
    return this.value ?? this.internalValue;
  }

  protected override updated(): void {
    this.internals.role = 'group';
    this.internals.ariaLabel = this.label || null;
    this.internals.ariaOrientation = this.orientation;
  }

  private setSelected(next: string[]): void {
    if (this.value === undefined) {
      this.internalValue = next;
    }
    this.dispatchEvent(
      new CustomEvent('value-change', { detail: next, bubbles: true, composed: true }),
    );
  }

  private toggleItem(itemValue: string): void {
    const isSelected = this.selected.includes(itemValue);
    if (this.type === 'single') {
      this.setSelected(isSelected ? [] : [itemValue]);
    } else {
      this.setSelected(
        isSelected ? this.selected.filter((v) => v !== itemValue) : [...this.selected, itemValue],
      );
    }
  }

  protected override render(): unknown {
    const selected = this.selected;
    return html`${this.items.map(
      (item) => html`<gh-toggle
        .pressed=${selected.includes(item.value)}
        ?disabled=${item.disabled ?? false}
        .label=${item.label}
        @change=${() => this.toggleItem(item.value)}
        >${item.label}</gh-toggle
      >`,
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-toggle-group': GhToggleGroup;
  }
}

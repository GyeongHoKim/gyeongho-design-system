import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

/** One command-palette entry. */
export interface GhCommandItem {
  value: string;
  label: string;
  group?: string;
  keywords?: string[];
  disabled?: boolean;
}

let commandUid = 0;

/**
 * `<gh-command>` — a hand-drawn command palette (searchable menu).
 *
 * Built on the native `<dialog>` (`showModal()`) for focus trapping and the top
 * layer. A search `<input role="combobox">` filters `items` (by label and
 * `keywords`) into a `role="listbox"`, optionally grouped. Arrow keys move the
 * highlight, Enter runs (dispatches a `command` `CustomEvent<string>`), Escape
 * closes (dispatches `close`). Colours and sketch parameters come from
 * `@ghds/tokens` (`comp.command.*`).
 */
@customElement('gh-command')
export class GhCommand extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        color: var(--comp-command-stroke);
      }

      dialog {
        position: relative;
        box-sizing: border-box;
        width: 100%;
        max-width: 32rem;
        padding: var(--comp-command-padding);
        border: none;
        background: transparent;
        color: var(--comp-command-text-default);
        overflow: visible;
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        line-height: var(--sys-typography-body-lineHeight);
      }

      dialog::backdrop {
        background: var(--sys-color-bg-overlay);
      }

      .search {
        position: relative;
        box-sizing: border-box;
        width: 100%;
        margin: 0 0 var(--sys-spacing-sm);
        padding: var(--sys-spacing-sm);
        border: none;
        border-bottom: var(--sys-border-width-default) solid var(--comp-command-input-stroke);
        outline: none;
        background: transparent;
        color: var(--comp-command-text-default);
        font: inherit;
      }

      .list {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: var(--sys-spacing-xs);
        max-height: 20rem;
        overflow-y: auto;
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .group-label {
        padding: var(--sys-spacing-xs) var(--sys-spacing-sm);
        color: var(--comp-command-text-muted);
        font-size: var(--sys-typography-caption-fontSize);
        text-transform: uppercase;
      }

      .item {
        display: flex;
        align-items: center;
        padding: var(--sys-spacing-xs) var(--sys-spacing-sm);
        border-radius: var(--sys-radius-sm);
        color: var(--comp-command-text-default);
        cursor: pointer;
      }

      .item[aria-disabled='true'] {
        color: var(--sys-color-text-disabled);
        cursor: not-allowed;
      }

      .item.highlighted:not([aria-disabled='true']) {
        background: var(--comp-command-item-hover);
      }

      .empty {
        padding: var(--sys-spacing-md);
        color: var(--comp-command-text-muted);
        text-align: center;
      }

      .sketch-fill {
        fill: var(--comp-command-bg);
        stroke: none;
      }
    `,
  ];

  /** All commands. */
  @property({ attribute: false }) items: GhCommandItem[] = [];
  /** Whether the palette is shown. */
  @property({ type: Boolean, reflect: true }) open = false;
  /** Placeholder for the search field. */
  @property({ type: String }) placeholder = 'Type a command or search…';
  /** Text shown when nothing matches. */
  @property({ type: String }) emptyMessage = 'No results found.';

  @state() private query = '';
  @state() private highlightedValue = '';

  @query('dialog') private dialogEl?: HTMLDialogElement;
  @query('.search') private searchEl?: HTMLInputElement;

  private readonly uid = `gh-command-${commandUid++}`;

  protected override get frame(): HTMLElement {
    return this.dialogEl ?? this;
  }

  private get filtered(): GhCommandItem[] {
    const q = this.query.trim().toLowerCase();
    if (!q) {
      return this.items;
    }
    return this.items.filter((item) => {
      const haystack = [item.label, ...(item.keywords ?? [])].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }

  private enabled(): GhCommandItem[] {
    return this.filtered.filter((item) => !item.disabled);
  }

  private optionId(value: string): string {
    return `${this.uid}-item-${value}`;
  }

  protected override willUpdate(changed: PropertyValues): void {
    // Reset the search state before render (not in `updated`) so opening the
    // palette doesn't schedule a second update.
    if (changed.has('open') && this.open) {
      this.query = '';
      this.highlightedValue = this.enabled()[0]?.value ?? '';
    }
  }

  protected override updated(changed: PropertyValues): void {
    if (!changed.has('open')) {
      return;
    }
    const dialog = this.dialogEl;
    if (!dialog) {
      return;
    }
    if (this.open && !dialog.open) {
      try {
        dialog.showModal();
      } catch {
        dialog.setAttribute('open', '');
      }
      this.measure();
      this.updateComplete.then(() => this.searchEl?.focus());
    } else if (!this.open && dialog.open) {
      dialog.close();
    }
  }

  private requestClose(): void {
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  private moveHighlight(direction: 1 | -1): void {
    const enabled = this.enabled();
    if (enabled.length === 0) {
      return;
    }
    const currentIndex = enabled.findIndex((item) => item.value === this.highlightedValue);
    const nextIndex = (currentIndex + direction + enabled.length) % enabled.length;
    this.highlightedValue = enabled[nextIndex]?.value ?? '';
  }

  private run(value: string): void {
    const item = this.items.find((i) => i.value === value);
    if (!item || item.disabled) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent('command', { detail: value, bubbles: true, composed: true }),
    );
    this.requestClose();
  }

  private readonly onInput = (): void => {
    this.query = this.searchEl?.value ?? '';
    this.highlightedValue = this.enabled()[0]?.value ?? '';
  };

  private readonly onCancel = (event: Event): void => {
    event.preventDefault();
    this.requestClose();
  };

  private readonly onKeydown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveHighlight(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveHighlight(-1);
        break;
      case 'Enter':
        if (this.highlightedValue) {
          event.preventDefault();
          this.run(this.highlightedValue);
        }
        break;
    }
  };

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.command.sketch.roughness,
      bowing: tokens.comp.command.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override render(): unknown {
    const filtered = this.filtered;
    const listId = `${this.uid}-list`;
    let lastGroup: string | undefined;
    return html`<dialog
      aria-label="Command palette"
      @cancel=${this.onCancel}
      @keydown=${this.onKeydown}
    >
      ${this.renderSketch()}
      <input
        class="search"
        type="text"
        role="combobox"
        autocomplete="off"
        aria-autocomplete="list"
        aria-expanded="true"
        aria-controls=${listId}
        aria-activedescendant=${this.highlightedValue ? this.optionId(this.highlightedValue) : nothing}
        placeholder=${this.placeholder}
        .value=${this.query}
        @input=${this.onInput}
      />
      <ul class="list" id=${listId} role="listbox">
        ${
          filtered.length === 0
            ? html`<li class="empty">${this.emptyMessage}</li>`
            : filtered.map((item) => {
                const heading =
                  item.group && item.group !== lastGroup
                    ? html`<li class="group-label" role="presentation">${item.group}</li>`
                    : nothing;
                lastGroup = item.group;
                return html`${heading}<li
                  id=${this.optionId(item.value)}
                  class=${item.value === this.highlightedValue ? 'item highlighted' : 'item'}
                  role="option"
                  aria-selected=${item.value === this.highlightedValue}
                  aria-disabled=${item.disabled ? 'true' : nothing}
                  @click=${() => this.run(item.value)}
                  @mouseenter=${() => {
                    if (!item.disabled) {
                      this.highlightedValue = item.value;
                    }
                  }}
                >
                  ${item.label}
                </li>`;
              })
        }
      </ul>
    </dialog>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-command': GhCommand;
  }
}

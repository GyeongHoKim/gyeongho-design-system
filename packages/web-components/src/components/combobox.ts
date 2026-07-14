import { autoUpdate, computePosition, flip, offset, shift, size } from '@floating-ui/dom';
import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';
import { type GhSelectListbox, type GhSelectOption, getSelectOptionId } from './select-listbox.js';
import './select-listbox.js';

export type { GhSelectOption };

let comboboxUid = 0;

/**
 * `<gh-combobox>` — a hand-drawn searchable select (autocomplete).
 *
 * A real `<input role="combobox">` filters the supplied `options` as the user
 * types and reveals a floating `<gh-select-listbox>` (reused from `gh-select`).
 * Arrow keys move the highlight, Enter selects, Escape closes. Form-associated
 * (submits `value` under `name`). Colours, padding and sketch parameters come
 * from `@ghds/tokens` (`comp.combobox.*`).
 */
@customElement('gh-combobox')
export class GhCombobox extends SketchyBase {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...SketchyBase.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: inline-block;
        color: var(--comp-combobox-stroke-default);
      }

      :host([disabled]) {
        opacity: var(--sys-opacity-disabled, 0.5);
      }

      .field {
        position: relative;
        box-sizing: border-box;
        display: inline-flex;
        width: 100%;
      }

      :host(:focus-within) {
        color: var(--comp-combobox-stroke-focus);
      }

      input {
        position: relative;
        box-sizing: border-box;
        width: 100%;
        margin: 0;
        padding: var(--comp-combobox-padding-vertical) var(--comp-combobox-padding-horizontal);
        border: none;
        outline: none;
        background: transparent;
        color: var(--comp-combobox-text);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        line-height: var(--sys-typography-body-lineHeight);
      }

      input:disabled {
        cursor: not-allowed;
      }

      .sketch-fill {
        fill: var(--comp-combobox-bg);
        stroke: none;
      }
    `,
  ];

  /** All selectable options. */
  @property({ type: Array }) options: GhSelectOption[] = [];
  /** Current selected value. Mirrored to the form value. */
  @property({ type: String, reflect: true }) value = '';
  /** Submitted control name. */
  @property({ type: String }) name = '';
  /** Placeholder shown in the empty input. */
  @property({ type: String }) placeholder = '';
  /** Accessible name for the input. */
  @property({ type: String }) label = '';
  /** Disables interaction and form participation. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  @state() private open = false;
  @state() private query = '';
  @state() private highlightedValue = '';

  @query('.field') private fieldEl!: HTMLElement;
  @query('input') private inputEl!: HTMLInputElement;
  @query('gh-select-listbox') private listboxEl!: GhSelectListbox;

  private readonly internals: ElementInternals = this.attachInternals();
  private readonly comboId = `gh-combobox-${++comboboxUid}`;
  private cleanupAutoUpdate?: () => void;

  protected override get frame(): HTMLElement {
    return this.fieldEl ?? this;
  }

  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  private get filtered(): GhSelectOption[] {
    const q = this.query.trim().toLowerCase();
    if (!q) {
      return this.options;
    }
    return this.options.filter((option) => option.label.toLowerCase().includes(q));
  }

  private enabled(): GhSelectOption[] {
    return this.filtered.filter((option) => !option.disabled);
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.combobox.sketch.roughness,
      bowing: tokens.comp.combobox.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  private openList(): void {
    if (this.disabled || this.open) {
      return;
    }
    this.open = true;
  }

  private closeList(): void {
    this.open = false;
  }

  private moveHighlight(direction: 1 | -1): void {
    const enabled = this.enabled();
    if (enabled.length === 0) {
      return;
    }
    const currentIndex = enabled.findIndex((option) => option.value === this.highlightedValue);
    const nextIndex = Math.min(Math.max(currentIndex + direction, 0), enabled.length - 1);
    this.highlightedValue = enabled[nextIndex]?.value ?? '';
  }

  private commit(nextValue: string): void {
    const option = this.options.find((o) => o.value === nextValue);
    if (!option || option.disabled) {
      return;
    }
    this.value = nextValue;
    this.query = option.label;
    this.open = false;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    this.inputEl?.focus();
  }

  private readonly onInput = (): void => {
    this.query = this.inputEl.value;
    this.openList();
    this.highlightedValue = this.enabled()[0]?.value ?? '';
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (this.disabled) {
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.open) {
          this.openList();
          this.highlightedValue = this.enabled()[0]?.value ?? '';
        } else {
          this.moveHighlight(1);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.open) {
          this.moveHighlight(-1);
        }
        break;
      case 'Enter':
        if (this.open && this.highlightedValue) {
          event.preventDefault();
          this.commit(this.highlightedValue);
        }
        break;
      case 'Escape':
        if (this.open) {
          event.preventDefault();
          this.closeList();
        }
        break;
      case 'Tab':
        this.closeList();
        break;
    }
  };

  private readonly onOptionSelect = (event: Event): void => {
    this.commit((event as CustomEvent<{ value: string }>).detail.value);
  };

  private readonly onOptionHighlight = (event: Event): void => {
    this.highlightedValue = (event as CustomEvent<{ value: string }>).detail.value;
  };

  private readonly onOutsidePointerDown = (event: PointerEvent): void => {
    if (!this.open) {
      return;
    }
    const path = event.composedPath();
    if (!path.includes(this) && !path.includes(this.listboxEl)) {
      this.closeList();
    }
  };

  private startPositioning(): void {
    if (!this.fieldEl || !this.listboxEl) {
      return;
    }
    this.cleanupAutoUpdate = autoUpdate(this.fieldEl, this.listboxEl, () => {
      computePosition(this.fieldEl, this.listboxEl, {
        placement: 'bottom-start',
        strategy: 'fixed',
        middleware: [
          offset(Number.parseFloat(tokens.sys.spacing.xs)),
          flip(),
          shift({ padding: Number.parseFloat(tokens.sys.spacing.sm) }),
          size({
            padding: Number.parseFloat(tokens.sys.spacing.sm),
            apply: ({ rects, availableHeight }) => {
              Object.assign(this.listboxEl.style, {
                minWidth: `${rects.reference.width}px`,
                maxHeight: `${availableHeight}px`,
              });
            },
          }),
        ],
      }).then(({ x, y }) => {
        Object.assign(this.listboxEl.style, { position: 'fixed', left: `${x}px`, top: `${y}px` });
      });
    });
  }

  private stopPositioning(): void {
    this.cleanupAutoUpdate?.();
    this.cleanupAutoUpdate = undefined;
  }

  private async updateActiveDescendant(): Promise<void> {
    if (!this.inputEl) {
      return;
    }
    await this.listboxEl?.updateComplete;
    const target =
      this.open && this.highlightedValue && this.listboxEl
        ? (this.listboxEl.shadowRoot?.getElementById(
            getSelectOptionId(this.comboId, this.highlightedValue),
          ) ?? null)
        : null;
    (
      this.inputEl as unknown as { ariaActiveDescendantElement: Element | null }
    ).ariaActiveDescendantElement = target;
  }

  override disconnectedCallback(): void {
    document.removeEventListener('pointerdown', this.onOutsidePointerDown);
    this.stopPositioning();
    super.disconnectedCallback();
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('value') || changed.has('disabled')) {
      this.internals.setFormValue(this.value || null);
    }
    if (changed.has('value')) {
      const option = this.options.find((o) => o.value === this.value);
      if (option && this.query !== option.label && !this.open) {
        this.query = option.label;
      }
    }
    if (changed.has('open')) {
      if (this.open) {
        this.startPositioning();
        this.measure();
        document.addEventListener('pointerdown', this.onOutsidePointerDown);
      } else {
        this.stopPositioning();
        document.removeEventListener('pointerdown', this.onOutsidePointerDown);
      }
    }
    void this.updateActiveDescendant();
  }

  formResetCallback(): void {
    this.value = '';
    this.query = '';
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  protected override render(): unknown {
    const listboxId = `${this.comboId}-listbox`;
    return html`<div class="field">
        ${this.renderSketch()}
        <input
          type="text"
          role="combobox"
          autocomplete="off"
          aria-autocomplete="list"
          aria-expanded=${this.open ? 'true' : 'false'}
          aria-controls=${listboxId}
          aria-label=${this.label || nothing}
          placeholder=${this.placeholder || nothing}
          .value=${this.query}
          ?disabled=${this.disabled}
          @input=${this.onInput}
          @focus=${() => this.openList()}
          @keydown=${this.onKeyDown}
        />
      </div>
      <gh-select-listbox
        id=${listboxId}
        ?open=${this.open}
        .options=${this.filtered}
        .value=${this.value}
        .highlightedValue=${this.highlightedValue}
        .hostId=${this.comboId}
        .listboxLabel=${this.label}
        @option-select=${this.onOptionSelect}
        @option-highlight=${this.onOptionHighlight}
      ></gh-select-listbox>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-combobox': GhCombobox;
  }
}

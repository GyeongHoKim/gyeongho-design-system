import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  size as sizeMiddleware,
} from '@floating-ui/dom';
import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';
import './icon.js';
import { type GhSelectListbox, type GhSelectOption, getSelectOptionId } from './select-listbox.js';
import './select-listbox.js';

export type { GhSelectOption };

let selectIdCounter = 0;
const TYPEAHEAD_RESET_MS = 500;

/**
 * `<gh-select>` — a hand-drawn, form-associated single-select dropdown.
 *
 * The trigger is a real `<button>`; the listbox panel (`<gh-select-listbox>`)
 * and its keyboard/typeahead model are hand-implemented, following the
 * WAI-ARIA "select-only combobox" pattern (`role="combobox"` trigger,
 * `role="listbox"` panel, `aria-activedescendant` roving highlight — real DOM
 * focus never leaves the trigger). Options are supplied as a plain data array
 * (`options`), not slotted children — light DOM has no context mechanism to
 * bridge selection state to slotted `<gh-select-option>` elements the way
 * React's children composition can.
 */
@customElement('gh-select')
export class GhSelect extends SketchyBase {
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
        color: var(--comp-select-trigger-stroke-default);
      }

      :host(:hover) {
        color: var(--comp-select-trigger-stroke-hover);
      }

      :host(:focus-within) {
        color: var(--comp-select-trigger-stroke-focus);
      }

      :host([disabled]) {
        color: var(--comp-select-trigger-stroke-disabled);
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: var(--sys-spacing-xs);
      }

      label {
        font-family: var(--sys-typography-label-fontFamily);
        font-size: var(--sys-typography-label-fontSize);
        font-weight: var(--sys-typography-label-fontWeight);
        line-height: var(--sys-typography-label-lineHeight);
        color: var(--sys-color-text-secondary);
      }

      .trigger {
        position: relative;
        box-sizing: border-box;
        width: 100%;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--comp-select-trigger-gap);
        padding: var(--comp-select-trigger-padding-vertical) var(--comp-select-trigger-padding-horizontal);
        background: transparent;
        border: none;
        outline: none;
        color: var(--comp-select-trigger-text-default);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        font-weight: var(--sys-typography-body-fontWeight);
        line-height: var(--sys-typography-body-lineHeight);
        cursor: pointer;
      }

      .trigger:disabled {
        color: var(--comp-select-trigger-text-disabled);
        cursor: not-allowed;
      }

      .placeholder {
        color: var(--comp-select-trigger-text-placeholder);
      }

      .chevron {
        flex-shrink: 0;
        transition: transform var(--sys-animation-duration-fast) var(--sys-animation-easing-standard);
      }

      :host([data-open]) .chevron {
        transform: rotate(180deg);
      }
    `,
  ];

  /** The selectable options. */
  @property({ type: Array }) options: GhSelectOption[] = [];
  /** Current field value. Mirrored to the form value. */
  @property({ type: String, reflect: true }) value = '';
  /** Submitted control name. */
  @property({ type: String }) name = '';
  /** Shown when nothing is selected. */
  @property({ type: String }) placeholder = '';
  /** Optional visible label, also the accessible name. */
  @property({ type: String }) label = '';
  /** Disables interaction and form participation. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  @state() private open = false;
  @state() private highlightedValue = '';

  @query('.trigger') private triggerEl!: HTMLButtonElement;
  @query('gh-select-listbox') private listboxEl!: GhSelectListbox;

  private readonly internals: ElementInternals = this.attachInternals();
  private readonly selectId = `gh-select-${++selectIdCounter}`;
  // Captured once on first render — the authored `value`, restored by
  // `formResetCallback`, matching native reset behavior.
  private defaultValue = '';
  private cleanupAutoUpdate: (() => void) | undefined;
  private readonly typeahead: {
    buffer: string;
    timeout: ReturnType<typeof setTimeout> | undefined;
  } = {
    buffer: '',
    timeout: undefined,
  };

  protected override get frame(): HTMLElement {
    return this.triggerEl ?? this;
  }

  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.select.sketch.roughness,
      bowing: tokens.comp.select.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  private enabledOptions(): GhSelectOption[] {
    return this.options.filter((option) => !option.disabled);
  }

  private openWithInitialHighlight(): void {
    this.open = true;
    const enabled = this.enabledOptions();
    if (enabled.length === 0) {
      return;
    }
    const selected = enabled.some((option) => option.value === this.value)
      ? this.value
      : enabled[0]?.value;
    this.highlightedValue = selected ?? '';
  }

  private highlightAt(position: 'first' | 'last'): void {
    const enabled = this.enabledOptions();
    if (enabled.length === 0) {
      return;
    }
    this.highlightedValue =
      (position === 'first' ? enabled[0]?.value : enabled[enabled.length - 1]?.value) ?? '';
  }

  private moveHighlight(direction: 1 | -1): void {
    const enabled = this.enabledOptions();
    if (enabled.length === 0) {
      return;
    }
    const currentIndex = enabled.findIndex((option) => option.value === this.highlightedValue);
    const nextIndex = Math.min(Math.max(currentIndex + direction, 0), enabled.length - 1);
    this.highlightedValue = enabled[nextIndex]?.value ?? '';
  }

  private selectValue(nextValue: string): void {
    this.value = nextValue;
    this.open = false;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    this.triggerEl?.focus();
  }

  private readonly handleOptionSelect = (event: Event): void => {
    const { value: nextValue } = (event as CustomEvent<{ value: string }>).detail;
    this.selectValue(nextValue);
  };

  private readonly handleOptionHighlight = (event: Event): void => {
    this.highlightedValue = (event as CustomEvent<{ value: string }>).detail.value;
  };

  private readonly handleTriggerClick = (): void => {
    if (this.disabled) {
      return;
    }
    this.open = !this.open;
  };

  private readonly handleOutsidePointerDown = (event: PointerEvent): void => {
    if (!this.open) {
      return;
    }
    const path = event.composedPath();
    if (!path.includes(this) && !path.includes(this.listboxEl)) {
      this.open = false;
    }
  };

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (this.disabled) {
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (this.open) {
          this.moveHighlight(1);
        } else {
          this.openWithInitialHighlight();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.open) {
          this.moveHighlight(-1);
        } else {
          this.openWithInitialHighlight();
        }
        break;
      case 'Home':
        if (this.open) {
          event.preventDefault();
          this.highlightAt('first');
        }
        break;
      case 'End':
        if (this.open) {
          event.preventDefault();
          this.highlightAt('last');
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.open) {
          if (this.highlightedValue) {
            this.selectValue(this.highlightedValue);
          }
        } else {
          this.openWithInitialHighlight();
        }
        break;
      case 'Escape':
        if (this.open) {
          event.preventDefault();
          this.open = false;
        }
        break;
      case 'Tab':
        this.open = false;
        break;
      default:
        if (event.key.length === 1 && /\S/.test(event.key)) {
          if (!this.open) {
            this.open = true;
          }
          this.typeahead.buffer += event.key.toLowerCase();
          if (this.typeahead.timeout) {
            clearTimeout(this.typeahead.timeout);
          }
          this.typeahead.timeout = setTimeout(() => {
            this.typeahead.buffer = '';
          }, TYPEAHEAD_RESET_MS);
          const match = this.enabledOptions().find((option) =>
            option.label.toLowerCase().startsWith(this.typeahead.buffer),
          );
          if (match) {
            this.highlightedValue = match.value;
          }
        }
    }
  };

  private syncFormValue(): void {
    this.internals.setFormValue(this.value || null);
  }

  // A string-form `aria-activedescendant` (an ID attribute) cannot resolve
  // into `gh-select-listbox`'s own, separate shadow root — ID references only
  // resolve within the same tree scope as the referencing element. Reflected
  // ARIA *element references* (`ariaActiveDescendantElement`) don't have that
  // restriction, so this sets the actual option element directly instead of
  // an ID string. Not yet in TypeScript's DOM lib, hence the cast.
  private async updateActiveDescendant(): Promise<void> {
    if (!this.triggerEl) {
      return;
    }
    await this.listboxEl?.updateComplete;
    const target =
      this.open && this.highlightedValue && this.listboxEl
        ? (this.listboxEl.shadowRoot?.getElementById(
            getSelectOptionId(this.selectId, this.highlightedValue),
          ) ?? null)
        : null;
    (
      this.triggerEl as unknown as { ariaActiveDescendantElement: Element | null }
    ).ariaActiveDescendantElement = target;
  }

  private startPositioning(): void {
    if (!this.triggerEl || !this.listboxEl) {
      return;
    }
    const update = () => {
      computePosition(this.triggerEl, this.listboxEl, {
        placement: 'bottom-start',
        strategy: 'fixed',
        middleware: [
          offset(Number.parseFloat(tokens.comp.select.panel.offset)),
          flip(),
          shift({ padding: Number.parseFloat(tokens.sys.spacing.sm) }),
          sizeMiddleware({
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
        Object.assign(this.listboxEl.style, {
          position: 'fixed',
          left: `${x}px`,
          top: `${y}px`,
        });
      });
    };
    this.cleanupAutoUpdate = autoUpdate(this.triggerEl, this.listboxEl, update);
  }

  private stopPositioning(): void {
    this.cleanupAutoUpdate?.();
    this.cleanupAutoUpdate = undefined;
  }

  protected override firstUpdated(): void {
    super.firstUpdated();
    this.defaultValue = this.value;
    this.syncFormValue();
  }

  override disconnectedCallback(): void {
    document.removeEventListener('pointerdown', this.handleOutsidePointerDown);
    this.stopPositioning();
    super.disconnectedCallback();
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('value') || changed.has('disabled')) {
      this.syncFormValue();
    }
    if (changed.has('open')) {
      this.toggleAttribute('data-open', this.open);
      if (this.open) {
        this.startPositioning();
        document.addEventListener('pointerdown', this.handleOutsidePointerDown);
      } else {
        this.stopPositioning();
        document.removeEventListener('pointerdown', this.handleOutsidePointerDown);
      }
    }
    // No host-level `internals.role`/`ariaExpanded`/`ariaHasPopup` here — the
    // real, fully-functional ARIA contract already lives on the inner
    // `<button class="trigger">` (delegatesFocus makes it the actual
    // interactive target). Duplicating role="combobox" on the host too would
    // expose two nested combobox-role nodes for one visual control.
    void this.updateActiveDescendant();
  }

  // --- Form-associated lifecycle callbacks ---------------------------------

  formResetCallback(): void {
    this.value = this.defaultValue;
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (typeof state === 'string') {
      this.value = state;
    }
  }

  protected override render(): unknown {
    const selectedOption = this.options.find((option) => option.value === this.value);
    const labelId = `${this.selectId}-label`;
    const listboxId = `${this.selectId}-listbox`;
    return html`<div class="field">
      ${this.label ? html`<label id=${labelId}>${this.label}</label>` : nothing}
      <button
        class="trigger"
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded=${this.open}
        aria-controls=${listboxId}
        aria-labelledby=${this.label ? labelId : nothing}
        ?disabled=${this.disabled}
        @click=${this.handleTriggerClick}
        @keydown=${this.handleKeyDown}
      >
        ${this.renderSketch()}
        <span class=${selectedOption ? '' : 'placeholder'}>${selectedOption?.label ?? this.placeholder}</span>
        <gh-icon class="chevron" name="chevron-down" size="sm" style="color: inherit"></gh-icon>
      </button>
      <gh-select-listbox
        id=${listboxId}
        ?open=${this.open}
        .options=${this.options}
        .value=${this.value}
        .highlightedValue=${this.highlightedValue}
        .hostId=${this.selectId}
        .listboxLabel=${this.label}
        @option-select=${this.handleOptionSelect}
        @option-highlight=${this.handleOptionHighlight}
      ></gh-select-listbox>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-select': GhSelect;
  }
}

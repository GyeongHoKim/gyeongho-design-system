import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';
import './calendar.js';
import './icon.js';

let datePickerUid = 0;

/**
 * `<gh-date-picker>` — a hand-drawn date field with a popover calendar.
 *
 * A read-only `<input>` shows the selected ISO date; a trigger opens a floating
 * `<gh-calendar>` (reused) positioned with `@floating-ui/dom`. Selecting a day
 * sets `value` (ISO `YYYY-MM-DD`), dispatches `change`, and closes the popover;
 * Escape and outside pointer-down also close. Form-associated. Colours, padding
 * and sketch parameters come from `@ghds/tokens` (`comp.datePicker.*`).
 */
@customElement('gh-date-picker')
export class GhDatePicker extends SketchyBase {
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
        color: var(--comp-datePicker-field-stroke-default);
      }

      :host(:focus-within) {
        color: var(--comp-datePicker-field-stroke-focus);
      }

      :host([disabled]) {
        opacity: var(--sys-opacity-disabled, 0.5);
      }

      .field {
        position: relative;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        gap: var(--sys-spacing-sm);
        padding: var(--comp-datePicker-padding-vertical) var(--comp-datePicker-padding-horizontal);
      }

      input {
        border: none;
        outline: none;
        background: transparent;
        color: var(--comp-datePicker-text);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        cursor: pointer;
      }

      .trigger {
        display: inline-flex;
        align-items: center;
        padding: 0;
        border: none;
        background: transparent;
        color: inherit;
        cursor: pointer;
      }

      .popover {
        position: fixed;
        left: 0;
        top: 0;
        z-index: var(--sys-zIndex-popover, var(--sys-zIndex-dropdown));
        display: none;
      }

      .popover.open {
        display: block;
      }

      .sketch-fill {
        fill: var(--comp-datePicker-field-bg);
        stroke: none;
      }
    `,
  ];

  /** Selected date as an ISO `YYYY-MM-DD` string. */
  @property({ type: String, reflect: true }) value = '';
  /** Submitted control name. */
  @property({ type: String }) name = '';
  /** Placeholder shown when no date is selected. */
  @property({ type: String }) placeholder = 'Select a date';
  /** Accessible label for the field. */
  @property({ type: String }) label = '';
  /** Disables interaction and form participation. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  @state() private open = false;

  @query('.field') private fieldEl!: HTMLElement;
  @query('.popover') private popoverEl?: HTMLElement;

  private readonly internals: ElementInternals = this.attachInternals();
  private readonly uid = `gh-date-picker-${datePickerUid++}`;
  private defaultValue = '';
  private cleanupAutoUpdate?: () => void;

  protected override get frame(): HTMLElement {
    return this.fieldEl ?? this;
  }

  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  protected override firstUpdated(): void {
    super.firstUpdated();
    this.defaultValue = this.value;
    this.internals.setFormValue(this.value || null);
  }

  override disconnectedCallback(): void {
    document.removeEventListener('pointerdown', this.onOutsidePointerDown);
    this.cleanupAutoUpdate?.();
    super.disconnectedCallback();
  }

  private readonly onOutsidePointerDown = (event: PointerEvent): void => {
    if (this.open && !event.composedPath().includes(this)) {
      this.close();
    }
  };

  private toggle(): void {
    if (this.disabled) {
      return;
    }
    this.open ? this.close() : void this.show();
  }

  private async show(): Promise<void> {
    this.open = true;
    document.addEventListener('pointerdown', this.onOutsidePointerDown);
    await this.updateComplete;
    const field = this.fieldEl;
    const popover = this.popoverEl;
    if (field && popover) {
      this.cleanupAutoUpdate = autoUpdate(field, popover, () => {
        computePosition(field, popover, {
          strategy: 'fixed',
          placement: 'bottom-start',
          middleware: [
            offset(Number.parseFloat(tokens.sys.spacing.xs)),
            flip(),
            shift({ padding: Number.parseFloat(tokens.sys.spacing.sm) }),
          ],
        }).then(({ x, y }) => {
          popover.style.left = `${x}px`;
          popover.style.top = `${y}px`;
        });
      });
    }
  }

  private close(): void {
    this.open = false;
    this.cleanupAutoUpdate?.();
    this.cleanupAutoUpdate = undefined;
    document.removeEventListener('pointerdown', this.onOutsidePointerDown);
  }

  private readonly onCalendarSelect = (event: Event): void => {
    this.value = (event as CustomEvent<string>).detail;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    this.close();
  };

  private readonly onKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.open) {
      event.preventDefault();
      this.close();
    }
  };

  protected override updated(changed: PropertyValues): void {
    if (changed.has('value') || changed.has('disabled')) {
      this.internals.setFormValue(this.value || null);
    }
  }

  formResetCallback(): void {
    this.value = this.defaultValue;
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.datePicker.sketch.roughness,
      bowing: tokens.comp.datePicker.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override render(): unknown {
    const popoverId = `${this.uid}-popover`;
    return html`<div class="field" @keydown=${this.onKeydown}>
        ${this.renderSketch()}
        <input
          type="text"
          readonly
          aria-label=${this.label || nothing}
          aria-haspopup="dialog"
          aria-expanded=${this.open ? 'true' : 'false'}
          aria-controls=${popoverId}
          placeholder=${this.placeholder}
          .value=${this.value}
          ?disabled=${this.disabled}
          @click=${() => this.toggle()}
        />
        <button
          class="trigger"
          type="button"
          aria-label="Open calendar"
          ?disabled=${this.disabled}
          @click=${() => this.toggle()}
        >
          <gh-icon name="calendar" size="sm" style="color: inherit"></gh-icon>
        </button>
      </div>
      <div class=${this.open ? 'popover open' : 'popover'} id=${popoverId} @keydown=${this.onKeydown}>
        <gh-calendar .value=${this.value} @select=${this.onCalendarSelect}></gh-calendar>
      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-date-picker': GhDatePicker;
  }
}

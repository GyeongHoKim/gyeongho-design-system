import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

/** Which characters a `<gh-input-otp>` accepts. */
export type GhInputOtpMode = 'numeric' | 'text';

/** Visual state of a single OTP cell, driving its sketch stroke colour. */
export type GhInputOtpCellState = 'default' | 'active' | 'filled' | 'danger';

let inputOtpIdCounter = 0;

function isAllowed(char: string, mode: GhInputOtpMode): boolean {
  return mode === 'numeric' ? /^[0-9]$/.test(char) : /^\S$/.test(char);
}

function sanitize(raw: string, mode: GhInputOtpMode): string {
  return Array.from(raw)
    .filter((ch) => isAllowed(ch, mode))
    .join('');
}

/**
 * `<gh-input-otp-cell>` — the hand-drawn box behind a single OTP character.
 *
 * Internal to `<gh-input-otp>` (not a public subpath): each cell is its own
 * {@link SketchyBase} instance so it measures itself and draws one sketchy
 * rectangle. It is purely decorative (`pointer-events: none`) and sits behind
 * the character `<input>` its parent owns. The stroke colour follows `state`
 * and the fill follows `disabled`, all from `comp.inputOtp.*` tokens.
 */
@customElement('gh-input-otp-cell')
export class GhInputOtpCell extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        position: absolute;
        inset: 0;
        display: block;
        background: var(--comp-inputOtp-cell-bg-default);
        border-radius: var(--comp-inputOtp-radius);
        /* Drives the sketch stroke (currentColor). */
        color: var(--comp-inputOtp-stroke-default);
        pointer-events: none;
      }

      :host([state='active']) {
        color: var(--comp-inputOtp-stroke-active);
      }

      :host([state='filled']) {
        color: var(--comp-inputOtp-stroke-filled);
      }

      :host([state='danger']) {
        color: var(--comp-inputOtp-stroke-danger);
      }

      :host([disabled]) {
        background: var(--comp-inputOtp-cell-bg-disabled);
      }
    `,
  ];

  /** Stroke role for this cell. */
  @property({ type: String, reflect: true }) state: GhInputOtpCellState = 'default';
  /** Mutes the fill when the field is disabled. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.inputOtp.sketch.roughness,
      bowing: tokens.comp.inputOtp.sketch.bowing,
    };
  }

  protected override render(): unknown {
    return this.renderSketch();
  }
}

/**
 * `<gh-input-otp>` — a hand-drawn one-time-code field: a row of single-character
 * cells backed by a left-filled string `value`. Each cell is its own sketchy box
 * (`<gh-input-otp-cell>`); the focused cell shows the active stroke, filled cells
 * a stronger stroke, and every colour, size and sketch parameter comes from
 * `comp.inputOtp.*` tokens.
 *
 * Entry is sequential: typing advances to the next cell, `Backspace` deletes the
 * last character, arrows/Home/End move between cells, and pasting distributes
 * across cells. A `gh-change` event (`detail: { value }`) fires on every change
 * and `gh-complete` (`detail: { value }`) once all cells are filled.
 */
@customElement('gh-input-otp')
export class GhInputOtp extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      flex-direction: column;
      gap: var(--sys-spacing-xs);
      font-family: var(--sys-typography-body-fontFamily);
    }

    .label {
      color: var(--comp-inputOtp-text-value);
      font-family: var(--sys-typography-label-fontFamily);
      font-size: var(--sys-typography-label-fontSize);
      font-weight: var(--sys-typography-label-fontWeight);
      line-height: var(--sys-typography-label-lineHeight);
    }

    .group {
      display: inline-flex;
      gap: var(--comp-inputOtp-gap);
    }

    .cell {
      position: relative;
      display: inline-flex;
      box-sizing: border-box;
      width: var(--comp-inputOtp-size);
      height: var(--comp-inputOtp-size);
    }

    .cell input {
      position: relative;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      border: none;
      outline: none;
      background: transparent;
      text-align: center;
      color: var(--comp-inputOtp-text-value);
      font-family: var(--sys-typography-body-fontFamily);
      font-size: var(--sys-typography-title-fontSize);
      font-weight: var(--sys-typography-body-fontWeight);
      line-height: var(--sys-typography-body-lineHeight);
      cursor: text;
    }

    .cell input:disabled {
      color: var(--comp-inputOtp-text-disabled);
      cursor: not-allowed;
    }
  `;

  /** Number of segments/cells. Defaults to `6`. */
  @property({ type: Number }) length = 6;
  /** Current value (a left-filled prefix, never longer than `length`). */
  @property({ type: String }) value = '';
  /** Accepted characters. `'numeric'` (default) restricts to digits. */
  @property({ type: String }) mode: GhInputOtpMode = 'numeric';
  /** Masks the entered characters like a password. */
  @property({ type: Boolean }) mask = false;
  /** Disables entry and mutes every cell. */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Marks every cell invalid (danger stroke). */
  @property({ type: Boolean, reflect: true }) invalid = false;
  /** Optional visible label, associated with the first cell. */
  @property({ type: String }) label?: string;

  @state() private focusedIndex = 0;

  private readonly groupId = `gh-input-otp-${++inputOtpIdCounter}`;

  private get current(): string {
    return sanitize(this.value, this.mode).slice(0, this.length);
  }

  private get inputs(): HTMLInputElement[] {
    return [...(this.shadowRoot?.querySelectorAll<HTMLInputElement>('.cell input') ?? [])];
  }

  private focusCell(index: number): void {
    const clamped = Math.max(0, Math.min(index, this.length - 1));
    this.inputs[clamped]?.focus();
    this.focusedIndex = clamped;
  }

  private commit(next: string): void {
    this.value = next;
    this.dispatchEvent(
      new CustomEvent('gh-change', { detail: { value: next }, bubbles: true, composed: true }),
    );
    if (next.length === this.length) {
      this.dispatchEvent(
        new CustomEvent('gh-complete', { detail: { value: next }, bubbles: true, composed: true }),
      );
    }
  }

  private readonly handleInput = (index: number, raw: string): void => {
    if (this.disabled) {
      return;
    }
    const char = sanitize(raw, this.mode).slice(-1);
    if (char === '') {
      return;
    }
    const current = this.current;
    const next =
      index < current.length
        ? current.slice(0, index) + char + current.slice(index + 1)
        : (current + char).slice(0, this.length);
    this.commit(next);
    this.focusCell(Math.min(index + 1, this.length - 1));
  };

  private readonly handleKeyDown = (index: number, event: KeyboardEvent): void => {
    if (this.disabled) {
      return;
    }
    const current = this.current;
    switch (event.key) {
      case 'Backspace':
        event.preventDefault();
        if (current.length > 0) {
          const next = current.slice(0, -1);
          this.commit(next);
          this.focusCell(next.length);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.focusCell(index - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.focusCell(Math.min(index + 1, current.length));
        break;
      case 'Home':
        event.preventDefault();
        this.focusCell(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusCell(current.length);
        break;
      default:
        break;
    }
  };

  private readonly handlePaste = (event: ClipboardEvent): void => {
    if (this.disabled) {
      return;
    }
    event.preventDefault();
    const pasted = sanitize(event.clipboardData?.getData('text') ?? '', this.mode).slice(
      0,
      this.length,
    );
    if (pasted === '') {
      return;
    }
    this.commit(pasted);
    this.focusCell(Math.min(pasted.length, this.length - 1));
  };

  private cellState(index: number): GhInputOtpCellState {
    if (this.invalid) {
      return 'danger';
    }
    if (this.focusedIndex === index) {
      return 'active';
    }
    return index < this.current.length ? 'filled' : 'default';
  }

  protected override render(): unknown {
    const current = this.current;
    const count = Math.max(0, Math.floor(this.length));
    return html`${
      this.label !== undefined
        ? html`<label class="label" for=${`${this.groupId}-0`}>${this.label}</label>`
        : nothing
    }
      <div
        class="group"
        role="group"
        aria-label=${this.label ?? this.getAttribute('aria-label') ?? 'One-time code'}
      >
        ${Array.from({ length: count }, (_, index) => {
          const char = current[index] ?? '';
          return html`<div class="cell">
            <gh-input-otp-cell
              state=${this.cellState(index)}
              ?disabled=${this.disabled}
            ></gh-input-otp-cell>
            <input
              id=${`${this.groupId}-${index}`}
              type=${this.mask ? 'password' : 'text'}
              inputmode=${this.mode === 'numeric' ? 'numeric' : 'text'}
              autocomplete="one-time-code"
              maxlength="1"
              aria-label=${`Digit ${index + 1}`}
              ?disabled=${this.disabled}
              .value=${char}
              @focus=${() => {
                this.focusedIndex = index;
              }}
              @input=${(event: Event) =>
                this.handleInput(index, (event.target as HTMLInputElement).value)}
              @keydown=${(event: KeyboardEvent) => this.handleKeyDown(index, event)}
              @paste=${this.handlePaste}
            />
          </div>`;
        })}
      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-input-otp': GhInputOtp;
    'gh-input-otp-cell': GhInputOtpCell;
  }
}

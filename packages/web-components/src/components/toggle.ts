import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

/**
 * `<gh-toggle>` — a hand-drawn two-state (pressed / not-pressed) button.
 *
 * A real `<button>` owns the semantics with `aria-pressed`; the sketchy box
 * (`@ghds/sketch-core`, solid fill) changes fill with the pressed state. The
 * pressed state is also exposed via `internals.states` (`:state(pressed)`).
 * Form-associated: when `name` is set it contributes `value` while pressed.
 * Colours, padding and sketch parameters come from `@ghds/tokens`
 * (`comp.toggle.*`).
 */
@customElement('gh-toggle')
export class GhToggle extends SketchyBase {
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
        color: var(--comp-toggle-stroke);
        cursor: pointer;
        --ghds-sketch-fill-color: var(--comp-toggle-bg-default);
      }

      :host(:hover) {
        --ghds-sketch-fill-color: var(--comp-toggle-bg-hover);
      }

      :host([pressed]) {
        --ghds-sketch-fill-color: var(--comp-toggle-bg-pressed);
      }

      :host([disabled]) {
        cursor: not-allowed;
        opacity: var(--sys-opacity-disabled, 0.5);
      }

      button {
        appearance: none;
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--sys-spacing-sm);
        box-sizing: border-box;
        margin: 0;
        padding: var(--comp-toggle-padding-vertical) var(--comp-toggle-padding-horizontal);
        border: none;
        background: transparent;
        color: var(--comp-toggle-text-default);
        font-family: var(--sys-typography-label-fontFamily);
        font-size: var(--sys-typography-label-fontSize);
        font-weight: var(--sys-typography-label-fontWeight);
        line-height: var(--sys-typography-label-lineHeight);
        cursor: inherit;
      }

      :host([pressed]) button {
        color: var(--comp-toggle-text-pressed);
      }

      .label {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: var(--sys-spacing-sm);
      }

      button:focus-visible {
        outline: var(--sys-border-width-thick) solid var(--comp-toggle-focus-ring);
        outline-offset: var(--sys-spacing-xs);
        border-radius: var(--comp-toggle-radius);
      }
    `,
  ];

  /** Pressed (on) state. */
  @property({ type: Boolean, reflect: true }) pressed = false;
  /** Disables interaction and form participation. */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Submitted control name (enables form association when set). */
  @property({ type: String }) name = '';
  /** Submitted value when pressed. */
  @property({ type: String }) value = 'on';
  /** Accessible label when no visible text is slotted. */
  @property({ type: String }) label = '';

  private readonly internals: ElementInternals = this.attachInternals();
  private defaultPressed = false;

  protected override firstUpdated(): void {
    super.firstUpdated();
    this.defaultPressed = this.pressed;
  }

  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('pressed')) {
      this.internals.states?.delete('pressed');
      if (this.pressed) {
        this.internals.states?.add('pressed');
      }
    }
    this.internals.setFormValue(this.pressed ? this.value : null);
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.toggle.sketch.roughness,
      bowing: tokens.comp.toggle.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  private readonly onClick = (): void => {
    if (this.disabled) {
      return;
    }
    this.pressed = !this.pressed;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  };

  formResetCallback(): void {
    this.pressed = this.defaultPressed;
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  protected override render(): unknown {
    return html`<button
      part="button"
      type="button"
      aria-pressed=${this.pressed ? 'true' : 'false'}
      aria-label=${this.label || nothing}
      ?disabled=${this.disabled}
      @click=${this.onClick}
    >
      ${this.renderSketch()}
      <span class="label"><slot>${this.label}</slot></span>
    </button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-toggle': GhToggle;
  }
}

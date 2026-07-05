import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { ellipse, rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing, svg } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

/**
 * `<gh-switch>` — a hand-drawn toggle switch.
 *
 * Renders a real `<input type="checkbox" role="switch">` in the shadow DOM —
 * browsers compute `aria-checked` from the native `checked` property
 * regardless of the role override, so Space toggles and correct AT
 * announcement come free. The track comes from `@ghds/sketch-core` (filled
 * solid); the thumb is a second, smaller ellipse computed directly from
 * `@ghds/sketch-core`, positioned left/right based on checked state.
 */
@customElement('gh-switch')
export class GhSwitch extends SketchyBase {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...SketchyBase.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        gap: var(--comp-switch-gap);
        color: var(--comp-switch-stroke-default);
        cursor: pointer;
      }

      :host([checked]) {
        color: var(--comp-switch-stroke-checked);
        --ghds-sketch-fill-color: var(--comp-switch-bg-on-default);
      }

      :host([checked]:hover) {
        --ghds-sketch-fill-color: var(--comp-switch-bg-on-hover);
      }

      :host(:not([checked])) {
        --ghds-sketch-fill-color: var(--comp-switch-bg-off-default);
      }

      :host([disabled]) {
        color: var(--comp-switch-stroke-disabled);
        cursor: not-allowed;
      }

      :host([disabled][checked]) {
        --ghds-sketch-fill-color: var(--comp-switch-bg-on-disabled);
      }

      :host([disabled]:not([checked])) {
        --ghds-sketch-fill-color: var(--comp-switch-bg-off-disabled);
      }

      .track {
        position: relative;
        box-sizing: border-box;
        width: var(--comp-switch-track-width);
        height: var(--comp-switch-track-height);
        flex-shrink: 0;
      }

      .track:focus-within {
        outline: var(--sys-border-width-default) solid var(--comp-switch-stroke-focus);
        outline-offset: var(--sys-spacing-xs);
      }

      .thumb {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
        pointer-events: none;
      }

      .thumb path {
        fill: var(--comp-switch-thumb-color-default);
        stroke: var(--comp-switch-thumb-color-default);
        stroke-width: var(--sys-border-width-default);
        stroke-linecap: round;
      }

      :host([disabled]) .thumb path {
        fill: var(--comp-switch-thumb-color-disabled);
        stroke: var(--comp-switch-thumb-color-disabled);
      }

      input {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        margin: 0;
        opacity: 0;
        cursor: inherit;
      }

      label {
        color: var(--comp-switch-text-label);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
      }

      :host([disabled]) label {
        color: var(--comp-switch-text-disabled);
      }
    `,
  ];

  /** Checked state. */
  @property({ type: Boolean, reflect: true }) checked = false;
  /** Disables interaction and form participation. */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Submitted control name. */
  @property({ type: String }) name = '';
  /** Submitted value when checked. */
  @property({ type: String }) value = 'on';
  /** Optional visible label, also the accessible name. */
  @property({ type: String }) label = '';

  @query('.track') private trackEl!: HTMLDivElement;
  @query('input') private inputEl!: HTMLInputElement;

  private readonly internals: ElementInternals = this.attachInternals();
  private readonly switchId = `gh-switch-${Math.random().toString(36).slice(2)}`;
  // Captured once on first render — the authored `checked` state, restored by
  // `formResetCallback`, matching native `<input type="checkbox" checked>` reset behavior.
  private defaultChecked = false;

  protected override get frame(): HTMLElement {
    return this.trackEl ?? this;
  }

  protected override firstUpdated(): void {
    super.firstUpdated();
    this.defaultChecked = this.checked;
  }

  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.switch.sketch.roughness,
      bowing: tokens.comp.switch.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override updated(): void {
    // `ElementInternals.states` (CustomStateSet) isn't implemented in every
    // environment yet (e.g. jsdom) — guard so this degrades gracefully rather
    // than throwing where it's unsupported.
    this.internals.states?.delete('checked');
    if (this.checked) {
      this.internals.states?.add('checked');
    }
    this.internals.setFormValue(this.checked ? this.value : null);
  }

  private renderThumb(): unknown {
    if (this.sketchWidth <= 0 || this.sketchHeight <= 0) {
      return nothing;
    }
    const size = Number.parseFloat(tokens.comp.switch.thumb.size);
    const thumbInset = Number.parseFloat(tokens.comp.switch.thumb.inset);
    const y = (this.sketchHeight - size) / 2;
    const x = this.checked ? this.sketchWidth - size - thumbInset : thumbInset;
    const drawable = ellipse(x, y, size, size, {
      roughness: tokens.comp.switch.sketch.roughness,
      bowing: tokens.comp.switch.sketch.bowing,
      seed: this.effectiveSeed,
      fillStyle: 'solid',
    });
    return html`<svg class="thumb" viewBox="0 0 ${this.sketchWidth} ${this.sketchHeight}" aria-hidden="true" focusable="false">
      ${drawable.fillPaths.map((d) => svg`<path d=${d}></path>`)}
    </svg>`;
  }

  private readonly handleChange = (): void => {
    this.checked = this.inputEl.checked;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  };

  formResetCallback(): void {
    this.checked = this.defaultChecked;
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    this.checked = typeof state === 'string';
  }

  protected override render(): unknown {
    return html`<div class="track">
        ${this.renderSketch()} ${this.renderThumb()}
        <input
          id=${this.switchId}
          type="checkbox"
          role="switch"
          .checked=${this.checked}
          aria-checked=${this.checked}
          aria-label=${this.label ? nothing : this.getAttribute('aria-label') || nothing}
          ?disabled=${this.disabled}
          @change=${this.handleChange}
        />
      </div>
      ${this.label ? html`<label for=${this.switchId}>${this.label}</label>` : nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-switch': GhSwitch;
  }
}

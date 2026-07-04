import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { ellipse } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing, svg } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

const DOT_INSET_RATIO = 0.25;

/**
 * `<gh-radio>` — a hand-drawn radio button.
 *
 * The ring comes from `@ghds/sketch-core` (via {@link SketchyBase.renderSketch});
 * the checked dot is a second, smaller ellipse computed directly from
 * `@ghds/sketch-core`, sharing the ring's measured box and seed. A real
 * `<input type="radio">` in the shadow DOM carries native keyboard/click
 * behavior. Unlike real same-`name` native radios, form-associated custom
 * elements get no automatic mutual exclusivity from the platform — a
 * `<gh-radio-group>` wrapper (not this element) enforces it.
 */
@customElement('gh-radio')
export class GhRadio extends SketchyBase {
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
        gap: var(--comp-radio-gap);
        color: var(--comp-radio-stroke-default);
        cursor: pointer;
      }

      :host(:hover) {
        color: var(--comp-radio-stroke-hover);
      }

      :host([checked]) {
        color: var(--comp-radio-stroke-checked);
      }

      :host([disabled]) {
        color: var(--comp-radio-stroke-disabled);
        cursor: not-allowed;
      }

      .ring {
        position: relative;
        box-sizing: border-box;
        width: var(--comp-radio-size);
        height: var(--comp-radio-size);
        flex-shrink: 0;
        border-radius: 50%;
      }

      .ring:focus-within {
        outline: var(--sys-border-width-default) solid var(--comp-radio-stroke-focus);
        outline-offset: var(--sys-spacing-xs);
      }

      .dot {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
        pointer-events: none;
      }

      .dot path {
        fill: var(--comp-radio-dot-default);
        stroke: var(--comp-radio-dot-default);
        stroke-width: var(--sys-border-width-default);
        stroke-linecap: round;
      }

      :host([disabled]) .dot path {
        fill: var(--comp-radio-dot-disabled);
        stroke: var(--comp-radio-dot-disabled);
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
        color: var(--comp-radio-text-label);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
      }

      :host([disabled]) label {
        color: var(--comp-radio-text-disabled);
      }
    `,
  ];

  /** Checked state. */
  @property({ type: Boolean, reflect: true }) checked = false;
  /** Disables interaction and form participation. */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Submitted control name — repeat the same name across a group. */
  @property({ type: String }) name = '';
  /** This radio's own value. */
  @property({ type: String }) value = '';
  /** Optional visible label, also the accessible name. */
  @property({ type: String }) label = '';

  @query('.ring') private ringEl!: HTMLDivElement;
  @query('input') private inputEl!: HTMLInputElement;

  private readonly internals: ElementInternals = this.attachInternals();
  private readonly radioId = `gh-radio-${Math.random().toString(36).slice(2)}`;

  protected override get frame(): HTMLElement {
    return this.ringEl ?? this;
  }

  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return ellipse(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.radio.sketch.roughness,
      bowing: tokens.comp.radio.sketch.bowing,
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

  private renderDot(): unknown {
    if (!this.checked || this.sketchWidth <= 0 || this.sketchHeight <= 0) {
      return nothing;
    }
    const inset = Math.min(this.sketchWidth, this.sketchHeight) * DOT_INSET_RATIO;
    const drawable = ellipse(
      inset,
      inset,
      this.sketchWidth - inset * 2,
      this.sketchHeight - inset * 2,
      {
        roughness: tokens.comp.radio.sketch.roughness,
        bowing: tokens.comp.radio.sketch.bowing,
        seed: this.effectiveSeed,
        fillStyle: 'solid',
      },
    );
    return html`<svg class="dot" viewBox="0 0 ${this.sketchWidth} ${this.sketchHeight}" aria-hidden="true" focusable="false">
      ${drawable.fillPaths.map((d) => svg`<path d=${d}></path>`)}
    </svg>`;
  }

  private readonly handleChange = (): void => {
    this.checked = this.inputEl.checked;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  };

  formResetCallback(): void {
    this.checked = false;
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    this.checked = typeof state === 'string' && state === this.value;
  }

  protected override render(): unknown {
    return html`<div class="ring">
        ${this.renderSketch()} ${this.renderDot()}
        <input
          id=${this.radioId}
          type="radio"
          name=${this.name}
          .value=${this.value}
          .checked=${this.checked}
          aria-label=${this.label ? nothing : this.getAttribute('aria-label') || nothing}
          ?disabled=${this.disabled}
          @change=${this.handleChange}
        />
      </div>
      ${this.label ? html`<label for=${this.radioId}>${this.label}</label>` : nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-radio': GhRadio;
  }
}

import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { ellipse, rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing, type PropertyValues, svg } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

const THUMB_SIZE = Number.parseFloat(tokens.comp.slider.thumb.size);
const TRACK_HEIGHT = Number.parseFloat(tokens.comp.slider.track.height);
const STROKE_WIDTH = Number.parseFloat(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

/**
 * `<gh-slider>` — a hand-drawn range slider.
 *
 * Renders a real, invisible `<input type="range">` spanning the full track —
 * it carries every interaction (dragging, clicking the track, and the
 * browser's own Arrow/Home/End/PageUp/PageDown keyboard behavior) with zero
 * custom pointer/keydown handling, the same "real native element drives
 * behavior" rule every sibling component follows. The rail is the base
 * `sketch()` rectangle (a thin strip centered in the taller frame); the fill
 * and thumb are two further shapes computed directly from
 * `@ghds/sketch-core`, sharing the frame's measured size and seed — the same
 * multi-shape trick `gh-switch`'s thumb already uses.
 *
 * v1 scope: a single thumb (no two-thumb range mode), horizontal only.
 */
@customElement('gh-slider')
export class GhSlider extends SketchyBase {
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
        flex-direction: column;
        gap: var(--comp-slider-gap);
        color: var(--comp-slider-stroke-default);
        font-family: var(--sys-typography-body-fontFamily);
        --ghds-sketch-fill-color: var(--comp-slider-bg-rail-default);
      }

      :host([disabled]) {
        color: var(--comp-slider-stroke-disabled);
        cursor: not-allowed;
        --ghds-sketch-fill-color: var(--comp-slider-bg-rail-disabled);
      }

      .track {
        position: relative;
        box-sizing: border-box;
        width: 100%;
        height: var(--comp-slider-thumb-size);
      }

      .track:focus-within {
        outline: var(--sys-border-width-default) solid var(--comp-slider-thumb-stroke-focus);
        outline-offset: var(--sys-spacing-xs);
      }

      .fill,
      .thumb {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
        pointer-events: none;
      }

      .fill path {
        fill: var(--comp-slider-bg-fill-default);
        stroke: var(--comp-slider-bg-fill-default);
        stroke-width: var(--sys-border-width-default);
        stroke-linecap: round;
      }

      :host(:hover) .fill path {
        fill: var(--comp-slider-bg-fill-hover);
        stroke: var(--comp-slider-bg-fill-hover);
      }

      :host([disabled]) .fill path {
        fill: var(--comp-slider-bg-fill-disabled);
        stroke: var(--comp-slider-bg-fill-disabled);
      }

      .thumb path {
        fill: var(--comp-slider-thumb-bg-default);
        stroke: var(--comp-slider-thumb-stroke-default);
        stroke-width: var(--sys-border-width-default);
        stroke-linecap: round;
      }

      :host(:hover) .thumb path {
        stroke: var(--comp-slider-thumb-stroke-hover);
      }

      .track:focus-within .thumb path {
        stroke: var(--comp-slider-thumb-stroke-focus);
      }

      :host([disabled]) .thumb path {
        fill: var(--comp-slider-thumb-bg-disabled);
        stroke: var(--comp-slider-thumb-stroke-disabled);
      }

      input[type='range'] {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        margin: 0;
        opacity: 0;
        cursor: inherit;
      }

      label {
        color: var(--comp-slider-text-label);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
      }

      :host([disabled]) label {
        color: var(--comp-slider-text-disabled);
      }
    `,
  ];

  /** Current value. Mirrored to the form value. */
  @property({ type: Number, reflect: true }) value = 0;
  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 100;
  @property({ type: Number }) step = 1;
  /** Submitted control name. */
  @property({ type: String }) name = '';
  /** Optional visible label, also the accessible name. */
  @property({ type: String }) label = '';
  /** Disables interaction and form participation. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  @query('.track') private trackEl!: HTMLDivElement;
  @query('input') private inputEl!: HTMLInputElement;

  private readonly internals: ElementInternals = this.attachInternals();
  private readonly sliderId = `gh-slider-${Math.random().toString(36).slice(2)}`;
  // Captured once on first render — the authored `value`, restored by
  // `formResetCallback`, matching native `<input type="range">` reset behavior.
  private defaultValue = 0;

  protected override get frame(): HTMLElement {
    return this.trackEl ?? this;
  }

  protected override firstUpdated(): void {
    super.firstUpdated();
    this.defaultValue = this.value;
  }

  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  private percent(): number {
    return this.max > this.min
      ? Math.min(1, Math.max(0, (this.value - this.min) / (this.max - this.min)))
      : 0;
  }

  private clampValue(value: number): number {
    return Math.min(this.max, Math.max(this.min, value));
  }

  private syncFormValue(): void {
    this.internals.setFormValue(String(this.value));
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('value') || changed.has('min') || changed.has('max')) {
      const clamped = this.clampValue(this.value);
      if (clamped !== this.value) {
        // Reassigning triggers another `updated()` pass; it converges
        // immediately since the clamped value stays the same next time.
        this.value = clamped;
        return;
      }
    }
    if (changed.has('value') || changed.has('disabled')) {
      this.syncFormValue();
    }
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    const railY = (height - TRACK_HEIGHT) / 2 + INSET;
    const railWidth = width - INSET * 2;
    const railHeight = Math.max(1, TRACK_HEIGHT - INSET * 2);
    return rectangle(INSET, railY, railWidth, railHeight, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.slider.sketch.roughness,
      bowing: tokens.comp.slider.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  private renderFill(): unknown {
    if (this.sketchWidth <= 0 || this.sketchHeight <= 0) {
      return nothing;
    }
    const railY = (this.sketchHeight - TRACK_HEIGHT) / 2 + INSET;
    const railWidth = this.sketchWidth - INSET * 2;
    const railHeight = Math.max(1, TRACK_HEIGHT - INSET * 2);
    const thumbCenterX = this.percent() * (this.sketchWidth - THUMB_SIZE) + THUMB_SIZE / 2;
    const fillWidth = Math.max(0, Math.min(railWidth, thumbCenterX - INSET));
    if (fillWidth <= 0) {
      return nothing;
    }
    const drawable = rectangle(INSET, railY, fillWidth, railHeight, {
      roughness: tokens.comp.slider.sketch.roughness,
      bowing: tokens.comp.slider.sketch.bowing,
      seed: this.effectiveSeed,
      fillStyle: 'solid',
    });
    return html`<svg class="fill" viewBox="0 0 ${this.sketchWidth} ${this.sketchHeight}" aria-hidden="true" focusable="false">
      ${drawable.fillPaths.map((d) => svg`<path d=${d}></path>`)}
    </svg>`;
  }

  private renderThumb(): unknown {
    if (this.sketchWidth <= 0 || this.sketchHeight <= 0) {
      return nothing;
    }
    const thumbCenterX = this.percent() * (this.sketchWidth - THUMB_SIZE) + THUMB_SIZE / 2;
    const x = thumbCenterX - THUMB_SIZE / 2;
    const y = (this.sketchHeight - THUMB_SIZE) / 2;
    const drawable = ellipse(x, y, THUMB_SIZE, THUMB_SIZE, {
      roughness: tokens.comp.slider.sketch.roughness,
      bowing: tokens.comp.slider.sketch.bowing,
      seed: this.effectiveSeed,
      fillStyle: 'solid',
    });
    return html`<svg class="thumb" viewBox="0 0 ${this.sketchWidth} ${this.sketchHeight}" aria-hidden="true" focusable="false">
      ${drawable.fillPaths.map((d) => svg`<path d=${d}></path>`)}
    </svg>`;
  }

  private readonly handleInput = (): void => {
    this.value = Number(this.inputEl.value);
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  };

  private readonly handleChange = (): void => {
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  };

  formResetCallback(): void {
    this.value = this.defaultValue;
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (typeof state === 'string') {
      this.value = Number(state);
    }
  }

  protected override render(): unknown {
    return html`<div class="track">
        ${this.renderSketch()} ${this.renderFill()} ${this.renderThumb()}
        <input
          id=${this.sliderId}
          type="range"
          min=${this.min}
          max=${this.max}
          step=${this.step}
          .value=${String(this.value)}
          aria-label=${this.label ? nothing : this.getAttribute('aria-label') || nothing}
          ?disabled=${this.disabled}
          @input=${this.handleInput}
          @change=${this.handleChange}
        />
      </div>
      ${this.label ? html`<label for=${this.sliderId}>${this.label}</label>` : nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-slider': GhSlider;
  }
}

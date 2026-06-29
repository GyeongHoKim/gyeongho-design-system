import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { type CSSResultGroup, css, html, LitElement, nothing, svg } from 'lit';
import { property, state } from 'lit/decorators.js';

/**
 * Geometry-only sketch parameters a component may tune. The deterministic
 * {@link SketchOptions.seed} is owned by {@link SketchyBase} (fixed once per
 * instance), so subclasses never provide it here.
 */
export type SketchParams = Omit<SketchOptions, 'seed'>;

/**
 * Abstract Lit base for every hand-drawn GHDS web component.
 *
 * Responsibilities:
 * - Measures a frame element via `ResizeObserver` (+ a `getBoundingClientRect`
 *   fallback) and exposes the rounded size as reactive state. The frame defaults
 *   to the host; components whose drawn box is a sub-region (e.g. an input with a
 *   separate label) override {@link frame}.
 * - Owns a deterministic `seed`, fixed **once** per instance so re-renders
 *   (hover/focus/state changes) never make the sketch shimmer. Regeneration
 *   happens **only** when the measured size changes.
 * - Calls `@ghds/sketch-core` (color-agnostic, returns SVG path `d` strings) and
 *   injects the result into an `<svg>` overlay in the shadow DOM.
 *
 * Styling is token-driven: strokes paint with `currentColor`, and `color` plus
 * every other design value resolves from `@ghds/tokens` CSS custom properties,
 * which inherit through the shadow boundary. Nothing here hardcodes a design
 * value, and this module imports no framework other than Lit.
 */
export abstract class SketchyBase extends LitElement {
  /**
   * Shared overlay styles. Subclasses spread this into their own `static styles`.
   * The `<svg>` covers its nearest positioned ancestor (the component's frame
   * container) and never intercepts pointer events. `stroke-width` and all colors
   * come from inherited token custom properties.
   */
  static readonly sketchStyles: CSSResultGroup = css`
    :host {
      box-sizing: border-box;
    }

    .sketch {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: visible;
      pointer-events: none;
      color: inherit;
    }

    .sketch-stroke {
      fill: none;
      stroke: currentColor;
      stroke-width: var(--sys-border-width-default);
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .sketch-fill {
      fill: none;
      stroke: var(--ghds-sketch-fill-color, currentColor);
      stroke-width: var(--sys-border-width-thin);
      stroke-linecap: round;
    }

    .sketch-shadow {
      fill: none;
      stroke: var(--sys-color-border-subtle);
      stroke-width: var(--sys-border-width-default);
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `;

  /**
   * Deterministic seed for the sketch PRNG. Leave unset for a stable random seed
   * generated once per instance; set it to pin output (handy for tests/SSR).
   */
  @property({ type: Number }) seed?: number;

  /** Measured frame width in CSS px (border box, rounded). */
  @state() protected sketchWidth = 0;
  /** Measured frame height in CSS px (border box, rounded). */
  @state() protected sketchHeight = 0;

  /** Random seed fixed once per instance; only used when `seed` is unset. */
  private readonly autoSeed: number = Math.floor(Math.random() * 0x1_0000_0000);
  private resizeObserver?: ResizeObserver;

  /** The effective, lifetime-stable seed for this instance. */
  protected get effectiveSeed(): number {
    return this.seed ?? this.autoSeed;
  }

  /**
   * Element whose border box defines the sketched region. Defaults to the host;
   * override to measure a sub-region rendered in the shadow DOM.
   */
  protected get frame(): HTMLElement {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.measure());
      this.resizeObserver.observe(this);
    }
  }

  override disconnectedCallback(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    super.disconnectedCallback();
  }

  protected override firstUpdated(): void {
    this.measure();
  }

  /**
   * Re-measure the frame border box. Updates reactive state only when an integer
   * dimension actually changed, so sub-pixel reflow never triggers regeneration.
   */
  measure(): void {
    const rect = this.frame.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    if (width !== this.sketchWidth) {
      this.sketchWidth = width;
    }
    if (height !== this.sketchHeight) {
      this.sketchHeight = height;
    }
  }

  /**
   * Token-sourced geometry parameters. Defaults to `sys.sketch.*`; subclasses
   * override to use their own `comp.*` sketch tokens. Never hardcode here.
   */
  protected sketchParams(): SketchParams {
    return {
      roughness: tokens.sys.sketch.roughness,
      bowing: tokens.sys.sketch.bowing,
    };
  }

  /**
   * Produce the drawable for the current size. Subclasses pick the shape
   * (`rectangle`, `ellipse`, …) from `@ghds/sketch-core`.
   */
  protected abstract sketch(width: number, height: number, options: SketchOptions): SketchDrawable;

  /**
   * Render the `<svg>` overlay for the current measured size. Always returns an
   * `<svg class="sketch">` (empty until the frame has a non-zero box) so the
   * surrounding template structure stays stable. Subclasses place this inside a
   * `position: relative` container.
   */
  protected renderSketch(): unknown {
    const width = this.sketchWidth;
    const height = this.sketchHeight;
    const drawable =
      width > 0 && height > 0
        ? this.sketch(width, height, { ...this.sketchParams(), seed: this.effectiveSeed })
        : null;
    return html`<svg
      class="sketch"
      part="sketch"
      width=${width}
      height=${height}
      viewBox="0 0 ${Math.max(width, 0)} ${Math.max(height, 0)}"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      ${
        drawable
          ? [
              ...(drawable.shadowPaths ?? []).map(
                (d) => svg`<path class="sketch-shadow" d=${d}></path>`,
              ),
              ...drawable.fillPaths.map((d) => svg`<path class="sketch-fill" d=${d}></path>`),
              ...drawable.strokePaths.map((d) => svg`<path class="sketch-stroke" d=${d}></path>`),
            ]
          : nothing
      }
    </svg>`;
  }
}

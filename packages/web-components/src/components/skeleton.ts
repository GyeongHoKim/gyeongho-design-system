import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { ellipse, rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

/** Shape of a `<gh-skeleton>` placeholder. */
export type GhSkeletonVariant = 'rect' | 'text' | 'circle';

/**
 * `<gh-skeleton>` — a hand-drawn loading placeholder.
 *
 * A sketchy filled shape (`@ghds/sketch-core`) that gently pulses opacity while
 * content loads. Colours, radius, and the pulse duration are token-driven
 * (`comp.skeleton.*`); the dimmed opacity is `sys.opacity.disabled`. The pulse
 * is suppressed under `prefers-reduced-motion: reduce`. The host is
 * `aria-hidden` — announce the busy state on the region it replaces.
 *
 * The host element itself is the sized box (`inline-block`, matching the React
 * implementation); its width/height/radius are applied in `updated()` so the
 * base `ResizeObserver` (which watches the host) re-measures whenever `width`,
 * `height`, or `variant` change.
 */
@customElement('gh-skeleton')
export class GhSkeleton extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: inline-block;
        position: relative;
        box-sizing: border-box;
        color: var(--comp-skeleton-stroke);
        animation: gh-skeleton-pulse calc(var(--comp-skeleton-duration) * 3) ease-in-out infinite;
      }

      @keyframes gh-skeleton-pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: var(--sys-opacity-disabled);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        :host {
          animation: none;
        }
      }

      /* Override the base's line-stroked fill with a solid region fill. */
      .sketch-fill {
        fill: var(--comp-skeleton-bg);
        stroke: none;
      }
    `,
  ];

  /** Placeholder shape. */
  @property({ type: String, reflect: true }) variant: GhSkeletonVariant = 'rect';
  /** Width as a CSS value. Defaults to `100%` (or the diameter for `circle`). */
  @property({ type: String }) width = '';
  /** Height as a CSS value. Defaults per variant. */
  @property({ type: String }) height = '';

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('aria-hidden', 'true');
  }

  // For `circle`, both axes share one diameter (matching React/RN) so passing a
  // single dimension yields a square, not an ellipse.
  private get circleDiameter(): string {
    return this.height || this.width || 'var(--sys-spacing-2xl)';
  }

  private get resolvedWidth(): string {
    if (this.variant === 'circle') {
      return this.circleDiameter;
    }
    return this.width || '100%';
  }

  private get resolvedHeight(): string {
    if (this.variant === 'circle') {
      return this.circleDiameter;
    }
    return (
      this.height || (this.variant === 'text' ? 'var(--sys-spacing-md)' : 'var(--sys-spacing-lg)')
    );
  }

  private get resolvedRadius(): string {
    return this.variant === 'rect' ? 'var(--comp-skeleton-radius)' : 'var(--sys-radius-pill)';
  }

  protected override updated(): void {
    // Size the host box; changing it triggers the base ResizeObserver → measure.
    this.style.width = this.resolvedWidth;
    this.style.height = this.resolvedHeight;
    this.style.borderRadius = this.resolvedRadius;
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return this.variant === 'circle'
      ? ellipse(0, 0, width, height, options)
      : rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.skeleton.sketch.roughness,
      bowing: tokens.comp.skeleton.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override render(): unknown {
    return this.renderSketch();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-skeleton': GhSkeleton;
  }
}

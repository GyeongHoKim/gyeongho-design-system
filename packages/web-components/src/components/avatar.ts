import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { ellipse } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

/** Rendered diameter of a `<gh-avatar>`. */
export type GhAvatarSize = 'sm' | 'md' | 'lg';

/**
 * `<gh-avatar>` — a hand-drawn circular avatar.
 *
 * Shows an image when `src` loads, otherwise the initials derived from `name`,
 * otherwise an empty sketched circle. The sketchy ellipse outline comes from
 * `@ghds/sketch-core`; every colour, size and sketch parameter is token-driven
 * (`comp.avatar.*`). Exposed to assistive tech as an `img` with `name`/`alt`.
 */
@customElement('gh-avatar')
export class GhAvatar extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: inline-flex;
        --_avatar-size: var(--comp-avatar-size-md);
        width: var(--_avatar-size);
        height: var(--_avatar-size);
      }

      :host([size='sm']) {
        --_avatar-size: var(--comp-avatar-size-sm);
      }

      :host([size='lg']) {
        --_avatar-size: var(--comp-avatar-size-lg);
      }

      .avatar {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: var(--sys-radius-pill);
        background: var(--comp-avatar-bg);
        /* Drives the sketch stroke (currentColor). */
        color: var(--comp-avatar-stroke);
        user-select: none;
      }

      .initials {
        position: relative;
        color: var(--comp-avatar-text);
        font-family: var(--sys-typography-label-fontFamily);
        font-size: var(--sys-typography-label-fontSize);
        font-weight: var(--sys-typography-label-fontWeight);
        line-height: var(--sys-typography-label-lineHeight);
      }

      :host([size='sm']) .initials {
        font-size: var(--sys-typography-caption-fontSize);
      }

      :host([size='lg']) .initials {
        font-size: var(--sys-typography-body-fontSize);
      }

      img {
        position: relative;
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: inherit;
      }
    `,
  ];

  /** Rendered diameter. */
  @property({ type: String, reflect: true }) size: GhAvatarSize = 'md';
  /** Image URL. Falls back to initials, then an empty circle, on load failure. */
  @property({ type: String }) src = '';
  /** Name — used for the accessible label and the initials fallback. */
  @property({ type: String }) name = '';
  /** Overrides the accessible label (defaults to `name`). */
  @property({ type: String }) alt = '';

  @state() private imageFailed = false;

  private readonly internals: ElementInternals = this.attachInternals();

  private get initials(): string {
    const name = this.name.trim();
    if (!name) {
      return '';
    }
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts.length > 1 ? (parts.at(-1)?.charAt(0) ?? '') : '';
    return (first + last).toUpperCase();
  }

  protected override willUpdate(changed: PropertyValues): void {
    // Retry a new image instead of stranding it behind the fallback: a fresh
    // `src` clears a prior load failure.
    if (changed.has('src')) {
      this.imageFailed = false;
    }
  }

  protected override updated(): void {
    const label = this.alt || this.name;
    if (label) {
      this.internals.role = 'img';
      this.internals.ariaLabel = label;
    } else {
      this.internals.role = null;
      this.internals.ariaLabel = null;
    }
  }

  private readonly handleError = (): void => {
    this.imageFailed = true;
  };

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return ellipse(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.avatar.sketch.roughness,
      bowing: tokens.comp.avatar.sketch.bowing,
    };
  }

  protected override render(): unknown {
    const showImage = this.src !== '' && !this.imageFailed;
    return html`<span class="avatar" part="avatar">
      ${this.renderSketch()}
      ${
        showImage
          ? html`<img src=${this.src} alt="" @error=${this.handleError} />`
          : html`<span class="initials" aria-hidden="true">${this.initials}</span>`
      }
    </span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-avatar': GhAvatar;
  }
}

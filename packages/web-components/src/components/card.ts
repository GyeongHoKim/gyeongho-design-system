import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

export type CardVariant = 'plain' | 'sticky' | 'lined';
export type CardTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type CardFastener = 'none' | 'tape' | 'pin';
export type CardTilt = 'none' | 'left' | 'right';

/**
 * `<gh-card>` — a hand-drawn surface container.
 *
 * Draws a sketchy rectangle outline around slotted content. When `elevated`,
 * the sketch engine emits an offset "drop shadow" outline (`shadowPaths`) using
 * the `sys.sketch.elevation` token to fake depth. Background, padding, radius
 * and text colour are all token-driven.
 *
 * Set `href` to make the whole card a link: the surface renders as
 * `<a class="content">` (with `target` / `rel`), gains a hover stroke and a
 * focus ring, and lifts like an `interactive` card.
 *
 * @slot title - Optional heading, rendered before the body with title styling.
 * @slot - Card body. A slotted `h1`–`h3` also gets title styling.
 */
@customElement('gh-card')
export class GhCard extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: block;
        color: var(--sys-color-border-default);
      }

      .content {
        position: relative;
        box-sizing: border-box;
        padding: var(--sys-spacing-lg);
        background: var(--sys-color-bg-surface);
        border-radius: var(--sys-radius-md);
        color: var(--sys-color-text-primary);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        font-weight: var(--sys-typography-body-fontWeight);
        line-height: var(--sys-typography-body-lineHeight);
      }

      .content {
        --_angle: 0deg;
      }

      /* The sketch outline paints with currentColor; give it the card stroke token. */
      .content > .sketch {
        color: var(--comp-card-stroke-default);
      }

      a.content {
        display: block;
        text-decoration: none;
        cursor: pointer;
      }

      /*
       * A focusable host (tabindex on gh-card) moves its ring onto the paper:
       * an outline on .content follows the folded corner radius and the tilt,
       * where the browser's default host outline is an upright rectangle.
       */
      :host(:focus-visible) {
        outline: none;
      }

      a.content:focus-visible,
      :host(:focus-visible) .content {
        outline: var(--sys-border-width-thick) solid var(--comp-card-focus-ring);
        outline-offset: var(--sys-spacing-xs);
      }

      @media (hover: hover) {
        a.content:hover > .sketch {
          color: var(--comp-card-stroke-hover);
        }
      }

      :host([fastener='tape']) .content,
      :host([fastener='pin']) .content {
        transform-origin: 50% 0;
      }

      :host([variant='sticky']) .content {
        background: var(--comp-card-sticky-bg-neutral);
        border-radius: var(--comp-card-sticky-radius-small) var(--comp-card-sticky-radius-small)
          var(--comp-card-sticky-radius-small) var(--comp-card-sticky-radius-fold);
        box-shadow: var(--comp-card-sticky-shadow);
        padding-block-start: var(--comp-card-sticky-padding-top);
        padding-inline: var(--comp-card-sticky-padding-inline);
        padding-block-end: var(--comp-card-sticky-padding-bottom);
      }

      :host([variant='sticky'][tone='neutral']) .content {
        background: var(--comp-card-sticky-bg-neutral);
      }

      :host([variant='sticky'][tone='primary']) .content {
        background: var(--comp-card-sticky-bg-primary);
      }

      :host([variant='sticky'][tone='success']) .content {
        background: var(--comp-card-sticky-bg-success);
      }

      :host([variant='sticky'][tone='warning']) .content {
        background: var(--comp-card-sticky-bg-warning);
      }

      :host([variant='sticky'][tone='danger']) .content {
        background: var(--comp-card-sticky-bg-danger);
      }

      :host([variant='sticky'][tone='info']) .content {
        background: var(--comp-card-sticky-bg-info);
      }

      :host([variant='lined']) .content {
        background-color: var(--comp-card-lined-bg);
        /* Rules are symmetric; the margin line is the direction-aware .margin-line element. */
        background-image: repeating-linear-gradient(
          180deg,
          transparent 0,
          transparent calc(var(--comp-card-lined-rule-gap) - var(--comp-card-lined-rule-width)),
          var(--comp-card-lined-rule-color)
            calc(var(--comp-card-lined-rule-gap) - var(--comp-card-lined-rule-width)),
          var(--comp-card-lined-rule-color) var(--comp-card-lined-rule-gap)
        );
        background-position: 0 var(--comp-card-lined-padding-top);
        background-size: 100% var(--comp-card-lined-rule-gap);
        background-repeat: repeat;
        border-radius: var(--comp-card-lined-radius);
        box-shadow: var(--comp-card-lined-shadow);
        padding-block-start: var(--comp-card-lined-padding-top);
        padding-inline-end: var(--comp-card-lined-padding-inline);
        padding-block-end: var(--comp-card-lined-padding-bottom);
        padding-inline-start: var(--comp-card-lined-padding-start);
      }

      /* Rendered before .body (position: relative), so the content paints over it. */
      .margin-line {
        position: absolute;
        inset-block: 0;
        inset-inline-start: var(--comp-card-lined-margin-offset);
        inline-size: var(--comp-card-lined-margin-width);
        background: var(--comp-card-lined-margin-color);
        pointer-events: none;
      }

      :host([variant='sticky'][tilt='left']) .content {
        --_angle: calc(var(--comp-card-tilt-sticky) * -1deg);
        transform: rotate(var(--_angle));
      }

      :host([variant='sticky'][tilt='right']) .content {
        --_angle: calc(var(--comp-card-tilt-sticky) * 1deg);
        transform: rotate(var(--_angle));
      }

      :host([variant='lined'][tilt='left']) .content {
        --_angle: calc(var(--comp-card-tilt-lined) * -1deg);
        transform: rotate(var(--_angle));
      }

      :host([variant='lined'][tilt='right']) .content {
        --_angle: calc(var(--comp-card-tilt-lined) * 1deg);
        transform: rotate(var(--_angle));
      }

      .fastener-tape {
        position: absolute;
        top: calc(var(--comp-card-fastener-tape-height) / -2);
        left: 50%;
        box-sizing: border-box;
        width: var(--comp-card-fastener-tape-width);
        height: var(--comp-card-fastener-tape-height);
        background: var(--comp-card-fastener-tape-bg);
        border-inline: var(--comp-card-fastener-tape-border-width) dashed
          var(--comp-card-fastener-tape-border-color);
        opacity: var(--comp-card-fastener-tape-opacity);
        pointer-events: none;
        transform: translateX(-50%)
          rotate(calc(-1 * var(--_angle) - var(--comp-card-fastener-tape-tilt) * 1deg));
      }

      .fastener-pin {
        position: absolute;
        top: 0;
        left: 50%;
        width: var(--comp-card-fastener-pin-size);
        height: auto;
        overflow: visible;
        pointer-events: none;
        /* Head centre (14, 11) of the 28x30 viewBox lands on the top edge. */
        transform: translate(-50%, -36.6667%);
      }

      .fastener-pin .pin-shadow {
        fill: var(--comp-card-fastener-pin-shadow);
        fill-opacity: var(--comp-card-fastener-pin-shadowOpacity);
      }

      .fastener-pin .pin-needle {
        stroke: var(--comp-card-fastener-pin-needle);
      }

      .fastener-pin .pin-head {
        fill: var(--comp-card-fastener-pin-color-neutral);
      }

      .fastener-pin .pin-highlight {
        fill: var(--comp-card-fastener-pin-highlight);
        fill-opacity: var(--comp-card-fastener-pin-highlightOpacity);
      }

      :host([tone='neutral']) .fastener-pin .pin-head {
        fill: var(--comp-card-fastener-pin-color-neutral);
      }

      :host([tone='primary']) .fastener-pin .pin-head {
        fill: var(--comp-card-fastener-pin-color-primary);
      }

      :host([tone='success']) .fastener-pin .pin-head {
        fill: var(--comp-card-fastener-pin-color-success);
      }

      :host([tone='warning']) .fastener-pin .pin-head {
        fill: var(--comp-card-fastener-pin-color-warning);
      }

      :host([tone='danger']) .fastener-pin .pin-head {
        fill: var(--comp-card-fastener-pin-color-danger);
      }

      :host([tone='info']) .fastener-pin .pin-head {
        fill: var(--comp-card-fastener-pin-color-info);
      }

      :host([interactive]) .content,
      a.content {
        transition:
          transform var(--comp-card-hover-duration) var(--comp-card-hover-easing),
          box-shadow var(--comp-card-hover-duration) var(--comp-card-hover-easing);
      }

      @media (hover: hover) {
        :host([interactive]) .content:hover,
        a.content:hover {
          transform: translateY(calc(var(--comp-card-hover-lift) * -1))
            rotate(calc(var(--_angle) - var(--comp-card-hover-rotate) * 1deg));
        }

        :host([interactive][variant='sticky']) .content:hover,
        :host([interactive][variant='lined']) .content:hover,
        :host([variant='sticky']) a.content:hover,
        :host([variant='lined']) a.content:hover {
          box-shadow: var(--comp-card-hover-shadow);
        }
      }

      /* The host form also matches when the host itself is focused (tabindex on gh-card).
         Scoped to the div surface: a link card lifts only on keyboard focus (focus-visible). */
      :host([interactive]) div.content:focus-within,
      :host([interactive]:focus-within) div.content,
      a.content:focus-visible {
        transform: translateY(calc(var(--comp-card-hover-lift) * -1))
          rotate(calc(var(--_angle) - var(--comp-card-hover-rotate) * 1deg));
      }

      :host([interactive][variant='sticky']) div.content:focus-within,
      :host([interactive][variant='lined']) div.content:focus-within,
      :host([variant='sticky']) a.content:focus-visible,
      :host([variant='lined']) a.content:focus-visible {
        box-shadow: var(--comp-card-hover-shadow);
      }

      :host([interactive][variant='sticky']:focus-within) div.content,
      :host([interactive][variant='lined']:focus-within) div.content {
        box-shadow: var(--comp-card-hover-shadow);
      }

      @media (prefers-reduced-motion: reduce) {
        :host([interactive]) .content,
        a.content {
          transition: none;
        }
      }

      .body {
        position: relative;
      }

      ::slotted(h1),
      ::slotted(h2),
      ::slotted(h3),
      ::slotted([slot='title']) {
        margin: 0 0 var(--sys-spacing-sm);
        font-family: var(--sys-typography-title-fontFamily);
        font-size: var(--sys-typography-title-fontSize);
        font-weight: var(--sys-typography-title-fontWeight);
        line-height: var(--sys-typography-title-lineHeight);
        color: var(--sys-color-text-primary);
      }
    `,
  ];

  /** When true, render a sketch drop-shadow to suggest elevation. */
  @property({ type: Boolean, reflect: true }) elevated = false;

  /**
   * Surface treatment: sketch-outlined `plain`, or CSS paper `sticky` / `lined`.
   * Any other value renders as `plain`.
   */
  @property({ type: String, reflect: true }) variant: CardVariant = 'plain';

  /** Paper colour of a `sticky` card and the pin head colour on every variant. */
  @property({ type: String, reflect: true }) tone: CardTone = 'neutral';

  /** Decorative tape or pin overhanging the top edge; renders on every variant. */
  @property({ type: String, reflect: true }) fastener: CardFastener = 'none';

  /** Lean of paper variants; no effect on `plain`. */
  @property({ type: String, reflect: true }) tilt: CardTilt = 'none';

  /** Lifts on hover and while focus is inside. */
  @property({ type: Boolean, reflect: true }) interactive = false;

  /**
   * Optional accessible label. A plain card exposes a labelled group; a link
   * card puts the label on its anchor.
   */
  @property({ type: String }) label = '';

  /** When set (non-empty), the whole card renders as a link (`<a href>`). */
  @property({ type: String }) href?: string;

  /** Anchor `target`, forwarded only when `href` is set. */
  @property({ type: String }) target?: string;

  /** Anchor `rel`, forwarded only when `href` is set. */
  @property({ type: String }) rel?: string;

  /** True when the surface renders as a link. */
  private get isLink(): boolean {
    return this.href !== undefined && this.href !== '';
  }

  private readonly internals: ElementInternals = this.attachInternals();

  /** The shadow anchor of a link card, or null when the card is not a link. */
  private get anchor(): HTMLAnchorElement | null {
    return this.isLink ? this.renderRoot.querySelector<HTMLAnchorElement>('a.content') : null;
  }

  /** A link card forwards focus to its anchor, the real focus target. */
  override focus(options?: FocusOptions): void {
    const anchor = this.anchor;
    if (anchor) anchor.focus(options);
    else super.focus(options);
  }

  /** A link card forwards programmatic clicks to its anchor, so `click()` follows the link. */
  override click(): void {
    const anchor = this.anchor;
    if (anchor) anchor.click();
    else super.click();
  }

  protected override updated(): void {
    // A link card's semantics come from its anchor, so the host stays role-less.
    if (this.label && !this.isLink) {
      this.internals.role = 'group';
      this.internals.ariaLabel = this.label;
    } else {
      this.internals.role = null;
      this.internals.ariaLabel = null;
    }
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    const base: SketchParams = {
      roughness: tokens.sys.sketch.roughness,
      bowing: tokens.sys.sketch.bowing,
    };
    return this.elevated ? { ...base, elevation: tokens.sys.sketch.elevation } : base;
  }

  private renderFastener(): unknown {
    if (this.fastener === 'tape') {
      return html`<span class="fastener-tape" aria-hidden="true"></span>`;
    }
    if (this.fastener === 'pin') {
      return html`<svg
        class="fastener-pin"
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 28 30"
      >
        <ellipse class="pin-shadow" cx="17" cy="24" rx="7" ry="3"></ellipse>
        <line
          class="pin-needle"
          x1="14"
          y1="14"
          x2="16"
          y2="24"
          stroke-width="2"
          stroke-linecap="round"
        ></line>
        <circle class="pin-head" cx="14" cy="11" r="10"></circle>
        <circle class="pin-highlight" cx="10.5" cy="7.5" r="3.5"></circle>
      </svg>`;
    }
    return nothing;
  }

  protected override render(): unknown {
    const surface: TemplateResult = html`
      ${this.variant === 'sticky' || this.variant === 'lined' ? nothing : this.renderSketch()}
      ${this.renderFastener()}
      ${
        this.variant === 'lined'
          ? html`<span class="margin-line" aria-hidden="true"></span>`
          : nothing
      }
      <div class="body">
        <slot name="title"></slot>
        <slot></slot>
      </div>
    `;
    if (this.isLink) {
      return html`<a
        class="content"
        part="content"
        href=${ifDefined(this.href)}
        target=${ifDefined(this.target)}
        rel=${ifDefined(this.rel)}
        aria-label=${this.label || nothing}
        >${surface}</a
      >`;
    }
    return html`<div class="content" part="content">${surface}</div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-card': GhCard;
  }
}

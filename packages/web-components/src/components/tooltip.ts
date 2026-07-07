import { computePosition, flip, offset, shift } from '@floating-ui/dom';
import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

let tooltipUid = 0;

/**
 * `<gh-tooltip>` — a hand-drawn tooltip.
 *
 * Wraps a slotted trigger and shows a sketchy bubble (`@ghds/sketch-core`) on
 * hover (after `delay`) or focus, hiding on leave / blur / Escape. Positioned
 * with `@floating-ui/dom`. The slotted trigger is linked to the bubble via
 * `aria-describedby`. Colours, padding, and sketch parameters come from
 * `@ghds/tokens` (`comp.tooltip.*`).
 */
@customElement('gh-tooltip')
export class GhTooltip extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: inline-block;
        color: var(--comp-tooltip-stroke);
      }

      .bubble {
        position: fixed;
        left: 0;
        top: 0;
        z-index: var(--sys-zIndex-tooltip);
        display: none;
        box-sizing: border-box;
        max-width: 16rem;
        padding: var(--comp-tooltip-padding-vertical) var(--comp-tooltip-padding-horizontal);
        color: var(--comp-tooltip-text);
        font-family: var(--sys-typography-caption-fontFamily);
        font-size: var(--sys-typography-caption-fontSize);
        line-height: var(--sys-typography-caption-lineHeight);
        pointer-events: none;
      }

      :host([open]) .bubble {
        display: block;
      }

      .label {
        position: relative;
      }

      .sketch-fill {
        fill: var(--comp-tooltip-bg);
        stroke: none;
      }
    `,
  ];

  /** Tooltip text. */
  @property({ type: String }) content = '';
  /** Delay (ms) before showing on hover. Defaults to the `slow` motion duration. */
  @property({ type: Number }) delay = Number.parseFloat(tokens.sys.animation.duration.slow);
  @property({ type: Boolean, reflect: true }) open = false;

  private focused = false;

  @query('.bubble') private bubbleEl?: HTMLElement;

  private readonly tooltipId = `gh-tooltip-${tooltipUid++}`;
  private timer: ReturnType<typeof setTimeout> | null = null;

  // Measure the bubble (not the host) so the sketch sizes to the tip.
  protected override get frame(): HTMLElement {
    return this.bubbleEl ?? this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('mouseenter', this.onEnter);
    this.addEventListener('mouseleave', this.onLeave);
    this.addEventListener('focusin', this.onFocus);
    this.addEventListener('focusout', this.onBlur);
    this.addEventListener('keydown', this.onKeydown);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('mouseenter', this.onEnter);
    this.removeEventListener('mouseleave', this.onLeave);
    this.removeEventListener('focusin', this.onFocus);
    this.removeEventListener('focusout', this.onBlur);
    this.removeEventListener('keydown', this.onKeydown);
    this.clearTimer();
    super.disconnectedCallback();
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private readonly onEnter = (): void => {
    this.clearTimer();
    this.timer = setTimeout(() => this.reveal(), this.delay);
  };
  private readonly onFocus = (): void => {
    this.focused = true;
    void this.reveal();
  };
  private readonly onLeave = (): void => {
    // Keep it open while the trigger holds focus.
    if (!this.focused) {
      this.dismiss();
    }
  };
  private readonly onBlur = (): void => {
    this.focused = false;
    this.dismiss();
  };
  private readonly onKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.dismiss();
    }
  };

  private async reveal(): Promise<void> {
    this.clearTimer();
    this.open = true;
    // Link the slotted trigger to the bubble for assistive tech.
    const trigger = this.querySelector<HTMLElement>('*');
    trigger?.setAttribute('aria-describedby', this.tooltipId);
    await this.updateComplete;
    const bubble = this.bubbleEl;
    if (bubble) {
      const { x, y } = await computePosition(this, bubble, {
        strategy: 'fixed',
        placement: 'top',
        middleware: [
          offset(Number.parseFloat(tokens.comp.tooltip.offset)),
          flip(),
          shift({ padding: Number.parseFloat(tokens.sys.spacing.sm) }),
        ],
      });
      bubble.style.left = `${x}px`;
      bubble.style.top = `${y}px`;
      this.measure();
    }
  }

  private dismiss(): void {
    this.clearTimer();
    this.open = false;
    this.querySelector<HTMLElement>('*')?.removeAttribute('aria-describedby');
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.tooltip.sketch.roughness,
      bowing: tokens.comp.tooltip.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override render(): unknown {
    return html`<slot></slot>
      <div class="bubble" id=${this.tooltipId} role="tooltip">
        ${this.renderSketch()}
        <span class="label">${this.content}</span>
      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-tooltip': GhTooltip;
  }
}

import { computePosition, flip, offset, shift } from '@floating-ui/dom';
import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

let hoverCardUid = 0;

/**
 * `<gh-hover-card>` — a hand-drawn hover card.
 *
 * Wraps a focusable trigger (slot `trigger`) and reveals a floating panel of
 * rich content (default slot) on hover (after `delay`) or focus, hiding on
 * leave / blur / Escape. Positioned with `@floating-ui/dom`; the trigger is
 * linked to the panel via `aria-describedby`. Colours, padding and sketch
 * parameters come from `@ghds/tokens` (`comp.hoverCard.*`).
 */
@customElement('gh-hover-card')
export class GhHoverCard extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: inline-block;
        color: var(--comp-hoverCard-stroke);
      }

      .trigger {
        display: inline-flex;
        cursor: pointer;
        color: inherit;
      }

      .trigger:focus-visible {
        outline: var(--sys-border-width-thick) solid var(--comp-hoverCard-stroke);
        outline-offset: var(--sys-spacing-xs);
      }

      .panel {
        position: fixed;
        left: 0;
        top: 0;
        z-index: var(--sys-zIndex-popover, var(--sys-zIndex-tooltip));
        display: none;
        box-sizing: border-box;
        min-width: 14rem;
        max-width: 20rem;
        padding: var(--comp-hoverCard-padding-vertical) var(--comp-hoverCard-padding-horizontal);
        color: var(--comp-hoverCard-text);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        line-height: var(--sys-typography-body-lineHeight);
      }

      :host([open]) .panel {
        display: block;
      }

      .content {
        position: relative;
      }

      .sketch-fill {
        fill: var(--comp-hoverCard-bg);
        stroke: none;
      }
    `,
  ];

  /** Delay (ms) before showing on hover. Defaults to the `slow` motion duration. */
  @property({ type: Number }) delay = Number.parseFloat(tokens.sys.animation.duration.slow);
  /** Controlled open state. */
  @property({ type: Boolean, reflect: true }) open = false;

  @query('.trigger') private triggerEl?: HTMLElement;
  @query('.panel') private panelEl?: HTMLElement;

  private focused = false;
  private readonly panelId = `gh-hover-card-${hoverCardUid++}`;
  private timer: ReturnType<typeof setTimeout> | null = null;

  protected override get frame(): HTMLElement {
    return this.panelEl ?? this;
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
    this.timer = setTimeout(() => void this.reveal(), this.delay);
  };
  private readonly onFocus = (): void => {
    this.focused = true;
    void this.reveal();
  };
  private readonly onLeave = (): void => {
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
    this.triggerEl?.setAttribute('aria-describedby', this.panelId);
    await this.updateComplete;
    const trigger = this.triggerEl;
    const panel = this.panelEl;
    if (trigger && panel) {
      const { x, y } = await computePosition(trigger, panel, {
        strategy: 'fixed',
        placement: 'bottom',
        middleware: [
          offset(Number.parseFloat(tokens.comp.hoverCard.offset)),
          flip(),
          shift({ padding: Number.parseFloat(tokens.sys.spacing.sm) }),
        ],
      });
      panel.style.left = `${x}px`;
      panel.style.top = `${y}px`;
      this.measure();
    }
  }

  private dismiss(): void {
    this.clearTimer();
    this.open = false;
    this.triggerEl?.removeAttribute('aria-describedby');
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.hoverCard.sketch.roughness,
      bowing: tokens.comp.hoverCard.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override render(): unknown {
    return html`<span class="trigger" tabindex="0"><slot name="trigger"></slot></span>
      <div class="panel" id=${this.panelId} role="dialog">
        ${this.renderSketch()}
        <div class="content"><slot></slot></div>
      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-hover-card': GhHoverCard;
  }
}

import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

/** Who sent the message a `<gh-bubble>` holds. */
export type GhBubbleVariant = 'received' | 'sent';

/**
 * `<gh-bubble>` — a hand-drawn chat bubble.
 *
 * The sketchy rounded box (outline from `@ghds/sketch-core` over a token-driven
 * fill) frames slotted content. `'received'` (default) is a muted incoming
 * bubble; `'sent'` is a filled outgoing bubble in the primary colour. Alignment
 * within a conversation is the caller's concern (see `<gh-message>`); the bubble
 * only paints itself. Colours come from `comp.bubble.*` tokens.
 */
@customElement('gh-bubble')
export class GhBubble extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: inline-block;
        max-width: 100%;
      }

      .bubble {
        position: relative;
        box-sizing: border-box;
        max-width: 100%;
        padding: var(--comp-bubble-padding-vertical) var(--comp-bubble-padding-horizontal);
        background: var(--comp-bubble-bg-received);
        border-radius: var(--comp-bubble-radius);
        /* Drives the sketch stroke (currentColor). */
        color: var(--comp-bubble-stroke-received);
      }

      .content {
        position: relative;
        color: var(--comp-bubble-text-received);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        font-weight: var(--sys-typography-body-fontWeight);
        line-height: var(--sys-typography-body-lineHeight);
      }

      :host([variant='sent']) .bubble {
        background: var(--comp-bubble-bg-sent);
        color: var(--comp-bubble-stroke-sent);
      }

      :host([variant='sent']) .content {
        color: var(--comp-bubble-text-sent);
      }
    `,
  ];

  /** Incoming (`'received'`, default) or outgoing (`'sent'`) styling. */
  @property({ type: String, reflect: true }) variant: GhBubbleVariant = 'received';

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.bubble.sketch.roughness,
      bowing: tokens.comp.bubble.sketch.bowing,
    };
  }

  protected override render(): unknown {
    return html`<div class="bubble" part="bubble">
      ${this.renderSketch()}
      <span class="content"><slot></slot></span>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-bubble': GhBubble;
  }
}

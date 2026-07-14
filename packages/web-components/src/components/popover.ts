import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

let popoverUid = 0;

/**
 * `<gh-popover>` — a hand-drawn popover.
 *
 * A `<button>` trigger (slot `trigger`, or the `label` prop) toggles a floating
 * `role="dialog"` panel that renders the default slot inside a sketchy, solid
 * box (`@ghds/sketch-core`). Positioned with `@floating-ui/dom`; closes on
 * outside pointer-down and Escape (restoring trigger focus). Colours, padding
 * and sketch parameters come from `@ghds/tokens` (`comp.popover.*`).
 */
@customElement('gh-popover')
export class GhPopover extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: inline-block;
        color: var(--comp-popover-stroke);
      }

      .trigger {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: var(--sys-spacing-xs);
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        cursor: pointer;
      }

      .trigger:focus-visible {
        outline: var(--sys-border-width-thick) solid var(--comp-popover-stroke);
        outline-offset: var(--sys-spacing-xs);
      }

      .panel {
        position: fixed;
        left: 0;
        top: 0;
        z-index: var(--sys-zIndex-popover, var(--sys-zIndex-tooltip));
        display: none;
        box-sizing: border-box;
        min-width: 12rem;
        max-width: 20rem;
        padding: var(--comp-popover-padding-vertical) var(--comp-popover-padding-horizontal);
        color: var(--comp-popover-text);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        line-height: var(--sys-typography-body-lineHeight);
      }

      .panel.open {
        display: block;
      }

      .content {
        position: relative;
      }

      .sketch-fill {
        fill: var(--comp-popover-bg);
        stroke: none;
      }
    `,
  ];

  /** Fallback trigger text when the `trigger` slot is empty. */
  @property({ type: String }) label = '';
  /** Controlled open state. */
  @property({ type: Boolean, reflect: true }) open = false;

  @query('.trigger') private triggerEl?: HTMLButtonElement;
  @query('.panel') private panelEl?: HTMLElement;

  private readonly uid = `gh-popover-${popoverUid++}`;
  private cleanupAutoUpdate?: () => void;

  protected override get frame(): HTMLElement {
    return this.panelEl ?? this;
  }

  override disconnectedCallback(): void {
    this.cleanupAutoUpdate?.();
    document.removeEventListener('pointerdown', this.onPointerDown);
    super.disconnectedCallback();
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (!event.composedPath().includes(this)) {
      this.close(false);
    }
  };

  private toggle(): void {
    if (this.open) {
      this.close(false);
    } else {
      void this.show();
    }
  }

  private async show(): Promise<void> {
    this.open = true;
    document.addEventListener('pointerdown', this.onPointerDown);
    await this.updateComplete;
    const trigger = this.triggerEl;
    const panel = this.panelEl;
    if (trigger && panel) {
      this.cleanupAutoUpdate = autoUpdate(trigger, panel, () => {
        computePosition(trigger, panel, {
          strategy: 'fixed',
          placement: 'bottom-start',
          middleware: [
            offset(Number.parseFloat(tokens.comp.popover.offset)),
            flip(),
            shift({ padding: Number.parseFloat(tokens.sys.spacing.sm) }),
          ],
        }).then(({ x, y }) => {
          panel.style.left = `${x}px`;
          panel.style.top = `${y}px`;
          this.measure();
        });
      });
    }
  }

  private close(restoreFocus = true): void {
    this.open = false;
    this.cleanupAutoUpdate?.();
    this.cleanupAutoUpdate = undefined;
    document.removeEventListener('pointerdown', this.onPointerDown);
    if (restoreFocus) {
      this.triggerEl?.focus();
    }
  }

  private readonly onKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.open) {
      event.preventDefault();
      this.close();
    }
  };

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.popover.sketch.roughness,
      bowing: tokens.comp.popover.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override render(): unknown {
    return html`<button
        class="trigger"
        type="button"
        aria-haspopup="dialog"
        aria-expanded=${this.open ? 'true' : 'false'}
        aria-controls=${`${this.uid}-panel`}
        @click=${() => this.toggle()}
        @keydown=${this.onKeydown}
      >
        <slot name="trigger">${this.label}</slot>
      </button>
      <div
        class=${this.open ? 'panel open' : 'panel'}
        id=${`${this.uid}-panel`}
        role="dialog"
        @keydown=${this.onKeydown}
      >
        ${this.renderSketch()}
        <div class="content"><slot></slot></div>
      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-popover': GhPopover;
  }
}

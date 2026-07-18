import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { line } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

/** Layout axis a `<gh-resizable-group>` splits along. */
export type GhResizableDirection = 'horizontal' | 'vertical';

/** Percentage step applied per arrow-key press. */
const KEYBOARD_STEP = 5;

/**
 * `<gh-resizable-handle>` — the draggable divider between two
 * `<gh-resizable-panel>`s.
 *
 * Draws a single sketchy line (`@ghds/sketch-core`) across the divider, oriented
 * for the group's axis. It is a focusable `role="separator"` with
 * `aria-orientation` and live `aria-valuenow`/`min`/`max`; pointer drag and arrow
 * keys are surfaced to the parent group via composed events
 * (`gh-resizable-handle-pointerdown` / `gh-resizable-handle-key`), which owns the
 * layout maths. Colours and sketch parameters come from `comp.resizable.*` tokens.
 */
@customElement('gh-resizable-handle')
export class GhResizableHandle extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        position: relative;
        flex: 0 0 var(--comp-resizable-size);
        align-self: stretch;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        color: var(--comp-resizable-handle-default);
        cursor: col-resize;
        touch-action: none;
      }

      :host(:hover) {
        color: var(--comp-resizable-handle-hover);
      }

      :host([direction='vertical']) {
        cursor: row-resize;
      }

      :host(:focus-visible) {
        outline: var(--sys-border-width-thick) solid var(--sys-color-border-focus);
        outline-offset: var(--sys-spacing-xs);
        border-radius: var(--sys-radius-sm);
      }

      .grip {
        position: relative;
        width: var(--sys-spacing-xs);
        height: var(--sys-spacing-lg);
        border-radius: var(--comp-resizable-radius);
        background: var(--comp-resizable-grip-default);
      }

      :host([direction='vertical']) .grip {
        width: var(--sys-spacing-lg);
        height: var(--sys-spacing-xs);
      }
    `,
  ];

  /** Axis of the parent group; set by `<gh-resizable-group>`. */
  @property({ type: String, reflect: true }) direction: GhResizableDirection = 'horizontal';
  /** Size (percent) of the panel before this handle; drives `aria-valuenow`. */
  @property({ type: Number }) valueNow?: number;
  /** Shows a visible grip in the middle of the handle. */
  @property({ type: Boolean, reflect: true, attribute: 'with-handle' }) withHandle = false;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'separator');
    }
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
    }
    this.addEventListener('pointerdown', this.handlePointerDown);
    this.addEventListener('keydown', this.handleKeyDown);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('pointerdown', this.handlePointerDown);
    this.removeEventListener('keydown', this.handleKeyDown);
    super.disconnectedCallback();
  }

  protected override updated(changed: PropertyValues): void {
    // The separator is perpendicular to the group's axis.
    this.setAttribute(
      'aria-orientation',
      this.direction === 'horizontal' ? 'vertical' : 'horizontal',
    );
    this.setAttribute('aria-valuemin', '0');
    this.setAttribute('aria-valuemax', '100');
    if (this.valueNow !== undefined) {
      this.setAttribute('aria-valuenow', String(Math.round(this.valueNow)));
    } else {
      this.removeAttribute('aria-valuenow');
    }
    if (changed.has('direction')) {
      this.measure();
    }
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return this.direction === 'horizontal'
      ? line(width / 2, 0, width / 2, height, options)
      : line(0, height / 2, width, height / 2, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.resizable.sketch.roughness,
      bowing: tokens.comp.resizable.sketch.bowing,
    };
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    event.preventDefault();
    this.dispatchEvent(
      new CustomEvent('gh-resizable-handle-pointerdown', {
        detail: { clientX: event.clientX, clientY: event.clientY, pointerId: event.pointerId },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    const decreaseKey = this.direction === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    const increaseKey = this.direction === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    let delta = 0;
    if (event.key === decreaseKey) {
      delta = -KEYBOARD_STEP;
    } else if (event.key === increaseKey) {
      delta = KEYBOARD_STEP;
    } else {
      return;
    }
    event.preventDefault();
    this.dispatchEvent(
      new CustomEvent('gh-resizable-handle-key', {
        detail: { delta },
        bubbles: true,
        composed: true,
      }),
    );
  };

  protected override render(): unknown {
    return html`${this.renderSketch()}${
      this.withHandle ? html`<span class="grip"></span>` : nothing
    }`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-resizable-handle': GhResizableHandle;
  }
}

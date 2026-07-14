import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

let drawerUid = 0;

/**
 * `<gh-drawer>` — a hand-drawn bottom-anchored drawer.
 *
 * Built on the native `<dialog>` (`showModal()`) like `gh-modal`, anchored to
 * the bottom edge with a grabber handle. The panel is a sketchy, solid box
 * (`@ghds/sketch-core`). Reflects `open`, dispatches a `close` `CustomEvent` on
 * Escape / backdrop click. Colours and sketch parameters come from
 * `@ghds/tokens` (`comp.drawer.*`).
 */
@customElement('gh-drawer')
export class GhDrawer extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        color: var(--comp-drawer-stroke);
      }

      dialog {
        position: fixed;
        inset: auto 0 0 0;
        box-sizing: border-box;
        width: 100%;
        max-height: 85vh;
        margin: 0 auto;
        padding: var(--comp-drawer-padding);
        border: none;
        background: transparent;
        color: var(--sys-color-text-primary);
        overflow: visible;
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        line-height: var(--sys-typography-body-lineHeight);
      }

      dialog::backdrop {
        background: var(--comp-drawer-scrim);
      }

      .handle {
        position: relative;
        width: var(--sys-spacing-xl);
        height: var(--sys-spacing-xs);
        margin: 0 auto var(--sys-spacing-md);
        border-radius: var(--sys-radius-pill, var(--sys-radius-lg));
        background: var(--comp-drawer-stroke);
      }

      .title {
        position: relative;
        margin: 0 0 var(--sys-spacing-md);
        color: var(--sys-color-text-primary);
        font-family: var(--sys-typography-title-fontFamily);
        font-size: var(--sys-typography-title-fontSize);
        font-weight: var(--sys-typography-title-fontWeight);
        line-height: var(--sys-typography-title-lineHeight);
      }

      .body {
        position: relative;
      }

      .sketch-fill {
        fill: var(--comp-drawer-bg);
        stroke: none;
      }
    `,
  ];

  /** Whether the drawer is shown. */
  @property({ type: Boolean, reflect: true }) open = false;
  /** Accessible title, rendered as a heading and wired to `aria-labelledby`. */
  @property({ type: String }) heading = '';
  /** Close when the backdrop is clicked. */
  @property({ type: Boolean }) closeOnScrimClick = true;

  @query('dialog') private dialogEl?: HTMLDialogElement;

  private readonly titleId = `gh-drawer-${drawerUid++}-title`;

  protected override get frame(): HTMLElement {
    return this.dialogEl ?? this;
  }

  protected override updated(changed: PropertyValues): void {
    if (!changed.has('open')) {
      return;
    }
    const dialog = this.dialogEl;
    if (!dialog) {
      return;
    }
    if (this.open && !dialog.open) {
      try {
        dialog.showModal();
      } catch {
        dialog.setAttribute('open', '');
      }
      this.measure();
    } else if (!this.open && dialog.open) {
      dialog.close();
    }
  }

  private readonly requestClose = (): void => {
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  };

  private readonly onCancel = (event: Event): void => {
    event.preventDefault();
    this.requestClose();
  };

  private readonly onDialogClick = (event: MouseEvent): void => {
    if (!this.closeOnScrimClick) {
      return;
    }
    const dialog = this.dialogEl;
    if (!dialog || event.target !== dialog) {
      return;
    }
    const rect = dialog.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!inside) {
      this.requestClose();
    }
  };

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.drawer.sketch.roughness,
      bowing: tokens.comp.drawer.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override render(): unknown {
    return html`<dialog
      aria-labelledby=${this.heading ? this.titleId : nothing}
      @cancel=${this.onCancel}
      @click=${this.onDialogClick}
    >
      ${this.renderSketch()}
      <div class="handle" aria-hidden="true"></div>
      ${this.heading ? html`<h2 class="title" id=${this.titleId}>${this.heading}</h2>` : nothing}
      <div class="body"><slot></slot></div>
    </dialog>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-drawer': GhDrawer;
  }
}

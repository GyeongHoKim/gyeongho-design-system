import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

let sheetUid = 0;

export type GhSheetSide = 'left' | 'right' | 'top' | 'bottom';

/**
 * `<gh-sheet>` — a hand-drawn edge-anchored panel.
 *
 * Built on the native `<dialog>` (`showModal()`) like `gh-modal` for free focus
 * trapping, top layer and Escape-to-close, but anchored to an edge via the
 * `side` attribute (default `right`). The panel is a sketchy, solid box
 * (`@ghds/sketch-core`). Reflects `open`, dispatches a `close` `CustomEvent` on
 * Escape / backdrop click. Colours and sketch parameters come from
 * `@ghds/tokens` (`comp.sheet.*`).
 */
@customElement('gh-sheet')
export class GhSheet extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        color: var(--comp-sheet-stroke);
      }

      dialog {
        position: fixed;
        box-sizing: border-box;
        margin: 0;
        padding: var(--comp-sheet-padding);
        border: none;
        background: transparent;
        color: var(--sys-color-text-primary);
        overflow: visible;
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        line-height: var(--sys-typography-body-lineHeight);
      }

      dialog[data-side='right'] {
        inset: 0 0 0 auto;
        height: 100%;
        width: min(24rem, 100%);
      }

      dialog[data-side='left'] {
        inset: 0 auto 0 0;
        height: 100%;
        width: min(24rem, 100%);
      }

      dialog[data-side='top'] {
        inset: 0 0 auto 0;
        width: 100%;
        max-height: 80vh;
      }

      dialog[data-side='bottom'] {
        inset: auto 0 0 0;
        width: 100%;
        max-height: 80vh;
      }

      dialog::backdrop {
        background: var(--comp-sheet-scrim);
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
        fill: var(--comp-sheet-bg);
        stroke: none;
      }
    `,
  ];

  /** Whether the sheet is shown. */
  @property({ type: Boolean, reflect: true }) open = false;
  /** Edge the sheet is anchored to. */
  @property({ type: String, reflect: true }) side: GhSheetSide = 'right';
  /** Accessible title, rendered as a heading and wired to `aria-labelledby`. */
  @property({ type: String }) heading = '';
  /** Close when the backdrop is clicked. */
  @property({ type: Boolean }) closeOnScrimClick = true;

  @query('dialog') private dialogEl?: HTMLDialogElement;

  private readonly titleId = `gh-sheet-${sheetUid++}-title`;

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
      roughness: tokens.comp.sheet.sketch.roughness,
      bowing: tokens.comp.sheet.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override render(): unknown {
    return html`<dialog
      data-side=${this.side}
      aria-labelledby=${this.heading ? this.titleId : nothing}
      @cancel=${this.onCancel}
      @click=${this.onDialogClick}
    >
      ${this.renderSketch()}
      ${this.heading ? html`<h2 class="title" id=${this.titleId}>${this.heading}</h2>` : nothing}
      <div class="body"><slot></slot></div>
    </dialog>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-sheet': GhSheet;
  }
}

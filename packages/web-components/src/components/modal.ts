import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

let modalUid = 0;

/**
 * `<gh-modal>` — a hand-drawn modal dialog.
 *
 * Built on the native `<dialog>` element (`showModal()`), which provides focus
 * trapping, focus restoration, the top layer, and Escape-to-close for free; the
 * `::backdrop` is styled as the token scrim and the panel is a sketchy box
 * (`@ghds/sketch-core`). Reflects `open` and dispatches a `close` `CustomEvent`
 * on Escape / backdrop click / dialog close. Colours and sketch parameters come
 * from `@ghds/tokens` (`comp.modal.*`).
 */
@customElement('gh-modal')
export class GhModal extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        color: var(--comp-modal-panel-stroke);
      }

      dialog {
        position: relative;
        box-sizing: border-box;
        max-width: 32rem;
        width: 100%;
        padding: var(--comp-modal-panel-padding);
        border: none;
        background: transparent;
        color: var(--comp-modal-text-body);
        overflow: visible;
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        line-height: var(--sys-typography-body-lineHeight);
      }

      dialog::backdrop {
        background: var(--comp-modal-scrim-color);
        opacity: var(--comp-modal-scrim-opacity);
      }

      .title {
        position: relative;
        margin: 0 0 var(--comp-modal-panel-gap);
        color: var(--comp-modal-text-title);
        font-family: var(--sys-typography-title-fontFamily);
        font-size: var(--sys-typography-title-fontSize);
        font-weight: var(--sys-typography-title-fontWeight);
        line-height: var(--sys-typography-title-lineHeight);
      }

      .body {
        position: relative;
      }

      .sketch-fill {
        fill: var(--comp-modal-panel-bg);
        stroke: none;
      }
    `,
  ];

  /** Whether the dialog is shown. */
  @property({ type: Boolean, reflect: true }) open = false;
  /** Accessible title, rendered as a heading and wired to `aria-labelledby`. */
  @property({ type: String }) heading = '';
  /** Close when the backdrop is clicked. */
  @property({ type: Boolean }) closeOnScrimClick = true;

  @query('dialog') private dialogEl?: HTMLDialogElement;

  private readonly titleId = `gh-modal-${modalUid++}-title`;

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
        // jsdom / unsupported environments: fall back to the non-modal open state.
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
    // Let the consumer own `open`: prevent the native auto-close and ask to close.
    event.preventDefault();
    this.requestClose();
  };

  private readonly onDialogClick = (event: MouseEvent): void => {
    if (!this.closeOnScrimClick) {
      return;
    }
    // The <dialog> element is itself the padded panel, so `target === dialog` is
    // true for clicks in the panel's own padding too. Treat only clicks that
    // land outside the dialog's box (i.e. on the ::backdrop) as a scrim click.
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
      roughness: tokens.comp.modal.sketch.roughness,
      bowing: tokens.comp.modal.sketch.bowing,
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
      ${this.heading ? html`<h2 class="title" id=${this.titleId}>${this.heading}</h2>` : nothing}
      <div class="body"><slot></slot></div>
    </dialog>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-modal': GhModal;
  }
}

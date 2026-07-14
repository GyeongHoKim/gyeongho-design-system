import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';
import './button.js';

let alertDialogUid = 0;

/**
 * `<gh-alert-dialog>` — a hand-drawn confirmation dialog.
 *
 * Built on the native `<dialog>` (`showModal()`) like `gh-modal`, but with
 * `role="alertdialog"` and a required user choice: it does **not** close on
 * backdrop click. Escape cancels. Renders a title, description and Cancel /
 * Confirm actions (`gh-button`); the confirm action uses the `danger` variant
 * when `variant="danger"`. Dispatches `confirm` and `cancel` `CustomEvent`s.
 * Colours and sketch parameters come from `@ghds/tokens` (`comp.alertDialog.*`).
 */
@customElement('gh-alert-dialog')
export class GhAlertDialog extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        color: var(--comp-alertDialog-stroke);
      }

      :host([variant='danger']) {
        color: var(--comp-alertDialog-danger-stroke);
      }

      dialog {
        position: relative;
        box-sizing: border-box;
        max-width: 28rem;
        width: 100%;
        padding: var(--comp-alertDialog-padding);
        border: none;
        background: transparent;
        color: var(--comp-alertDialog-text-body);
        overflow: visible;
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        line-height: var(--sys-typography-body-lineHeight);
      }

      dialog::backdrop {
        background: var(--comp-alertDialog-scrim);
      }

      .title {
        position: relative;
        margin: 0 0 var(--sys-spacing-sm);
        color: var(--comp-alertDialog-text-title);
        font-family: var(--sys-typography-title-fontFamily);
        font-size: var(--sys-typography-title-fontSize);
        font-weight: var(--sys-typography-title-fontWeight);
        line-height: var(--sys-typography-title-lineHeight);
      }

      .body {
        position: relative;
      }

      .actions {
        position: relative;
        display: flex;
        justify-content: flex-end;
        gap: var(--sys-spacing-sm);
        margin-top: var(--sys-spacing-lg);
      }

      .sketch-fill {
        fill: var(--comp-alertDialog-bg);
        stroke: none;
      }
    `,
  ];

  /** Whether the dialog is shown. */
  @property({ type: Boolean, reflect: true }) open = false;
  /** Dialog heading (also the accessible name). */
  @property({ type: String }) heading = '';
  /** Supporting description (also the accessible description). */
  @property({ type: String }) description = '';
  /** Confirm button label. */
  @property({ type: String }) confirmLabel = 'Confirm';
  /** Cancel button label. */
  @property({ type: String }) cancelLabel = 'Cancel';
  /** `danger` colours the confirm action and outline destructively. */
  @property({ type: String, reflect: true }) variant: 'default' | 'danger' = 'default';

  @query('dialog') private dialogEl?: HTMLDialogElement;

  private readonly uid = `gh-alert-dialog-${alertDialogUid++}`;

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

  private readonly onCancel = (event: Event): void => {
    event.preventDefault();
    this.dispatchEvent(new CustomEvent('cancel', { bubbles: true, composed: true }));
  };

  private readonly onConfirm = (): void => {
    this.dispatchEvent(new CustomEvent('confirm', { bubbles: true, composed: true }));
  };

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.alertDialog.sketch.roughness,
      bowing: tokens.comp.alertDialog.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override render(): unknown {
    const titleId = `${this.uid}-title`;
    const descId = `${this.uid}-desc`;
    return html`<dialog
      role="alertdialog"
      aria-labelledby=${this.heading ? titleId : nothing}
      aria-describedby=${this.description ? descId : nothing}
      @cancel=${this.onCancel}
    >
      ${this.renderSketch()}
      ${this.heading ? html`<h2 class="title" id=${titleId}>${this.heading}</h2>` : nothing}
      <div class="body">
        ${this.description ? html`<div id=${descId}>${this.description}</div>` : nothing}
        <slot></slot>
      </div>
      <div class="actions">
        <gh-button variant="neutral" @click=${this.onCancel}>${this.cancelLabel}</gh-button>
        <gh-button
          variant=${this.variant === 'danger' ? 'danger' : 'primary'}
          @click=${this.onConfirm}
          >${this.confirmLabel}</gh-button
        >
      </div>
    </dialog>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-alert-dialog': GhAlertDialog;
  }
}

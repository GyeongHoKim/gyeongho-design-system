import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

export type GhButtonVariant = 'primary' | 'danger' | 'neutral';
export type GhButtonType = 'button' | 'submit' | 'reset';

/**
 * `<gh-button>` — a hand-drawn button.
 *
 * The visible box is a sketchy rectangle outline from `@ghds/sketch-core`; a
 * real (focusable, keyboard-operable) `<button>` sits on top and owns the
 * semantics. Colors, padding and sketch roughness/bowing all come from
 * `comp.button.*` / `sys.*` tokens. Form-associated, so `type="submit"`/`"reset"`
 * drive the containing form.
 */
@customElement('gh-button')
export class GhButton extends SketchyBase {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...SketchyBase.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: inline-block;
        color: var(--sys-color-bg-primary-default);
        cursor: pointer;
      }

      :host(:hover) {
        color: var(--sys-color-bg-primary-hover);
      }

      :host(:active) {
        color: var(--sys-color-bg-primary-active);
      }

      :host([variant='danger']) {
        color: var(--sys-color-bg-danger-default);
      }

      :host([variant='danger']:hover) {
        color: var(--sys-color-bg-danger-hover);
      }

      :host([variant='neutral']) {
        color: var(--sys-color-text-primary);
      }

      :host([variant='neutral']:hover) {
        color: var(--sys-color-text-link);
      }

      :host([disabled]) {
        color: var(--sys-color-text-disabled);
        cursor: not-allowed;
      }

      button {
        appearance: none;
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--sys-spacing-sm);
        width: 100%;
        box-sizing: border-box;
        margin: 0;
        padding: var(--comp-button-padding-vertical) var(--comp-button-padding-horizontal);
        background: transparent;
        border: none;
        color: currentColor;
        font-family: var(--sys-typography-label-fontFamily);
        font-size: var(--sys-typography-label-fontSize);
        font-weight: var(--sys-typography-label-fontWeight);
        line-height: var(--sys-typography-label-lineHeight);
        cursor: inherit;
      }

      .label {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: var(--sys-spacing-sm);
      }

      button:focus-visible {
        outline: var(--sys-border-width-thick) solid var(--sys-color-border-focus);
        outline-offset: var(--sys-spacing-xs);
        border-radius: var(--sys-radius-sm);
      }

      button:disabled {
        cursor: not-allowed;
      }
    `,
  ];

  /** Visual/semantic colour role. */
  @property({ type: String, reflect: true }) variant: GhButtonVariant = 'primary';
  /** Native button behaviour for form association. */
  @property({ type: String }) type: GhButtonType = 'button';
  /** Disables interaction and dims the control. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  private readonly internals: ElementInternals = this.attachInternals();

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) {
      this.internals.role = 'button';
    }
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('disabled')) {
      this.internals.ariaDisabled = this.disabled ? 'true' : 'false';
    }
  }

  /** Button outline: a sketchy rectangle filling the measured box. */
  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  /** Roughness/bowing come from the button's own component tokens. */
  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.button.sketch.roughness,
      bowing: tokens.comp.button.sketch.bowing,
    };
  }

  private readonly handleClick = (event: MouseEvent): void => {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    const form = this.internals.form;
    if (!form) {
      return;
    }
    if (this.type === 'submit') {
      form.requestSubmit();
    } else if (this.type === 'reset') {
      form.reset();
    }
  };

  protected override render(): unknown {
    return html`<button
      part="button"
      type=${this.type}
      ?disabled=${this.disabled}
      @click=${this.handleClick}
    >
      ${this.renderSketch()}
      <span class="label"><slot></slot></span>
    </button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-button': GhButton;
  }
}

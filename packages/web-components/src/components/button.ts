import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
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
 *
 * Set `href` to render the control as a link (`<a>`) instead of a `<button>` —
 * for navigation actions that should look like a button (e.g. a language
 * switcher) but must remain real, right-clickable, keyboard-focusable links.
 * `target`/`rel` are forwarded to the anchor. `disabled` still renders a
 * `<button>` (a link cannot be truly disabled).
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

      button,
      a {
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
        text-decoration: none;
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

      button:focus-visible,
      a:focus-visible {
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
  /** When set (and not disabled), renders the control as a link (`<a href>`). */
  @property({ type: String }) href?: string;
  /** Anchor `target`, forwarded only when `href` is set. */
  @property({ type: String }) target?: string;
  /** Anchor `rel`, forwarded only when `href` is set. */
  @property({ type: String }) rel?: string;

  private readonly internals: ElementInternals = this.attachInternals();

  /** True when the control should render (and expose semantics) as a link. */
  private get isLink(): boolean {
    return this.href !== undefined && this.href !== '' && !this.disabled;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.syncRole();
  }

  /**
   * The inner `<a>`/`<button>` owns the semantics; the host role is only set for
   * the button case (a link's role comes from the anchor). An explicit `role`
   * attribute always wins.
   */
  private syncRole(): void {
    if (this.hasAttribute('role')) {
      return;
    }
    this.internals.role = this.isLink ? null : 'button';
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('disabled')) {
      this.internals.ariaDisabled = this.disabled ? 'true' : 'false';
    }
    if (changed.has('href') || changed.has('disabled')) {
      this.syncRole();
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
    const contents = html`${this.renderSketch()}<span class="label"><slot></slot></span>`;
    if (this.isLink) {
      return html`<a
        part="button"
        href=${ifDefined(this.href)}
        target=${ifDefined(this.target)}
        rel=${ifDefined(this.rel)}
        >${contents}</a
      >`;
    }
    return html`<button
      part="button"
      type=${this.type}
      ?disabled=${this.disabled}
      @click=${this.handleClick}
    >
      ${contents}
    </button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-button': GhButton;
  }
}

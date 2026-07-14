import { css, html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * `<gh-empty>` — an empty / zero-state placeholder.
 *
 * A centred column with an optional icon (named `icon` slot), a heading and
 * description (props or default slot), and an optional `actions` slot. Spacing
 * and colours come from `@ghds/tokens` (`comp.empty.*`).
 */
@customElement('gh-empty')
export class GhEmpty extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: var(--comp-empty-gap);
      padding: var(--comp-empty-padding);
      color: var(--comp-empty-text-default);
      font-family: var(--sys-typography-body-fontFamily);
      font-size: var(--sys-typography-body-fontSize);
      line-height: var(--sys-typography-body-lineHeight);
    }

    .icon {
      display: inline-flex;
      color: var(--comp-empty-icon);
    }

    .text {
      display: flex;
      flex-direction: column;
      gap: var(--sys-spacing-xs);
    }

    .title {
      color: var(--comp-empty-text-default);
      font-family: var(--sys-typography-title-fontFamily);
      font-size: var(--sys-typography-title-fontSize);
      font-weight: var(--sys-typography-title-fontWeight);
      line-height: var(--sys-typography-title-lineHeight);
    }

    .description {
      color: var(--comp-empty-text-muted);
    }

    .actions {
      display: inline-flex;
      gap: var(--sys-spacing-sm);
    }
  `;

  /** Optional heading text. */
  @property({ type: String }) heading = '';
  /** Optional supporting description text. */
  @property({ type: String }) description = '';

  protected override render(): unknown {
    return html`<div class="icon"><slot name="icon"></slot></div>
      <div class="text">
        ${this.heading ? html`<div class="title">${this.heading}</div>` : nothing}
        ${this.description ? html`<div class="description">${this.description}</div>` : nothing}
        <slot></slot>
      </div>
      <div class="actions"><slot name="actions"></slot></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-empty': GhEmpty;
  }
}

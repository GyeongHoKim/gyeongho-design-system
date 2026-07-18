import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/** Which side of the conversation a `<gh-message>` sits on. */
export type GhMessageSide = 'received' | 'sent';

/**
 * `<gh-message>` — a hand-drawn chat message row.
 *
 * Lays out an optional leading avatar (`avatar` slot) and a content column: an
 * author/timestamp header (`author` / `timestamp` slots) above the message body
 * (default slot, typically a `<gh-bubble>`). `side` flips the row so outgoing
 * (`'sent'`) messages align to the end. Spacing and the header text colours come
 * from `comp.message.*` tokens.
 */
@customElement('gh-message')
export class GhMessage extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .row {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: var(--comp-message-rowGap);
    }

    :host([side='sent']) .row {
      flex-direction: row-reverse;
    }

    .avatar {
      display: flex;
      flex-shrink: 0;
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: var(--comp-message-gap);
      min-width: 0;
    }

    .header {
      display: flex;
      align-items: baseline;
      gap: var(--sys-spacing-sm);
    }

    ::slotted([slot='author']) {
      color: var(--comp-message-text-author);
      font-family: var(--sys-typography-label-fontFamily);
      font-size: var(--sys-typography-label-fontSize);
      font-weight: var(--sys-typography-label-fontWeight);
      line-height: var(--sys-typography-label-lineHeight);
    }

    ::slotted([slot='timestamp']) {
      color: var(--comp-message-text-timestamp);
      font-family: var(--sys-typography-caption-fontFamily);
      font-size: var(--sys-typography-caption-fontSize);
      font-weight: var(--sys-typography-caption-fontWeight);
      line-height: var(--sys-typography-caption-lineHeight);
    }
  `;

  /** `'received'` (default) aligns to the start; `'sent'` aligns to the end. */
  @property({ type: String, reflect: true }) side: GhMessageSide = 'received';

  protected override render(): unknown {
    return html`<div class="row" part="row">
      <div class="avatar" part="avatar"><slot name="avatar"></slot></div>
      <div class="content" part="content">
        <div class="header" part="header">
          <slot name="author"></slot>
          <slot name="timestamp"></slot>
        </div>
        <slot></slot>
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-message': GhMessage;
  }
}

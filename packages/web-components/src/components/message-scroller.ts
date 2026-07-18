import { css, html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

/** How close (px) to the bottom still counts as "following the conversation". */
const NEAR_BOTTOM_THRESHOLD = 32;

/**
 * `<gh-message-scroller>` — a hand-drawn auto-scrolling chat log.
 *
 * Lays its slotted children out as a vertical stack in a scroll viewport and,
 * while the reader is at the bottom, keeps the newest message in view as content
 * grows (tracked with a `MutationObserver` + a scroll listener) — pausing the
 * moment they scroll up to read history. The themed scrollbar, gap and padding
 * come from `comp.messageScroller.*` tokens. Constrain the height by setting
 * `max-height` on the host.
 */
@customElement('gh-message-scroller')
export class GhMessageScroller extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .viewport {
      display: flex;
      flex-direction: column;
      gap: var(--comp-messageScroller-gap);
      box-sizing: border-box;
      height: 100%;
      max-height: inherit;
      padding: var(--comp-messageScroller-padding);
      overflow-y: auto;
      overflow-x: hidden;
      /* Standard scrollbar theming (Firefox + Chromium 121+). */
      scrollbar-width: thin;
      scrollbar-color: var(--comp-messageScroller-thumb-default)
        var(--comp-messageScroller-track-default);
    }

    .viewport::-webkit-scrollbar {
      width: var(--sys-spacing-sm);
    }

    .viewport::-webkit-scrollbar-track {
      background: var(--comp-messageScroller-track-default);
    }

    .viewport::-webkit-scrollbar-thumb {
      background: var(--comp-messageScroller-thumb-default);
      border-radius: var(--sys-radius-pill);
    }
  `;

  /**
   * Keep the view pinned to the newest message. When the reader scrolls up to
   * read history, auto-scrolling pauses until they return to the bottom.
   * Defaults to `true`.
   */
  @property({ type: Boolean, reflect: true, attribute: 'stick-to-bottom' }) stickToBottom = true;

  @query('.viewport') private viewportEl!: HTMLDivElement;

  private nearBottom = true;
  private mutationObserver?: MutationObserver;

  override disconnectedCallback(): void {
    this.viewportEl?.removeEventListener('scroll', this.handleScroll);
    this.mutationObserver?.disconnect();
    this.mutationObserver = undefined;
    super.disconnectedCallback();
  }

  protected override firstUpdated(): void {
    const el = this.viewportEl;
    if (!el) {
      return;
    }
    el.addEventListener('scroll', this.handleScroll, { passive: true });
    // Slotted messages are light-DOM children; watch them for additions/growth.
    if (typeof MutationObserver !== 'undefined') {
      this.mutationObserver = new MutationObserver(() => this.follow());
      this.mutationObserver.observe(this, { childList: true, subtree: true, characterData: true });
    }
    this.scrollToBottom();
  }

  private isNearBottom(el: HTMLElement): boolean {
    return el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM_THRESHOLD;
  }

  private readonly handleScroll = (): void => {
    const el = this.viewportEl;
    if (el) {
      this.nearBottom = this.isNearBottom(el);
    }
  };

  /** After content changes, keep the newest message in view if following along. */
  private follow(): void {
    if (this.stickToBottom && this.nearBottom) {
      this.scrollToBottom();
    }
  }

  /** Jump the viewport to the newest message. */
  scrollToBottom(): void {
    const el = this.viewportEl;
    if (el) {
      el.scrollTop = el.scrollHeight;
      this.nearBottom = true;
    }
  }

  protected override render(): unknown {
    return html`<div class="viewport" part="viewport">
      <slot></slot>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-message-scroller': GhMessageScroller;
  }
}

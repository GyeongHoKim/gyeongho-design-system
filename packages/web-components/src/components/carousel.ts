import { css, html, LitElement, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import './button.js';
import './icon.js';
import './carousel-item.js';

/** Scroll axis of a `<gh-carousel>`. */
export type GhCarouselOrientation = 'horizontal' | 'vertical';

/**
 * `<gh-carousel>` — a hand-drawn carousel built on native CSS scroll-snap, with
 * no third-party engine.
 *
 * Place `<gh-carousel-item>` slides in the default slot; the element renders its
 * own hand-drawn previous/next controls (`<gh-button>` + `<gh-icon>`) that move
 * one viewport per step and disable at the track ends. The root is a
 * `role="region"` labelled as a carousel; arrow keys scroll along the
 * orientation axis, and indicator dots (shown when there is more than one slide)
 * jump to a slide. Gap and indicator colours come from `comp.carousel.*` tokens.
 */
@customElement('gh-carousel')
export class GhCarousel extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .root {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--sys-spacing-sm);
    }

    .controls {
      display: flex;
      align-items: center;
      gap: var(--sys-spacing-sm);
    }

    :host([orientation='vertical']) .controls {
      flex-direction: column;
    }

    .viewport {
      display: flex;
      flex: 1;
      min-width: 0;
      min-height: 0;
      gap: var(--comp-carousel-gap);
      /* Hide the native scrollbar; navigation is via the controls/keys. */
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .viewport::-webkit-scrollbar {
      display: none;
    }

    :host(:not([orientation='vertical'])) .viewport {
      flex-direction: row;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-snap-type: x mandatory;
    }

    :host([orientation='vertical']) .viewport {
      flex-direction: column;
      overflow-x: hidden;
      overflow-y: auto;
      scroll-snap-type: y mandatory;
      height: 100%;
    }

    .viewport:focus-visible {
      outline: var(--sys-border-width-thick) solid var(--sys-color-border-focus);
      outline-offset: var(--sys-spacing-xs);
      border-radius: var(--sys-radius-sm);
    }

    .indicators {
      display: flex;
      justify-content: center;
      gap: var(--sys-spacing-xs);
    }

    .dot {
      width: var(--comp-carousel-indicatorSize);
      height: var(--comp-carousel-indicatorSize);
      padding: 0;
      border: none;
      border-radius: var(--sys-radius-pill);
      background: var(--comp-carousel-indicator-default);
      cursor: pointer;
    }

    .dot[data-active] {
      background: var(--comp-carousel-indicator-active);
    }
  `;

  /** Scroll axis. Defaults to `'horizontal'`. */
  @property({ type: String, reflect: true }) orientation: GhCarouselOrientation = 'horizontal';

  @state() private canScrollPrev = false;
  @state() private canScrollNext = false;
  @state() private slideCount = 0;
  @state() private activeIndex = 0;

  @query('.viewport') private viewportEl!: HTMLDivElement;

  private resizeObserver?: ResizeObserver;

  private get horizontal(): boolean {
    return this.orientation !== 'vertical';
  }

  override disconnectedCallback(): void {
    this.viewportEl?.removeEventListener('scroll', this.refresh);
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    super.disconnectedCallback();
  }

  protected override firstUpdated(): void {
    const el = this.viewportEl;
    if (!el) {
      return;
    }
    el.addEventListener('scroll', this.refresh, { passive: true });
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(this.refresh);
      this.resizeObserver.observe(el);
    }
    this.syncSlides();
    this.refresh();
  }

  /** The slotted slides in DOM order. */
  private get slides(): HTMLElement[] {
    const slot = this.shadowRoot?.querySelector('slot');
    return (slot?.assignedElements({ flatten: true }) ?? []).filter(
      (node): node is HTMLElement => node instanceof HTMLElement,
    );
  }

  private readonly syncSlides = (): void => {
    this.slideCount = this.slides.length;
    this.refresh();
  };

  private readonly refresh = (): void => {
    const el = this.viewportEl;
    if (!el) {
      return;
    }
    const start = this.horizontal ? el.scrollLeft : el.scrollTop;
    const total = this.horizontal
      ? el.scrollWidth - el.clientWidth
      : el.scrollHeight - el.clientHeight;
    this.canScrollPrev = start > 1;
    this.canScrollNext = start < total - 1;
    const extent = this.horizontal ? el.clientWidth : el.clientHeight;
    this.activeIndex = extent > 0 ? Math.round(start / extent) : 0;
  };

  private scrollByStep(direction: 1 | -1): void {
    const el = this.viewportEl;
    if (!el || typeof el.scrollBy !== 'function') {
      return;
    }
    const amount = this.horizontal ? el.clientWidth : el.clientHeight;
    el.scrollBy({ [this.horizontal ? 'left' : 'top']: direction * amount, behavior: 'smooth' });
  }

  private readonly scrollPrev = (): void => this.scrollByStep(-1);
  private readonly scrollNext = (): void => this.scrollByStep(1);

  private scrollToSlide(index: number): void {
    const slide = this.slides[index];
    if (slide && typeof slide.scrollIntoView === 'function') {
      slide.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: this.horizontal ? 'start' : 'nearest',
      });
    }
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    const prevKey = this.horizontal ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = this.horizontal ? 'ArrowRight' : 'ArrowDown';
    if (event.key === prevKey) {
      event.preventDefault();
      this.scrollPrev();
    } else if (event.key === nextKey) {
      event.preventDefault();
      this.scrollNext();
    }
  };

  protected override render(): unknown {
    const horizontal = this.horizontal;
    return html`<div class="root" role="region" aria-roledescription="carousel">
      <div class="controls">
        <gh-button
          class="control"
          variant="neutral"
          aria-label="Previous slide"
          ?disabled=${!this.canScrollPrev}
          @click=${this.scrollPrev}
        >
          <gh-icon name=${horizontal ? 'chevron-left' : 'chevron-up'} size="sm"></gh-icon>
        </gh-button>
        <div class="viewport" tabindex="0" @keydown=${this.handleKeyDown}>
          <slot @slotchange=${this.syncSlides}></slot>
        </div>
        <gh-button
          class="control"
          variant="neutral"
          aria-label="Next slide"
          ?disabled=${!this.canScrollNext}
          @click=${this.scrollNext}
        >
          <gh-icon name=${horizontal ? 'chevron-right' : 'chevron-down'} size="sm"></gh-icon>
        </gh-button>
      </div>
      ${
        this.slideCount > 1
          ? html`<div class="indicators">
            ${Array.from({ length: this.slideCount }, (_, index) => {
              return html`<button
                class="dot"
                type="button"
                aria-label=${`Go to slide ${index + 1}`}
                ?data-active=${index === this.activeIndex}
                @click=${() => this.scrollToSlide(index)}
              ></button>`;
            })}
          </div>`
          : nothing
      }
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-carousel': GhCarousel;
  }
}

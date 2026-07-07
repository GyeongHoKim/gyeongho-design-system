import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './icon.js';
import './pagination-item.js';

/**
 * Build the list of pages to show, collapsing large gaps to a single ellipsis.
 * Keeps the first and last page plus `siblingCount` pages around the current
 * one; a gap of exactly one page is filled with that page. Shows every page
 * when they fit without saving space via an ellipsis.
 */
export function paginationRange(
  count: number,
  page: number,
  siblingCount = 1,
): (number | 'ellipsis')[] {
  if (count < 1) {
    return [];
  }
  const threshold = 2 * siblingCount + 5;
  if (count <= threshold) {
    return Array.from({ length: count }, (_, i) => i + 1);
  }
  const clamped = Math.min(Math.max(page, 1), count);
  const pages = new Set<number>([1, count]);
  for (let p = clamped - siblingCount; p <= clamped + siblingCount; p++) {
    if (p >= 1 && p <= count) {
      pages.add(p);
    }
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | 'ellipsis')[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev === 2) {
      result.push(prev + 1);
    } else if (p - prev > 2) {
      result.push('ellipsis');
    }
    result.push(p);
    prev = p;
  }
  return result;
}

/**
 * `<gh-pagination>` — a hand-drawn pager.
 *
 * Renders Previous/Next controls around a list of sketchy page buttons
 * (`<gh-pagination-item>`), collapsing large ranges with an ellipsis. The
 * current page is filled and `aria-current="page"`. Activating a control
 * dispatches a `page-change` `CustomEvent<number>`.
 */
@customElement('gh-pagination')
export class GhPagination extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    ul {
      display: flex;
      align-items: center;
      gap: var(--comp-pagination-gap);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .ellipsis {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: var(--comp-pagination-size);
      height: var(--comp-pagination-size);
      color: var(--comp-pagination-item-text-default);
      font-family: var(--sys-typography-body-fontFamily);
      font-size: var(--sys-typography-body-fontSize);
    }
  `;

  /** Total number of pages. */
  @property({ type: Number }) count = 1;
  /** Current page (1-based). */
  @property({ type: Number }) page = 1;
  /** Pages shown on each side of the current page. */
  @property({ type: Number }) siblingCount = 1;
  /** Accessible name for the nav landmark. */
  @property({ type: String }) label = 'Pagination';

  private go(next: number): void {
    if (next >= 1 && next <= this.count && next !== this.page) {
      this.dispatchEvent(
        new CustomEvent('page-change', { detail: next, bubbles: true, composed: true }),
      );
    }
  }

  protected override render(): unknown {
    const items = paginationRange(this.count, this.page, this.siblingCount);
    return html`<nav aria-label=${this.label}>
      <ul>
        <li>
          <gh-pagination-item
            label="Previous page"
            ?disabled=${this.page <= 1}
            @click=${() => this.go(this.page - 1)}
          >
            <gh-icon name="chevron-left" size="sm"></gh-icon>
          </gh-pagination-item>
        </li>
        ${items.map((item) =>
          item === 'ellipsis'
            ? html`<li><span class="ellipsis" aria-hidden="true">…</span></li>`
            : html`<li>
                <gh-pagination-item
                  label=${`Page ${item}`}
                  ?selected=${item === this.page}
                  @click=${() => this.go(item)}
                  >${item}</gh-pagination-item
                >
              </li>`,
        )}
        <li>
          <gh-pagination-item
            label="Next page"
            ?disabled=${this.page >= this.count}
            @click=${() => this.go(this.page + 1)}
          >
            <gh-icon name="chevron-right" size="sm"></gh-icon>
          </gh-pagination-item>
        </li>
      </ul>
    </nav>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-pagination': GhPagination;
  }
}

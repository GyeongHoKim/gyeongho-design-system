import { css, html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './icon.js';

/** One entry in a `<gh-breadcrumb>` trail. */
export interface GhBreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * `<gh-breadcrumb>` — a breadcrumb navigation trail.
 *
 * Renders a `<nav>` landmark wrapping an ordered list; the last item is the
 * current page (`aria-current="page"`, not a link). Colours, gap, and
 * typography are token-driven (`comp.breadcrumb.*`); separators are hand-drawn
 * `<gh-icon>` chevrons. Activating a link dispatches a `select` `CustomEvent`
 * with `{ item, index }`.
 */
@customElement('gh-breadcrumb')
export class GhBreadcrumb extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    ol {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--comp-breadcrumb-gap);
      margin: 0;
      padding: 0;
      list-style: none;
      font-family: var(--sys-typography-body-fontFamily);
      font-size: var(--sys-typography-body-fontSize);
      line-height: var(--sys-typography-body-lineHeight);
    }

    li {
      display: inline-flex;
      align-items: center;
      gap: var(--comp-breadcrumb-gap);
    }

    a {
      color: var(--comp-breadcrumb-text-link);
      text-decoration: none;
    }

    a:hover {
      color: var(--comp-breadcrumb-text-linkHover);
    }

    .current {
      color: var(--comp-breadcrumb-text-current);
      font-weight: var(--sys-typography-label-fontWeight);
    }

    .sep {
      display: inline-flex;
      color: var(--comp-breadcrumb-separator);
    }
  `;

  /** Trail from root → current. */
  @property({ attribute: false }) items: GhBreadcrumbItem[] = [];
  /** Accessible name for the nav landmark. */
  @property({ type: String }) label = 'Breadcrumb';

  private select(item: GhBreadcrumbItem, index: number): void {
    this.dispatchEvent(
      new CustomEvent('select', { detail: { item, index }, bubbles: true, composed: true }),
    );
  }

  protected override render(): unknown {
    const last = this.items.length - 1;
    return html`<nav aria-label=${this.label}>
      <ol>
        ${this.items.map((item, index) => {
          const isLast = index === last;
          return html`<li>
            ${
              isLast || item.href === undefined
                ? html`<span
                    class=${isLast ? 'current' : ''}
                    aria-current=${isLast ? 'page' : nothing}
                    >${item.label}</span
                  >`
                : html`<a href=${item.href} @click=${() => this.select(item, index)}
                    >${item.label}</a
                  >`
            }
            ${
              isLast
                ? nothing
                : html`<span class="sep" aria-hidden="true"
                    ><gh-icon name="chevron-right" size="sm"></gh-icon
                  ></span>`
            }
          </li>`;
        })}
      </ol>
    </nav>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-breadcrumb': GhBreadcrumb;
  }
}

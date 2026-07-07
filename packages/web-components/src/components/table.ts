import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';
import './checkbox.js';
import './icon.js';

/** A column definition. */
export interface GhTableColumn {
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
}

/** A row: a stable `id` plus a cell value per column key. */
export interface GhTableRow {
  id: string;
  [key: string]: string | number;
}

export type GhSortDirection = 'asc' | 'desc';
export interface GhTableSort {
  key: string;
  direction: GhSortDirection;
}

/**
 * `<gh-table>` — a hand-drawn data table. A sketchy outline frames a semantic
 * `<table>` with sortable headers (`aria-sort`) and optional row selection
 * (a `<gh-checkbox>` column + select-all). Controlled: dispatches
 * `sort-change` (`{ key, direction }`) and `selection-change` (`string[]`) and
 * renders the rows as given. Token-driven (`comp.table.*`).
 */
@customElement('gh-table')
export class GhTable extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: block;
        position: relative;
        overflow-x: auto;
        color: var(--comp-table-stroke);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
      }
      table {
        position: relative;
        width: 100%;
        border-collapse: collapse;
      }
      caption {
        text-align: left;
        padding: var(--comp-table-padding-horizontal);
        color: var(--comp-table-text-header);
      }
      th,
      td {
        padding: var(--comp-table-padding-vertical) var(--comp-table-padding-horizontal);
        border-bottom: var(--sys-border-width-default) solid var(--comp-table-rowBorder);
        text-align: left;
      }
      thead tr {
        background: var(--comp-table-headerBg);
      }
      th {
        color: var(--comp-table-text-header);
        font-weight: var(--sys-typography-label-fontWeight);
      }
      td {
        color: var(--comp-table-text-cell);
      }
      tr[data-selected] {
        background: var(--comp-table-selectedBg);
      }
      .sort {
        display: inline-flex;
        align-items: center;
        gap: var(--sys-spacing-xs);
        padding: 0;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        font-weight: inherit;
        cursor: pointer;
      }
      .sort .chevron {
        display: inline-flex;
        color: var(--comp-table-text-icon);
      }
      .sketch-fill {
        fill: var(--comp-table-bg);
        stroke: none;
      }
    `,
  ];

  @property({ attribute: false }) columns: GhTableColumn[] = [];
  @property({ attribute: false }) rows: GhTableRow[] = [];
  @property({ type: String }) caption = '';
  @property({ attribute: false }) sort?: GhTableSort;
  @property({ attribute: false }) selectedIds?: string[];

  private get selectable(): boolean {
    return this.selectedIds !== undefined;
  }

  private emitSelection(ids: string[]): void {
    this.dispatchEvent(
      new CustomEvent('selection-change', { detail: ids, bubbles: true, composed: true }),
    );
  }

  private handleSort(key: string): void {
    const direction: GhSortDirection =
      this.sort?.key === key && this.sort.direction === 'asc' ? 'desc' : 'asc';
    this.dispatchEvent(
      new CustomEvent('sort-change', { detail: { key, direction }, bubbles: true, composed: true }),
    );
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.table.sketch.roughness,
      bowing: tokens.comp.table.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override render(): unknown {
    const selected = new Set(this.selectedIds ?? []);
    const allSelected = this.rows.length > 0 && this.rows.every((r) => selected.has(r.id));
    const someSelected = this.rows.some((r) => selected.has(r.id));

    return html`${this.renderSketch()}
      <table>
        ${this.caption ? html`<caption>${this.caption}</caption>` : nothing}
        <thead>
          <tr>
            ${
              this.selectable
                ? html`<th scope="col" style="width:1%">
                    <gh-checkbox
                      aria-label="Select all rows"
                      ?checked=${allSelected}
                      ?indeterminate=${!allSelected && someSelected}
                      @change=${() =>
                        this.emitSelection(allSelected ? [] : this.rows.map((r) => r.id))}
                    ></gh-checkbox>
                  </th>`
                : nothing
            }
            ${this.columns.map((col) => {
              const active = this.sort?.key === col.key;
              const ariaSort = active
                ? this.sort?.direction === 'asc'
                  ? 'ascending'
                  : 'descending'
                : col.sortable
                  ? 'none'
                  : nothing;
              return html`<th scope="col" aria-sort=${ariaSort} style=${`text-align:${col.align ?? 'left'}`}>
                ${
                  col.sortable
                    ? html`<button class="sort" type="button" @click=${() => this.handleSort(col.key)}>
                        ${col.header}
                        ${
                          active
                            ? html`<span class="chevron"
                                ><gh-icon
                                  name=${this.sort?.direction === 'asc' ? 'chevron-up' : 'chevron-down'}
                                  size="sm"
                                ></gh-icon
                              ></span>`
                            : nothing
                        }
                      </button>`
                    : col.header
                }
              </th>`;
            })}
          </tr>
        </thead>
        <tbody>
          ${this.rows.map((row) => {
            const isSelected = selected.has(row.id);
            return html`<tr ?data-selected=${isSelected}>
              ${
                this.selectable
                  ? html`<td>
                      <gh-checkbox
                        aria-label=${`Select row ${row.id}`}
                        ?checked=${isSelected}
                        @change=${() =>
                          this.emitSelection(
                            isSelected
                              ? (this.selectedIds ?? []).filter((x) => x !== row.id)
                              : [...(this.selectedIds ?? []), row.id],
                          )}
                      ></gh-checkbox>
                    </td>`
                  : nothing
              }
              ${this.columns.map(
                (col) =>
                  html`<td style=${`text-align:${col.align ?? 'left'}`}>${row[col.key]}</td>`,
              )}
            </tr>`;
          })}
        </tbody>
      </table>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-table': GhTable;
  }
}

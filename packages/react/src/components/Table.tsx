import { tokens } from '@ghds/tokens';
import { type CSSProperties, forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { toPx } from '../lib/units.js';
import { Checkbox } from './Checkbox.js';
import { Icon } from './Icon.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

/** A column definition. */
export interface TableColumn {
  /** Row-cell key this column reads. */
  key: string;
  /** Header content. */
  header: ReactNode;
  /** Whether the column can be sorted. */
  sortable?: boolean;
  /** Cell text alignment. */
  align?: 'left' | 'right' | 'center';
}

/** A row: a stable `id` plus a cell value per column key. */
export interface TableRow {
  id: string;
  [key: string]: ReactNode;
}

export type SortDirection = 'asc' | 'desc';
export interface TableSort {
  key: string;
  direction: SortDirection;
}

export interface TableProps extends Omit<HTMLAttributes<HTMLTableElement>, 'onChange'> {
  columns: TableColumn[];
  rows: TableRow[];
  /** Accessible caption for the table. */
  caption?: string;
  /** Controlled sort state; the table emits intent and renders rows as given. */
  sort?: TableSort;
  onSortChange?: (sort: TableSort) => void;
  /** Controlled selected row ids. Providing this (with a handler) shows checkboxes. */
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

const table = tokens.comp.table;
const c = cssVars.comp.table;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

/**
 * A hand-drawn data table. A sketchy outline (`@ghds/sketch-core`) frames a
 * semantic `<table>` with sortable column headers (`aria-sort`) and optional row
 * selection (a leading checkbox column with a select-all header). Sorting and
 * selection are **controlled** — the table emits intent via `onSortChange` /
 * `onSelectionChange` and renders the `rows` in the order given. Colours,
 * padding, and sketch parameters come from `@ghds/tokens` (`comp.table.*`).
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { columns, rows, caption, sort, onSortChange, selectedIds, onSelectionChange, style, ...rest },
  forwardedRef,
) {
  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLDivElement>({
    fillStyle: 'solid',
    roughness: table.sketch.roughness,
    bowing: table.sketch.bowing,
    inset: INSET,
  });

  const selectable = selectedIds !== undefined && onSelectionChange !== undefined;
  const selected = new Set(selectedIds ?? []);
  const allSelected = rows.length > 0 && rows.every((row) => selected.has(row.id));
  const someSelected = rows.some((row) => selected.has(row.id));

  const toggleAll = () => {
    onSelectionChange?.(allSelected ? [] : rows.map((row) => row.id));
  };
  const toggleRow = (id: string) => {
    if (selected.has(id)) {
      onSelectionChange?.([...selected].filter((x) => x !== id));
    } else {
      onSelectionChange?.([...selected, id]);
    }
  };

  const handleSort = (key: string) => {
    const direction: SortDirection = sort?.key === key && sort.direction === 'asc' ? 'desc' : 'asc';
    onSortChange?.({ key, direction });
  };

  const containerStyle: CSSProperties = {
    ...sketchHostStyle,
    boxSizing: 'border-box',
    overflowX: 'auto',
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
    ...style,
  };

  const tableStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    borderCollapse: 'collapse',
  };

  const cellBase: CSSProperties = {
    padding: `${table.padding.vertical} ${table.padding.horizontal}`,
    borderBottom: `${STROKE_WIDTH}px solid ${c.rowBorder}`,
  };

  return (
    <div ref={sketchRef} style={containerStyle}>
      <SketchSurface
        drawable={drawable}
        width={size.width}
        height={size.height}
        strokeColor={c.stroke}
        strokeWidth={STROKE_WIDTH}
        fillColor={c.bg}
        fillRendering="fill"
      />
      <table ref={forwardedRef} style={tableStyle} {...rest}>
        {caption && (
          <caption
            style={{ textAlign: 'left', padding: table.padding.horizontal, color: c.text.header }}
          >
            {caption}
          </caption>
        )}
        <thead>
          <tr style={{ background: c.headerBg }}>
            {selectable && (
              <th scope="col" style={{ ...cellBase, width: '1%' }}>
                <Checkbox
                  checked={allSelected}
                  indeterminate={!allSelected && someSelected}
                  onChange={toggleAll}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map((col) => {
              const active = sort?.key === col.key;
              const ariaSort = active
                ? sort?.direction === 'asc'
                  ? 'ascending'
                  : 'descending'
                : col.sortable
                  ? 'none'
                  : undefined;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={ariaSort}
                  style={{
                    ...cellBase,
                    textAlign: col.align ?? 'left',
                    color: c.text.header,
                    fontWeight: tokens.sys.typography.label.fontWeight,
                  }}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: tokens.sys.spacing.xs,
                        padding: 0,
                        border: 'none',
                        background: 'transparent',
                        color: 'inherit',
                        font: 'inherit',
                        fontWeight: 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      {col.header}
                      {active && (
                        <span style={{ display: 'inline-flex', color: c.text.icon }}>
                          <Icon
                            name={sort?.direction === 'asc' ? 'chevron-up' : 'chevron-down'}
                            size="sm"
                          />
                        </span>
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isSelected = selected.has(row.id);
            return (
              <tr key={row.id} style={isSelected ? { background: c.selectedBg } : undefined}>
                {selectable && (
                  <td style={cellBase}>
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleRow(row.id)}
                      aria-label={`Select row ${row.id}`}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{ ...cellBase, textAlign: col.align ?? 'left', color: c.text.cell }}
                  >
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

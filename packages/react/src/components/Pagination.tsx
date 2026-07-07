import { tokens } from '@ghds/tokens';
import { type CSSProperties, forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { toPx } from '../lib/units.js';
import { Icon } from './Icon.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

export interface PaginationProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onChange' | 'children'> {
  /** Total number of pages. */
  count: number;
  /** Current page (1-based). */
  page: number;
  /** Called with the next page when a page/prev/next control is activated. */
  onPageChange?: (page: number) => void;
  /** Pages shown on each side of the current page. Defaults to `1`. */
  siblingCount?: number;
  /** Accessible name for the nav landmark. Defaults to `'Pagination'`. */
  label?: string;
}

const pagination = tokens.comp.pagination;
const c = cssVars.comp.pagination;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;
const ITEM_SIZE = pagination.size;

/**
 * Build the list of pages to show, collapsing large gaps to a single ellipsis.
 * Always keeps the first and last page plus `siblingCount` pages around the
 * current one; a gap of exactly one page is filled with that page rather than
 * an ellipsis.
 */
export function paginationRange(
  count: number,
  page: number,
  siblingCount = 1,
): (number | 'ellipsis')[] {
  if (count < 1) {
    return [];
  }
  // Show every page when they all fit without saving space via an ellipsis
  // (first + last + current ± siblings + two ellipses).
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

const listStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: pagination.gap,
  margin: 0,
  padding: 0,
  listStyle: 'none',
};

const ellipsisStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: ITEM_SIZE,
  height: ITEM_SIZE,
  color: c.item.text.default,
  fontFamily: tokens.sys.typography.body.fontFamily,
};

interface PageButtonProps {
  selected?: boolean;
  disabled?: boolean;
  ariaLabel: string;
  ariaCurrent?: 'page';
  onClick: () => void;
  children: ReactNode;
}

function PageButton({
  selected = false,
  disabled = false,
  ariaLabel,
  ariaCurrent,
  onClick,
  children,
}: PageButtonProps) {
  const { ref, drawable, size } = useSketch<HTMLButtonElement>({
    fillStyle: 'solid',
    roughness: pagination.sketch.roughness,
    bowing: pagination.sketch.bowing,
    inset: INSET,
  });

  const stroke = disabled
    ? c.item.stroke.disabled
    : selected
      ? c.item.stroke.selected
      : c.item.stroke.default;
  const fill = disabled ? c.item.bg.disabled : selected ? c.item.bg.selected : c.item.bg.default;
  const text = disabled
    ? c.item.text.disabled
    : selected
      ? c.item.text.selected
      : c.item.text.default;

  const style: CSSProperties = {
    ...sketchHostStyle,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    minWidth: ITEM_SIZE,
    height: ITEM_SIZE,
    padding: `0 ${tokens.sys.spacing.xs}`,
    border: 'none',
    background: 'transparent',
    color: text,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
  };

  return (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      disabled={disabled}
      onClick={onClick}
      style={style}
    >
      <SketchSurface
        drawable={drawable}
        width={size.width}
        height={size.height}
        strokeColor={stroke}
        strokeWidth={STROKE_WIDTH}
        fillColor={fill}
        fillRendering="fill"
      />
      <span style={{ position: 'relative', display: 'inline-flex' }}>{children}</span>
    </button>
  );
}

/**
 * A hand-drawn pager. Renders Previous/Next controls around a list of page
 * buttons, collapsing large ranges with an ellipsis. Each button is a sketchy
 * box (`@ghds/sketch-core`); the current page is filled and marked
 * `aria-current="page"`. Colours, size, and sketch parameters come from
 * `@ghds/tokens` (`comp.pagination.*`).
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  { count, page, onPageChange, siblingCount = 1, label = 'Pagination', style, ...rest },
  ref,
) {
  const items = paginationRange(count, page, siblingCount);
  const go = (next: number) => {
    if (next >= 1 && next <= count && next !== page) {
      onPageChange?.(next);
    }
  };

  return (
    <nav ref={ref} aria-label={label} style={style} {...rest}>
      <ul style={listStyle}>
        <li>
          <PageButton disabled={page <= 1} ariaLabel="Previous page" onClick={() => go(page - 1)}>
            <Icon name="chevron-left" size="sm" />
          </PageButton>
        </li>
        {items.map((item, index) =>
          item === 'ellipsis' ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: ellipsis positions are stable within a render
            <li key={`ellipsis-${index}`}>
              <span style={ellipsisStyle} aria-hidden="true">
                …
              </span>
            </li>
          ) : (
            <li key={item}>
              <PageButton
                selected={item === page}
                ariaLabel={`Page ${item}`}
                ariaCurrent={item === page ? 'page' : undefined}
                onClick={() => go(item)}
              >
                {item}
              </PageButton>
            </li>
          ),
        )}
        <li>
          <PageButton disabled={page >= count} ariaLabel="Next page" onClick={() => go(page + 1)}>
            <Icon name="chevron-right" size="sm" />
          </PageButton>
        </li>
      </ul>
    </nav>
  );
});

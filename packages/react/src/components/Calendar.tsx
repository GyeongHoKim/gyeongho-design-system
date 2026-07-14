import { tokens } from '@ghds/tokens';
import {
  type CSSProperties,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cssVars } from '../lib/cssVars.js';
import { toPx } from '../lib/units.js';
import { Icon } from './Icon.js';

export interface CalendarProps {
  /** Controlled selected date. */
  value?: Date;
  /** Initial selected date when uncontrolled. */
  defaultValue?: Date;
  /** Called with the newly-selected date. */
  onSelect?: (date: Date) => void;
  /** Controlled displayed month (any date within it). */
  month?: Date;
  /** Initial displayed month when uncontrolled. Defaults to today's month. */
  defaultMonth?: Date;
  /** Called when the displayed month changes. */
  onMonthChange?: (month: Date) => void;
  /** Predicate marking a date as non-selectable. */
  isDateDisabled?: (date: Date) => boolean;
  /** Accessible label for the grid. Defaults to `'Calendar'`. */
  'aria-label'?: string;
}

const calendar = tokens.comp.calendar;
const c = cssVars.comp.calendar;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
function keyOf(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/**
 * A hand-drawn month calendar. Renders a `role="grid"` of day buttons with a
 * roving tabindex: arrow keys move by day/week, PageUp/PageDown change month,
 * Home/End jump to the week's edges, Enter/Space select. Selected, today and
 * disabled days are styled from `@ghds/tokens` (`comp.calendar.*`). Uses only
 * the native `Date` — no date library.
 */
export function Calendar({
  value,
  defaultValue,
  onSelect,
  month,
  defaultMonth,
  onMonthChange,
  isDateDisabled,
  'aria-label': ariaLabel = 'Calendar',
}: CalendarProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const isValueControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<Date | undefined>(defaultValue);
  const selected = isValueControlled ? value : internalValue;

  const isMonthControlled = month !== undefined;
  const [internalMonth, setInternalMonth] = useState<Date>(() => defaultMonth ?? selected ?? today);
  const displayedMonth = isMonthControlled ? month : internalMonth;

  const [focusedDate, setFocusedDate] = useState<Date>(() => selected ?? defaultMonth ?? today);
  const cellsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  // Only pull DOM focus to the focused day after a keyboard move, never on the
  // initial render (which would steal focus when the calendar mounts).
  const shouldFocusRef = useRef(false);

  useEffect(() => {
    if (shouldFocusRef.current) {
      shouldFocusRef.current = false;
      cellsRef.current.get(keyOf(focusedDate))?.focus();
    }
  }, [focusedDate]);

  const setMonth = (next: Date) => {
    if (!isMonthControlled) {
      setInternalMonth(next);
    }
    onMonthChange?.(next);
  };

  // Build the 6-week grid (weeks start Sunday).
  const weeks = useMemo(() => {
    const first = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1);
    const gridStart = addDays(first, -first.getDay());
    const out: Date[][] = [];
    let cursor = gridStart;
    for (let w = 0; w < 6; w += 1) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d += 1) {
        week.push(cursor);
        cursor = addDays(cursor, 1);
      }
      out.push(week);
    }
    return out;
  }, [displayedMonth]);

  const disabled = (date: Date): boolean => isDateDisabled?.(date) ?? false;

  const focusDate = (date: Date) => {
    shouldFocusRef.current = true;
    setFocusedDate(date);
    if (!isSameMonth(date, displayedMonth)) {
      setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  const selectDate = (date: Date) => {
    if (disabled(date)) {
      return;
    }
    if (!isValueControlled) {
      setInternalValue(date);
    }
    setFocusedDate(date);
    onSelect?.(date);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, date: Date) => {
    let next: Date | null = null;
    switch (event.key) {
      case 'ArrowLeft':
        next = addDays(date, -1);
        break;
      case 'ArrowRight':
        next = addDays(date, 1);
        break;
      case 'ArrowUp':
        next = addDays(date, -7);
        break;
      case 'ArrowDown':
        next = addDays(date, 7);
        break;
      case 'Home':
        next = addDays(date, -date.getDay());
        break;
      case 'End':
        next = addDays(date, 6 - date.getDay());
        break;
      case 'PageUp':
        next = new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
        break;
      case 'PageDown':
        next = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate());
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        selectDate(date);
        return;
      default:
        return;
    }
    event.preventDefault();
    focusDate(next);
  };

  const goToMonth = (delta: number) => {
    const next = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + delta, 1);
    setMonth(next);
    setFocusedDate((prev) =>
      isSameMonth(prev, displayedMonth) ? new Date(next.getFullYear(), next.getMonth(), 1) : prev,
    );
  };

  const rootStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: tokens.sys.spacing.sm,
    boxSizing: 'border-box',
    padding: calendar.padding,
    background: c.bg,
    border: `${STROKE_WIDTH}px solid ${c.stroke}`,
    borderRadius: calendar.radius,
    color: c.text.default,
    fontFamily: tokens.sys.typography.body.fontFamily,
  };

  const navButtonStyle: CSSProperties = {
    display: 'inline-flex',
    padding: tokens.sys.spacing.xs,
    border: 'none',
    borderRadius: tokens.sys.radius.sm,
    background: 'transparent',
    color: c.text.default,
    cursor: 'pointer',
  };

  return (
    <div style={rootStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          aria-label="Previous month"
          style={navButtonStyle}
          onClick={() => goToMonth(-1)}
        >
          <Icon name="chevron-left" size="sm" />
        </button>
        <span aria-live="polite" style={{ fontWeight: tokens.sys.typography.label.fontWeight }}>
          {MONTHS[displayedMonth.getMonth()]} {displayedMonth.getFullYear()}
        </span>
        <button
          type="button"
          aria-label="Next month"
          style={navButtonStyle}
          onClick={() => goToMonth(1)}
        >
          <Icon name="chevron-right" size="sm" />
        </button>
      </div>
      {/* biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: the WAI-ARIA date-picker pattern renders the month as a role="grid" table of day buttons */}
      <table role="grid" aria-label={ariaLabel} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {WEEKDAYS.map((day) => (
              <th
                key={day}
                scope="col"
                style={{
                  padding: tokens.sys.spacing.xs,
                  color: c.text.muted,
                  fontSize: tokens.sys.typography.caption.fontSize,
                  fontWeight: tokens.sys.typography.label.fontWeight,
                }}
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={keyOf(week[0] as Date)}>
              {week.map((date) => {
                const inMonth = isSameMonth(date, displayedMonth);
                const isSelected = selected !== undefined && isSameDay(date, selected);
                const isToday = isSameDay(date, today);
                const isDisabled = disabled(date);
                const isTabStop = isSameDay(date, focusedDate);
                const cellStyle: CSSProperties = {
                  width: '2.25rem',
                  height: '2.25rem',
                  padding: 0,
                  border: 'none',
                  borderRadius: tokens.sys.radius.sm,
                  background: isSelected ? c.cell.selected : 'transparent',
                  color: isSelected ? c.cell.selectedText : inMonth ? c.text.default : c.text.muted,
                  outline:
                    isToday && !isSelected ? `${STROKE_WIDTH}px solid ${c.cell.today}` : 'none',
                  outlineOffset: `-${STROKE_WIDTH}px`,
                  opacity: isDisabled ? 0.4 : 1,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  fontFamily: tokens.sys.typography.body.fontFamily,
                  fontSize: tokens.sys.typography.body.fontSize,
                };
                return (
                  <td key={keyOf(date)} style={{ padding: 0, textAlign: 'center' }}>
                    <button
                      ref={(el) => {
                        if (el) {
                          cellsRef.current.set(keyOf(date), el);
                        } else {
                          cellsRef.current.delete(keyOf(date));
                        }
                      }}
                      type="button"
                      aria-label={date.toDateString()}
                      aria-pressed={isSelected}
                      aria-current={isToday ? 'date' : undefined}
                      aria-disabled={isDisabled || undefined}
                      tabIndex={isTabStop ? 0 : -1}
                      style={cellStyle}
                      onClick={() => selectDate(date)}
                      onKeyDown={(event) => handleKeyDown(event, date)}
                    >
                      {date.getDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

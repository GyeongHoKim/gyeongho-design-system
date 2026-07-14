import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

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

/** Format a local `Date` as an ISO `YYYY-MM-DD` string. */
function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse an ISO `YYYY-MM-DD` string into a local `Date`, or `null`. */
function fromISO(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * `<gh-calendar>` — a hand-drawn month grid with keyboard navigation.
 *
 * A `role="grid"` of day cells with a roving tabindex: Arrow keys move by day /
 * week, Home/End jump to the week edges, PageUp/PageDown change month, Enter or
 * Space selects. Selection is an ISO `YYYY-MM-DD` string in `value`; changes
 * dispatch a `select` `CustomEvent<string>`. The frame is drawn as a sketchy
 * box (`@ghds/sketch-core`). Colours and sketch parameters come from
 * `@ghds/tokens` (`comp.calendar.*`).
 */
@customElement('gh-calendar')
export class GhCalendar extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: inline-block;
        color: var(--comp-calendar-stroke);
      }

      .calendar {
        position: relative;
        box-sizing: border-box;
        padding: var(--comp-calendar-padding);
        color: var(--comp-calendar-text-default);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
      }

      .header {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--sys-spacing-sm);
        margin-bottom: var(--sys-spacing-sm);
      }

      .title {
        font-family: var(--sys-typography-label-fontFamily);
        font-weight: var(--sys-typography-label-fontWeight);
      }

      .nav {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.75rem;
        height: 1.75rem;
        border: none;
        border-radius: var(--sys-radius-sm);
        background: transparent;
        color: inherit;
        cursor: pointer;
      }

      .nav:hover {
        background: var(--comp-calendar-cell-hover);
      }

      table {
        position: relative;
        border-collapse: collapse;
      }

      th {
        padding: var(--sys-spacing-xs);
        color: var(--comp-calendar-text-muted);
        font-weight: var(--sys-typography-caption-fontWeight);
        font-size: var(--sys-typography-caption-fontSize);
      }

      td {
        padding: 0;
        text-align: center;
      }

      .day {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        border: none;
        border-radius: var(--comp-calendar-radius);
        background: transparent;
        color: inherit;
        font: inherit;
        cursor: pointer;
      }

      .day:hover {
        background: var(--comp-calendar-cell-hover);
      }

      .day.outside {
        color: var(--comp-calendar-text-muted);
      }

      .day.today {
        outline: var(--sys-border-width-default) solid var(--comp-calendar-cell-today);
        outline-offset: calc(-1 * var(--sys-border-width-default));
      }

      .day.selected {
        background: var(--comp-calendar-cell-selected);
        color: var(--comp-calendar-cell-selectedText);
      }

      .day:focus-visible {
        outline: var(--sys-border-width-thick) solid var(--comp-calendar-cell-today);
      }

      .sketch-fill {
        fill: var(--comp-calendar-bg);
        stroke: none;
      }
    `,
  ];

  /** Selected date as an ISO `YYYY-MM-DD` string. */
  @property({ type: String, reflect: true }) value = '';

  @state() private viewYear = 0;
  @state() private viewMonth = 0;
  @state() private focused = '';

  @query('.calendar') private rootEl?: HTMLElement;

  protected override get frame(): HTMLElement {
    return this.rootEl ?? this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    const initial = fromISO(this.value) ?? new Date();
    this.viewYear = initial.getFullYear();
    this.viewMonth = initial.getMonth();
    this.focused = toISO(initial);
  }

  protected override willUpdate(changed: PropertyValues): void {
    // Sync the visible month to a new external value before render so it does
    // not schedule a second update from `updated`.
    if (changed.has('value') && this.value) {
      const date = fromISO(this.value);
      if (date) {
        this.viewYear = date.getFullYear();
        this.viewMonth = date.getMonth();
        this.focused = this.value;
      }
    }
  }

  protected override updated(): void {
    this.measure();
  }

  private setFocused(date: Date, focusCell = true): void {
    this.viewYear = date.getFullYear();
    this.viewMonth = date.getMonth();
    this.focused = toISO(date);
    if (focusCell) {
      this.updateComplete.then(() => {
        this.rootEl?.querySelector<HTMLElement>(`[data-date="${this.focused}"]`)?.focus();
      });
    }
  }

  private select(date: Date): void {
    this.value = toISO(date);
    this.dispatchEvent(
      new CustomEvent('select', { detail: this.value, bubbles: true, composed: true }),
    );
  }

  private changeMonth(delta: number): void {
    const base = new Date(this.viewYear, this.viewMonth + delta, 1);
    this.viewYear = base.getFullYear();
    this.viewMonth = base.getMonth();
  }

  private readonly onGridKeydown = (event: KeyboardEvent): void => {
    const current = fromISO(this.focused) ?? new Date(this.viewYear, this.viewMonth, 1);
    let handled = true;
    switch (event.key) {
      case 'ArrowLeft':
        this.setFocused(addDays(current, -1));
        break;
      case 'ArrowRight':
        this.setFocused(addDays(current, 1));
        break;
      case 'ArrowUp':
        this.setFocused(addDays(current, -7));
        break;
      case 'ArrowDown':
        this.setFocused(addDays(current, 7));
        break;
      case 'Home':
        this.setFocused(addDays(current, -current.getDay()));
        break;
      case 'End':
        this.setFocused(addDays(current, 6 - current.getDay()));
        break;
      case 'PageUp':
        this.setFocused(new Date(current.getFullYear(), current.getMonth() - 1, current.getDate()));
        break;
      case 'PageDown':
        this.setFocused(new Date(current.getFullYear(), current.getMonth() + 1, current.getDate()));
        break;
      case 'Enter':
      case ' ':
        this.select(current);
        break;
      default:
        handled = false;
    }
    if (handled) {
      event.preventDefault();
    }
  };

  private buildWeeks(): Date[][] {
    const firstOfMonth = new Date(this.viewYear, this.viewMonth, 1);
    const start = addDays(firstOfMonth, -firstOfMonth.getDay());
    const weeks: Date[][] = [];
    let cursor = start;
    for (let w = 0; w < 6; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(cursor);
        cursor = addDays(cursor, 1);
      }
      weeks.push(week);
    }
    return weeks;
  }

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.calendar.sketch.roughness,
      bowing: tokens.comp.calendar.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override render(): unknown {
    const todayISO = toISO(new Date());
    const weeks = this.buildWeeks();
    return html`<div class="calendar">
      ${this.renderSketch()}
      <div class="header">
        <button
          class="nav"
          type="button"
          aria-label="Previous month"
          @click=${() => this.changeMonth(-1)}
        >
          ‹
        </button>
        <span class="title" aria-live="polite">${MONTHS[this.viewMonth]} ${this.viewYear}</span>
        <button
          class="nav"
          type="button"
          aria-label="Next month"
          @click=${() => this.changeMonth(1)}
        >
          ›
        </button>
      </div>
      <table role="grid" @keydown=${this.onGridKeydown}>
        <thead>
          <tr>
            ${WEEKDAYS.map((day) => html`<th scope="col">${day}</th>`)}
          </tr>
        </thead>
        <tbody>
          ${weeks.map(
            (week) => html`<tr>
              ${week.map((date) => {
                const iso = toISO(date);
                const outside = date.getMonth() !== this.viewMonth;
                const selected = iso === this.value;
                const isToday = iso === todayISO;
                const classes = ['day'];
                if (outside) classes.push('outside');
                if (selected) classes.push('selected');
                if (isToday) classes.push('today');
                return html`<td role="gridcell" aria-selected=${selected}>
                  <button
                    class=${classes.join(' ')}
                    type="button"
                    data-date=${iso}
                    tabindex=${iso === this.focused ? '0' : '-1'}
                    aria-current=${isToday ? 'date' : 'false'}
                    @click=${() => this.select(date)}
                  >
                    ${date.getDate()}
                  </button>
                </td>`;
              })}
            </tr>`,
          )}
        </tbody>
      </table>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-calendar': GhCalendar;
  }
}

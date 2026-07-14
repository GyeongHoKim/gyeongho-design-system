import { useTheme } from '@shopify/restyle';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';
import { Icon } from './Icon.js';

/** Props for {@link Calendar}. */
export interface CalendarProps {
  /** Controlled selected date. */
  value?: Date;
  /** Fires with the tapped date. */
  onChange?: (date: Date) => void;
  /** Month to display initially (uncontrolled). Defaults to `value` or today. */
  defaultMonth?: Date;
  /** Earliest selectable date (inclusive). */
  minDate?: Date;
  /** Latest selectable date (inclusive). */
  maxDate?: Date;
  /** Test handle for queries. */
  testID?: string;
}

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

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Build the 6×7 grid of dates for the month containing `month`. */
function buildGrid(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());
  const cells: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    cells.push(d);
  }
  return cells;
}

/**
 * A hand-drawn month calendar. Renders a 6-week grid with today, selected and
 * disabled (out-of-range) states and prev/next month navigation. Pure date math
 * — no date library. All colours come from `@ghds/tokens` (`comp.calendar.*`)
 * via the Restyle theme.
 */
export function Calendar({
  value,
  onChange,
  defaultMonth,
  minDate,
  maxDate,
  testID,
}: CalendarProps) {
  const theme = useTheme<Theme>();
  const today = new Date();
  const [displayMonth, setDisplayMonth] = useState(
    () => defaultMonth ?? value ?? new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const grid = buildGrid(displayMonth);

  const isDisabled = (d: Date): boolean => {
    if (minDate && startOfDay(d) < startOfDay(minDate)) {
      return true;
    }
    if (maxDate && startOfDay(d) > startOfDay(maxDate)) {
      return true;
    }
    return false;
  };

  const goToMonth = (delta: number) => {
    setDisplayMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  return (
    <Box
      backgroundColor="calendarBg"
      padding="sm"
      testID={testID}
      style={{ alignSelf: 'flex-start' }}
    >
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="sm">
        <Pressable
          onPress={() => goToMonth(-1)}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          testID={testID ? `${testID}-prev` : undefined}
        >
          <Icon name="chevron-left" size="sm" color={theme.colors.calendarTextDefault} />
        </Pressable>
        <Text variant="label" color="calendarTextDefault">
          {`${MONTHS[displayMonth.getMonth()]} ${displayMonth.getFullYear()}`}
        </Text>
        <Pressable
          onPress={() => goToMonth(1)}
          accessibilityRole="button"
          accessibilityLabel="Next month"
          testID={testID ? `${testID}-next` : undefined}
        >
          <Icon name="chevron-right" size="sm" color={theme.colors.calendarTextDefault} />
        </Pressable>
      </Box>
      <Box flexDirection="row">
        {WEEKDAYS.map((day) => (
          <Box key={day} width={theme.spacing.xl} alignItems="center" paddingVertical="xs">
            <Text variant="caption" color="calendarTextMuted">
              {day}
            </Text>
          </Box>
        ))}
      </Box>
      <Box flexDirection="row" flexWrap="wrap" style={{ width: theme.spacing.xl * 7 }}>
        {grid.map((date) => {
          const inMonth = date.getMonth() === displayMonth.getMonth();
          const selected = value !== undefined && sameDay(date, value);
          const isToday = sameDay(date, today);
          const disabled = isDisabled(date);
          return (
            <Pressable
              key={date.toISOString()}
              onPress={disabled ? undefined : () => onChange?.(date)}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={date.toDateString()}
              accessibilityState={{ selected, disabled }}
              aria-selected={selected}
              style={{
                width: theme.spacing.xl,
                height: theme.spacing.xl,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.borderRadii.md,
                borderWidth: isToday && !selected ? theme.borderWidths.default : 0,
                borderColor: theme.colors.calendarCellToday,
                backgroundColor: selected
                  ? theme.colors.calendarCellSelected
                  : theme.colors.transparent,
              }}
            >
              <Text
                variant="caption"
                style={{
                  color: selected
                    ? theme.colors.calendarCellSelectedText
                    : disabled || !inMonth
                      ? theme.colors.calendarTextMuted
                      : theme.colors.calendarTextDefault,
                }}
              >
                {date.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </Box>
    </Box>
  );
}

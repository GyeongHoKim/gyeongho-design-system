import { tokens } from '@ghds/tokens';
import { type CSSProperties, useId, useState } from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { Calendar } from './Calendar.js';
import { Icon } from './Icon.js';
import { Label } from './Label.js';
import { Popover } from './Popover.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

export interface DatePickerProps {
  /** Controlled selected date. */
  value?: Date;
  /** Initial selected date when uncontrolled. */
  defaultValue?: Date;
  /** Called with the newly-selected date. */
  onChange?: (date: Date) => void;
  /** Visible label associated to the trigger. */
  label?: string;
  /** Placeholder shown when no date is selected. */
  placeholder?: string;
  disabled?: boolean;
  /** Formats the selected date for display. Defaults to the locale date string. */
  format?: (date: Date) => string;
  /** Predicate marking a date as non-selectable. */
  isDateDisabled?: (date: Date) => boolean;
}

const datePicker = tokens.comp.datePicker;
const c = cssVars.comp.datePicker;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

function defaultFormat(date: Date): string {
  return date.toLocaleDateString();
}

/**
 * A hand-drawn date picker: a sketchy field trigger that opens a {@link Popover}
 * containing a {@link Calendar}. Selecting a day fills the field and closes the
 * popover. Colours, padding and sketch parameters come from `@ghds/tokens`
 * (`comp.datePicker.*`); the calendar keyboard model comes from `Calendar`.
 */
export function DatePicker({
  value,
  defaultValue,
  onChange,
  label,
  placeholder = 'Pick a date',
  disabled = false,
  format = defaultFormat,
  isDateDisabled,
}: DatePickerProps) {
  const fieldId = useId();
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<Date | undefined>(defaultValue);
  const selected = isControlled ? value : internalValue;
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLButtonElement>({
    fillStyle: 'solid',
    roughness: datePicker.sketch.roughness,
    bowing: datePicker.sketch.bowing,
    inset: INSET,
  });

  const handleSelect = (date: Date) => {
    if (!isControlled) {
      setInternalValue(date);
    }
    onChange?.(date);
    setOpen(false);
  };

  const triggerStyle: CSSProperties = {
    ...sketchHostStyle,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.sys.spacing.sm,
    boxSizing: 'border-box',
    minWidth: '14rem',
    padding: `${datePicker.padding.vertical} ${datePicker.padding.horizontal}`,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: c.text,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
    lineHeight: String(tokens.sys.typography.body.lineHeight),
  };

  const trigger = (
    <button
      ref={mergeRefs(sketchRef)}
      id={fieldId}
      type="button"
      disabled={disabled}
      style={triggerStyle}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <SketchSurface
        drawable={drawable}
        width={size.width}
        height={size.height}
        strokeColor={focused ? c.field.stroke.focus : c.field.stroke.default}
        strokeWidth={STROKE_WIDTH}
        fillColor={c.field.bg}
        fillRendering="fill"
      />
      <span style={{ position: 'relative', opacity: selected ? 1 : 0.6 }}>
        {selected ? format(selected) : placeholder}
      </span>
      <Icon name="calendar" size="sm" style={{ position: 'relative' }} />
    </button>
  );

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: tokens.sys.spacing.xs }}>
      {label !== undefined && <Label htmlFor={fieldId}>{label}</Label>}
      <Popover
        trigger={trigger}
        open={open}
        onOpenChange={setOpen}
        aria-label={label ?? 'Choose a date'}
      >
        <Calendar
          value={selected}
          defaultMonth={selected}
          onSelect={handleSelect}
          isDateDisabled={isDateDisabled}
          aria-label={label ?? 'Choose a date'}
        />
      </Popover>
    </div>
  );
}

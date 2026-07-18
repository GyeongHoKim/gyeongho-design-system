import { tokens } from '@ghds/tokens';
import { Label } from '@radix-ui/react-label';
import {
  type ClipboardEvent,
  type CSSProperties,
  type KeyboardEvent,
  useId,
  useRef,
  useState,
} from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { toPx } from '../lib/units.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

/** Which characters an {@link InputOTP} accepts. */
export type InputOTPMode = 'numeric' | 'text';

export interface InputOTPProps {
  /** Number of segments/cells. Defaults to `6`. */
  length?: number;
  /** Controlled value (a left-filled prefix, never longer than `length`). */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Fires on every change with the full current value. */
  onChange?: (value: string) => void;
  /** Fires once the last cell is filled, with the complete code. */
  onComplete?: (value: string) => void;
  /** Accepted characters. `'numeric'` (default) restricts to digits. */
  mode?: InputOTPMode;
  /** Masks the entered characters like a password. */
  mask?: boolean;
  disabled?: boolean;
  /** Marks every cell invalid (danger stroke). */
  invalid?: boolean;
  /** Visible label, associated with the group via Radix `Label`. */
  label?: string;
  id?: string;
  /** Accessible name when no visible `label` is provided. */
  'aria-label'?: string;
}

const otp = tokens.comp.inputOtp;
const c = cssVars.comp.inputOtp;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;
const CELL_SIZE = otp.size;

function isAllowed(char: string, mode: InputOTPMode): boolean {
  return mode === 'numeric' ? /^[0-9]$/.test(char) : /^\S$/.test(char);
}

function sanitize(raw: string, mode: InputOTPMode): string {
  return Array.from(raw)
    .filter((ch) => isAllowed(ch, mode))
    .join('');
}

interface OtpCellProps {
  char: string;
  active: boolean;
  filled: boolean;
  disabled: boolean;
  invalid: boolean;
  mask: boolean;
  mode: InputOTPMode;
  ariaLabel: string;
  inputRef: (node: HTMLInputElement | null) => void;
  onFocus: () => void;
  onInput: (char: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
}

function resolveStroke(active: boolean, filled: boolean, invalid: boolean): string {
  if (invalid) {
    return c.stroke.danger;
  }
  if (active) {
    return c.stroke.active;
  }
  return filled ? c.stroke.filled : c.stroke.default;
}

function OtpCell({
  char,
  active,
  filled,
  disabled,
  invalid,
  mask,
  mode,
  ariaLabel,
  inputRef,
  onFocus,
  onInput,
  onKeyDown,
  onPaste,
}: OtpCellProps) {
  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLDivElement>({
    fillStyle: 'solid',
    roughness: otp.sketch.roughness,
    bowing: otp.sketch.bowing,
    inset: INSET,
  });

  const cellStyle: CSSProperties = {
    ...sketchHostStyle,
    display: 'inline-flex',
    boxSizing: 'border-box',
    width: CELL_SIZE,
    height: CELL_SIZE,
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    textAlign: 'center',
    color: disabled ? c.text.disabled : c.text.value,
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.title.fontSize,
    fontWeight: tokens.sys.typography.body.fontWeight,
    lineHeight: String(tokens.sys.typography.body.lineHeight),
    cursor: disabled ? 'not-allowed' : 'text',
    position: 'relative',
  };

  return (
    <div ref={sketchRef} style={cellStyle}>
      <SketchSurface
        drawable={drawable}
        width={size.width}
        height={size.height}
        strokeColor={resolveStroke(active, filled, invalid)}
        strokeWidth={STROKE_WIDTH}
        fillColor={disabled ? c.cell.bg.disabled : c.cell.bg.default}
        fillRendering="fill"
      />
      <input
        ref={inputRef}
        type={mask ? 'password' : 'text'}
        inputMode={mode === 'numeric' ? 'numeric' : 'text'}
        autoComplete="one-time-code"
        maxLength={1}
        aria-label={ariaLabel}
        disabled={disabled}
        value={char}
        style={inputStyle}
        onFocus={onFocus}
        onChange={(event) => onInput(event.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
      />
    </div>
  );
}

/**
 * A hand-drawn one-time-code field: a row of single-character cells backed by a
 * left-filled string value. Each cell is its own sketchy box
 * (`@ghds/sketch-core`); the active cell shows the focus stroke, filled cells a
 * stronger stroke, and every colour, size and sketch parameter comes from
 * `@ghds/tokens` (`comp.inputOtp.*`). Entry is sequential; typing advances,
 * Backspace deletes the last character, and pasting distributes across cells.
 */
export function InputOTP({
  length = 6,
  value,
  defaultValue = '',
  onChange,
  onComplete,
  mode = 'numeric',
  mask = false,
  disabled = false,
  invalid = false,
  label,
  id,
  'aria-label': ariaLabel,
}: InputOTPProps) {
  const reactId = useId();
  const groupId = id ?? reactId;
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(() =>
    sanitize(defaultValue, mode).slice(0, length),
  );
  const current = (isControlled ? sanitize(value, mode).slice(0, length) : internalValue) as string;

  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const focusCell = (index: number) => {
    const clamped = Math.max(0, Math.min(index, length - 1));
    inputsRef.current[clamped]?.focus();
    setFocusedIndex(clamped);
  };

  const commit = (next: string) => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
    if (next.length === length) {
      onComplete?.(next);
    }
  };

  const handleInput = (index: number, raw: string) => {
    if (disabled) {
      return;
    }
    const char = sanitize(raw, mode).slice(-1);
    if (char === '') {
      return;
    }
    const next =
      index < current.length
        ? current.slice(0, index) + char + current.slice(index + 1)
        : (current + char).slice(0, length);
    commit(next);
    focusCell(Math.min(index + 1, length - 1));
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }
    switch (event.key) {
      case 'Backspace':
        event.preventDefault();
        if (current.length > 0) {
          const next = current.slice(0, -1);
          commit(next);
          focusCell(next.length);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        focusCell(index - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        focusCell(Math.min(index + 1, current.length));
        break;
      case 'Home':
        event.preventDefault();
        focusCell(0);
        break;
      case 'End':
        event.preventDefault();
        focusCell(current.length);
        break;
      default:
        break;
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }
    event.preventDefault();
    const pasted = sanitize(event.clipboardData.getData('text'), mode).slice(0, length);
    if (pasted === '') {
      return;
    }
    commit(pasted);
    focusCell(Math.min(pasted.length, length - 1));
  };

  const fieldStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: tokens.sys.spacing.xs,
    fontFamily: tokens.sys.typography.body.fontFamily,
  };

  const labelStyle: CSSProperties = {
    color: c.text.value,
    fontFamily: tokens.sys.typography.label.fontFamily,
    fontSize: tokens.sys.typography.label.fontSize,
    fontWeight: tokens.sys.typography.label.fontWeight,
    lineHeight: String(tokens.sys.typography.label.lineHeight),
  };

  const groupStyle: CSSProperties = {
    display: 'inline-flex',
    gap: otp.gap,
  };

  return (
    <div style={fieldStyle}>
      {label !== undefined && (
        <Label htmlFor={`${groupId}-0`} style={labelStyle}>
          {label}
        </Label>
      )}
      {/* biome-ignore lint/a11y/useSemanticElements: role="group" + aria-label names the set of digit cells; a <fieldset>/<legend> would duplicate the Radix <Label> already wired to the first cell and needs layout resets that fight the sketch cells. */}
      <div role="group" aria-label={label ?? ariaLabel} style={groupStyle}>
        {Array.from({ length }, (_, index) => (
          <OtpCell
            // biome-ignore lint/suspicious/noArrayIndexKey: cells are a fixed positional row keyed by slot index
            key={index}
            char={current[index] ?? ''}
            active={focusedIndex === index}
            filled={index < current.length}
            disabled={disabled}
            invalid={invalid}
            mask={mask}
            mode={mode}
            ariaLabel={`Digit ${index + 1}`}
            inputRef={(node) => {
              inputsRef.current[index] = node;
              if (node) {
                node.id = `${groupId}-${index}`;
              }
            }}
            onFocus={() => setFocusedIndex(index)}
            onInput={(char) => handleInput(index, char)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
          />
        ))}
      </div>
    </div>
  );
}

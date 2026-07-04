import { tokens } from '@ghds/tokens';
import { Label } from '@radix-ui/react-label';
import {
  type ChangeEvent,
  type CSSProperties,
  forwardRef,
  type InputHTMLAttributes,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { CheckboxGroupContext } from './CheckboxGroup.js';
import { Icon } from './Icon.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Visible label. Associated to the input via Radix `Label` for accessibility. */
  label?: string;
  /**
   * DOM-only tri-state indicator — not a native HTML attribute. Set imperatively
   * on the underlying `<input>` via `element.indeterminate`, matching native
   * checkbox behavior. Purely visual; does not affect `checked`/form value.
   */
  indeterminate?: boolean;
  /** Identifies this checkbox within a `CheckboxGroup`. Ignored standalone. */
  value?: string;
}

const checkbox = tokens.comp.checkbox;
const c = cssVars.comp.checkbox;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;
const SIZE = toPx(tokens.comp.checkbox.size);

function resolveColors(checked: boolean, hovered: boolean, disabled: boolean) {
  if (disabled) {
    return {
      stroke: c.stroke.disabled,
      fill: checked ? c.bg.checked.disabled : c.bg.unchecked.disabled,
    };
  }
  return {
    stroke: hovered ? c.stroke.hover : checked ? c.stroke.checked : c.stroke.default,
    fill: checked ? (hovered ? c.bg.checked.hover : c.bg.checked.default) : c.bg.unchecked.default,
  };
}

/**
 * A hand-drawn checkbox. The sketchy box comes from `@ghds/sketch-core` (via
 * {@link useSketch}); the check/indeterminate mark reuses the existing `Icon`
 * component (`check`/`minus`) rather than inventing new glyph geometry. A real
 * `<input type="checkbox">` carries all native keyboard/focus/form behavior;
 * the sketch box and mark are purely decorative (`aria-hidden`).
 *
 * Works controlled (`checked`/`onChange`) or uncontrolled (`defaultChecked`),
 * like a native input. Inside a `CheckboxGroup`, `checked` is derived from the
 * group's `value` array via `value` — the group's own `onValueChange` still
 * fires alongside any `onChange` passed directly to this Checkbox.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label,
    indeterminate = false,
    value,
    checked,
    defaultChecked,
    disabled = false,
    style,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    onChange,
    id,
    ...rest
  },
  forwardedRef,
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const group = useContext(CheckboxGroupContext);

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);
  const [internalIndeterminate, setInternalIndeterminate] = useState(indeterminate);
  const inputRef = useRef<HTMLInputElement>(null);

  const groupChecked = group && value !== undefined ? group.value.includes(value) : undefined;
  const isChecked = groupChecked ?? checked ?? internalChecked;
  const isDisabled = disabled || group?.disabled === true;

  // Mirrors native checkbox activation: clicking clears `indeterminate`, so we
  // track it as internal state (like `internalChecked`) rather than trusting
  // the `indeterminate` prop to still match the real DOM property after a click.
  useEffect(() => {
    setInternalIndeterminate(indeterminate);
  }, [indeterminate]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = internalIndeterminate;
    }
  }, [internalIndeterminate]);

  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLDivElement>({
    shape: 'rectangle',
    roughness: checkbox.sketch.roughness,
    bowing: checkbox.sketch.bowing,
    fillStyle: 'solid',
    inset: INSET,
  });

  const colors = resolveColors(isChecked, hovered, isDisabled);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.checked;
    if (group && value !== undefined) {
      const nextValue = next ? [...group.value, value] : group.value.filter((v) => v !== value);
      group.onValueChange(nextValue);
    } else if (checked === undefined) {
      setInternalChecked(next);
    }
    setInternalIndeterminate(false);
    onChange?.(event);
  };

  const fieldStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: checkbox.gap,
    fontFamily: tokens.sys.typography.body.fontFamily,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
  };

  const boxStyle: CSSProperties = {
    ...sketchHostStyle,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    width: SIZE,
    height: SIZE,
    flexShrink: 0,
    outline: focused ? `${STROKE_WIDTH}px solid ${c.stroke.focus}` : 'none',
    outlineOffset: tokens.sys.spacing.xs,
    ...style,
  };

  const inputStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    opacity: 0,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
  };

  const labelStyle: CSSProperties = {
    color: isDisabled ? c.text.disabled : c.text.label,
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
  };

  const ref = mergeRefs(sketchRef, inputRef, forwardedRef);

  return (
    <span style={fieldStyle}>
      <span style={boxStyle}>
        <SketchSurface
          drawable={drawable}
          width={size.width}
          height={size.height}
          strokeColor={colors.stroke}
          strokeWidth={STROKE_WIDTH}
          fillColor={colors.fill}
          fillRendering="fill"
        />
        {(isChecked || internalIndeterminate) && (
          <Icon
            name={internalIndeterminate ? 'minus' : 'check'}
            size="sm"
            style={{ color: c.mark }}
          />
        )}
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          checked={isChecked}
          disabled={isDisabled}
          style={inputStyle}
          onChange={handleChange}
          onMouseEnter={(event) => {
            setHovered(true);
            onMouseEnter?.(event);
          }}
          onMouseLeave={(event) => {
            setHovered(false);
            onMouseLeave?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />
      </span>
      {label !== undefined && (
        <Label htmlFor={inputId} style={labelStyle}>
          {label}
        </Label>
      )}
    </span>
  );
});

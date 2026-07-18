import { tokens } from '@ghds/tokens';
import {
  type CSSProperties,
  createContext,
  type FocusEvent,
  forwardRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
  useContext,
  useState,
} from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { toPx } from '../lib/units.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

const inputGroup = tokens.comp.inputGroup;
const c = cssVars.comp.inputGroup;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

interface InputGroupContextValue {
  disabled: boolean;
}

const InputGroupContext = createContext<InputGroupContextValue>({ disabled: false });

export interface InputGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Disables the whole group and mutes the surface. */
  disabled?: boolean;
  /** Marks the group invalid, painting the danger stroke. */
  invalid?: boolean;
}

function resolveStroke(focused: boolean, invalid: boolean): string {
  if (invalid) {
    return c.stroke.danger;
  }
  return focused ? c.stroke.focus : c.stroke.default;
}

/**
 * A hand-drawn field that composes a bare {@link InputGroupInput} with leading
 * and/or trailing {@link InputGroupAddon}s (icons, text, buttons) inside a
 * single sketchy box. Focus within the group switches the outline to the focus
 * colour. Every colour, padding, radius and sketch parameter comes from
 * `@ghds/tokens` (`comp.inputGroup.*`).
 */
export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(function InputGroup(
  { disabled = false, invalid = false, children, style, onFocus, onBlur, ...rest },
  forwardedRef,
) {
  const [focused, setFocused] = useState(false);

  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLDivElement>({
    fillStyle: 'solid',
    roughness: inputGroup.sketch.roughness,
    bowing: inputGroup.sketch.bowing,
    inset: INSET,
  });

  const rootStyle: CSSProperties = {
    ...sketchHostStyle,
    display: 'flex',
    alignItems: 'center',
    gap: inputGroup.gap,
    boxSizing: 'border-box',
    padding: `${inputGroup.padding.vertical} ${inputGroup.padding.horizontal}`,
    fontFamily: tokens.sys.typography.body.fontFamily,
    ...style,
  };

  return (
    <InputGroupContext.Provider value={{ disabled }}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: the group only aggregates focus/blur bubbling from its inner controls to paint one shared focus outline — it is not itself an interactive target, so it takes no role. */}
      <div
        ref={(node) => {
          sketchRef(node);
          if (typeof forwardedRef === 'function') {
            forwardedRef(node);
          } else if (forwardedRef) {
            forwardedRef.current = node;
          }
        }}
        data-disabled={disabled || undefined}
        data-invalid={invalid || undefined}
        style={rootStyle}
        onFocus={(event: FocusEvent<HTMLDivElement>) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event: FocusEvent<HTMLDivElement>) => {
          setFocused(false);
          onBlur?.(event);
        }}
        {...rest}
      >
        <SketchSurface
          drawable={drawable}
          width={size.width}
          height={size.height}
          strokeColor={resolveStroke(focused, invalid)}
          strokeWidth={STROKE_WIDTH}
          fillColor={disabled ? c.bg.disabled : c.bg.default}
          fillRendering="fill"
        />
        {children}
      </div>
    </InputGroupContext.Provider>
  );
});

export interface InputGroupInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {}

/** The bare, borderless text input placed inside an {@link InputGroup}. */
export const InputGroupInput = forwardRef<HTMLInputElement, InputGroupInputProps>(
  function InputGroupInput({ disabled, style, ...rest }, forwardedRef) {
    const { disabled: groupDisabled } = useContext(InputGroupContext);
    const isDisabled = disabled ?? groupDisabled;

    const inputStyle: CSSProperties = {
      flex: 1,
      minWidth: 0,
      boxSizing: 'border-box',
      margin: 0,
      padding: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      color: isDisabled ? c.text.disabled : c.text.value,
      fontFamily: tokens.sys.typography.body.fontFamily,
      fontSize: tokens.sys.typography.body.fontSize,
      fontWeight: tokens.sys.typography.body.fontWeight,
      lineHeight: String(tokens.sys.typography.body.lineHeight),
      cursor: isDisabled ? 'not-allowed' : 'text',
      position: 'relative',
      ...style,
    };

    return <input ref={forwardedRef} disabled={isDisabled} style={inputStyle} {...rest} />;
  },
);

export interface InputGroupAddonProps extends HTMLAttributes<HTMLSpanElement> {}

/**
 * A leading or trailing addon slot inside an {@link InputGroup} — an icon,
 * short text, or a button. Rendered in muted text colour; place it before or
 * after {@link InputGroupInput} in the child order to position it.
 */
export const InputGroupAddon = forwardRef<HTMLSpanElement, InputGroupAddonProps>(
  function InputGroupAddon({ children, style, ...rest }, forwardedRef) {
    const addonStyle: CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.sys.spacing.xs,
      flexShrink: 0,
      color: c.addon.text,
      fontFamily: tokens.sys.typography.label.fontFamily,
      fontSize: tokens.sys.typography.label.fontSize,
      fontWeight: tokens.sys.typography.label.fontWeight,
      lineHeight: String(tokens.sys.typography.label.lineHeight),
      position: 'relative',
      ...style,
    };
    return (
      <span ref={forwardedRef} style={addonStyle} {...rest}>
        {children}
      </span>
    );
  },
);

import { ellipse, rectangle } from '@ghds/sketch-core';
import { useTheme } from '@shopify/restyle';
import { useCallback, useMemo, useState } from 'react';
import { type GestureResponderEvent, PanResponder } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Props for {@link Slider}. */
export interface SliderProps {
  /** Visible, accessible label — required (there is no separate label element on RN). */
  label: string;
  /** Controlled value. */
  value?: number;
  /** Initial value when uncontrolled. */
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  /** Fires with the next value while dragging. */
  onValueChange?: (value: number) => void;
  /** Disables interaction. */
  disabled?: boolean;
  /** Test handle for queries. */
  testID?: string;
}

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_STEP = 1;

/**
 * Hand-drawn range slider. Unlike the web platforms (where a real, invisible
 * `<input type="range">` carries all interaction), React Native has no
 * built-in slider primitive and no gesture library is installed — drag is
 * hand-rolled via `PanResponder` (built into RN core, no new dependency).
 * The rail, fill, and thumb are three shapes computed directly from
 * `@ghds/sketch-core`, sharing one measured box and seed — the same
 * multi-shape trick RN `Switch`'s thumb already uses.
 * `accessibilityRole="adjustable"` + `accessibilityValue` +
 * `accessibilityActions` (`increment`/`decrement`) are the standard RN
 * pattern for this kind of control — confirmed first-class props directly
 * against `ViewAccessibility.d.ts`.
 *
 * v1 scope: a single thumb (no two-thumb range mode), horizontal only.
 */
export function Slider({
  label,
  value,
  defaultValue,
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
  step = DEFAULT_STEP,
  onValueChange,
  disabled = false,
  testID,
}: SliderProps) {
  const theme = useTheme<Theme>();
  const [internalValue, setInternalValue] = useState(defaultValue ?? min);
  const currentValue = value !== undefined ? value : internalValue;

  const { onLayout, size, seed } = useSketch({
    shape: 'rectangle',
    inset: theme.borderWidths.default,
    roughness: theme.sliderSketch.roughness,
    bowing: theme.sliderSketch.bowing,
    fillStyle: 'solid',
  });

  const thumbSize = theme.sliderDimensions.thumbSize;
  const trackHeight = theme.sliderDimensions.trackHeight;
  const inset = theme.borderWidths.default;
  const percent = max > min ? Math.min(1, Math.max(0, (currentValue - min) / (max - min))) : 0;
  const railX = inset;
  const railY = (size.height - trackHeight) / 2 + inset;
  const railWidth = size.width - inset * 2;
  const railHeight = Math.max(1, trackHeight - inset * 2);
  const thumbCenterX = percent * (size.width - thumbSize) + thumbSize / 2;
  const thumbX = thumbCenterX - thumbSize / 2;
  const thumbY = (size.height - thumbSize) / 2;

  const rail = useMemo(() => {
    if (railWidth <= 0 || size.height <= 0) {
      return null;
    }
    return rectangle(railX, railY, railWidth, railHeight, {
      roughness: theme.sliderSketch.roughness,
      bowing: theme.sliderSketch.bowing,
      seed,
      fillStyle: 'solid',
    });
  }, [
    railX,
    railY,
    railWidth,
    railHeight,
    size.height,
    seed,
    theme.sliderSketch.roughness,
    theme.sliderSketch.bowing,
  ]);

  const fill = useMemo(() => {
    const fillWidth = Math.max(0, Math.min(railWidth, thumbCenterX - railX));
    if (fillWidth <= 0 || size.height <= 0) {
      return null;
    }
    return rectangle(railX, railY, fillWidth, railHeight, {
      roughness: theme.sliderSketch.roughness,
      bowing: theme.sliderSketch.bowing,
      seed,
      fillStyle: 'solid',
    });
  }, [
    railX,
    railY,
    railWidth,
    railHeight,
    thumbCenterX,
    size.height,
    seed,
    theme.sliderSketch.roughness,
    theme.sliderSketch.bowing,
  ]);

  const thumb = useMemo(() => {
    if (size.width <= 0 || size.height <= 0) {
      return null;
    }
    return ellipse(thumbX, thumbY, thumbSize, thumbSize, {
      roughness: theme.sliderSketch.roughness,
      bowing: theme.sliderSketch.bowing,
      seed,
      fillStyle: 'solid',
    });
  }, [
    thumbX,
    thumbY,
    thumbSize,
    size,
    seed,
    theme.sliderSketch.roughness,
    theme.sliderSketch.bowing,
  ]);

  const railStroke = disabled
    ? theme.colors.sliderStrokeDisabled
    : theme.colors.sliderStrokeDefault;
  const railFill = disabled ? theme.colors.sliderBgRailDisabled : theme.colors.sliderBgRailDefault;
  const fillColor = disabled ? theme.colors.sliderBgFillDisabled : theme.colors.sliderBgFillDefault;
  const thumbFill = disabled
    ? theme.colors.sliderThumbBgDisabled
    : theme.colors.sliderThumbBgDefault;
  const thumbStroke = disabled
    ? theme.colors.sliderThumbStrokeDisabled
    : theme.colors.sliderThumbStrokeDefault;

  const clampToStep = useCallback(
    (raw: number): number => {
      const stepped = Math.round((raw - min) / step) * step + min;
      return Math.min(max, Math.max(min, stepped));
    },
    [min, max, step],
  );

  // `locationX` is the touch position *relative to the responder-capturing
  // element itself* (confirmed directly against RN's `NativeTouchEvent`
  // type), unlike `pageX` (relative to the screen). Using it here avoids
  // needing `measureInWindow()` — an async native-bridge round trip — to
  // establish the track's absolute position, which previously created a race:
  // a fast flick right after touch-down (or the very first drag, before the
  // first measurement ever resolves) could deliver a move event before the
  // measured origin was ready, snapping the thumb to the wrong value.
  const valueFromLocationX = useCallback(
    (locationX: number): number => {
      if (size.width <= 0) {
        return currentValue;
      }
      const ratio = locationX / size.width;
      return clampToStep(min + ratio * (max - min));
    },
    [size.width, currentValue, min, max, clampToStep],
  );

  const commitValue = useCallback(
    (next: number): void => {
      if (value === undefined) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [value, onValueChange],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (evt: GestureResponderEvent) => {
          commitValue(valueFromLocationX(evt.nativeEvent.locationX));
        },
        onPanResponderMove: (evt: GestureResponderEvent) => {
          commitValue(valueFromLocationX(evt.nativeEvent.locationX));
        },
      }),
    [disabled, valueFromLocationX, commitValue],
  );

  const handleAccessibilityAction = (event: { nativeEvent: { actionName: string } }): void => {
    if (disabled) {
      return;
    }
    if (event.nativeEvent.actionName === 'increment') {
      commitValue(clampToStep(currentValue + step));
    } else if (event.nativeEvent.actionName === 'decrement') {
      commitValue(clampToStep(currentValue - step));
    }
  };

  return (
    <Box>
      <Text
        variant="label"
        color={disabled ? 'sliderTextDisabled' : 'sliderTextLabel'}
        paddingBottom="xs"
      >
        {label}
      </Text>
      <Box
        onLayout={onLayout}
        height={thumbSize}
        justifyContent="center"
        testID={testID}
        accessible
        // `role="slider"` (what `accessibilityRole="adjustable"` maps to on
        // react-native-web) is not one of RNW's auto-focusable roles
        // (button/checkbox/link/radio/textbox/switch only — confirmed
        // directly against `createDOMProps`), so a plain `View` with this
        // role is unreachable by keyboard unless `tabIndex`/`focusable` is
        // set explicitly. `focusable` is the real native-platform prop
        // (Android hardware-keyboard/TV focus); `tabIndex` is read directly
        // by RNW ahead of its `focusable` fallback logic.
        //
        // Known v1 gap: this makes the control reachable by keyboard on the
        // web target, but arrow-key step adjustment while focused is not yet
        // wired there — `onKeyDown` isn't part of real React Native's `View`
        // props (RNW-only), and `onAccessibilityAction` (used below for
        // native VoiceOver/TalkBack) has no React Native Web wiring at all
        // (confirmed directly). Documented in `slider.mdx`, not silently
        // faked — dragging with a mouse/touch still works on every platform.
        focusable={!disabled}
        tabIndex={disabled ? -1 : 0}
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min, max, now: currentValue }}
        // Neither `accessibilityValue` nor `accessibilityState` (the nested
        // objects) has a React Native Web equivalent mapping — confirmed
        // RNW's `createDOMProps` only reads flat `aria-valuemin`/
        // `aria-valuemax`/`aria-valuenow`/`aria-disabled` props, the same gap
        // class already found for Select's `aria-expanded` and Switch's
        // `aria-checked` — so these must be set directly for the web target.
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={currentValue}
        aria-disabled={disabled}
        accessibilityState={{ disabled }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={handleAccessibilityAction}
        {...panResponder.panHandlers}
      >
        <SketchBackground
          drawable={rail}
          size={size}
          strokeColor={railStroke}
          fillColor={railFill}
          strokeWidth={theme.borderWidths.default}
        />
        {fill && (
          <SketchBackground
            drawable={fill}
            size={size}
            strokeColor={fillColor}
            fillColor={fillColor}
            strokeWidth={theme.borderWidths.default}
          />
        )}
        {thumb && (
          <SketchBackground
            drawable={thumb}
            size={size}
            strokeColor={thumbStroke}
            fillColor={thumbFill}
            strokeWidth={theme.borderWidths.default}
          />
        )}
      </Box>
    </Box>
  );
}

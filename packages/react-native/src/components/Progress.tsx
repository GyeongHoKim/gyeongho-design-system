import { useTheme } from '@shopify/restyle';
import { useRef, useState } from 'react';
import { Animated, Easing, type LayoutChangeEvent, View } from 'react-native';
import { useReducedMotionLoop } from '../motion.js';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Props for {@link Progress}. */
export interface ProgressProps {
  /** Current value. Omit for an indeterminate bar. */
  value?: number;
  /** Maximum value. Defaults to `100`. */
  max?: number;
  /** Accessible label describing what is progressing. */
  label?: string;
  /** Test handle for queries. */
  testID?: string;
}

const INDETERMINATE_FRACTION = 0.4;

/**
 * A hand-drawn progress bar. The rail and fill are solid, token-driven surfaces
 * with a sketchy outline from `@ghds/sketch-core` (rendered with
 * `react-native-svg`); every colour, height and sketch parameter is sourced
 * from `@ghds/tokens` via the Restyle theme (`comp.progress.*`). Pass a `value`
 * for a determinate bar, or omit it for an indeterminate sweep (suppressed when
 * the OS "reduce motion" setting is on).
 */
export function Progress({ value, max = 100, label, testID }: ProgressProps) {
  const theme = useTheme<Theme>();
  const indeterminate = value === undefined;
  const fraction = indeterminate ? INDETERMINATE_FRACTION : Math.min(1, Math.max(0, value / max));

  const sweep = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(0);

  const {
    onLayout: railLayout,
    size: railSize,
    drawable: railDrawable,
  } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.progressSketch.roughness,
    bowing: theme.progressSketch.bowing,
  });

  const {
    onLayout: fillLayout,
    size: fillSize,
    drawable: fillDrawable,
  } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.progressSketch.roughness,
    bowing: theme.progressSketch.bowing,
  });

  const duration = theme.progressDuration;

  useReducedMotionLoop(
    () =>
      Animated.loop(
        Animated.timing(sweep, {
          toValue: 1,
          duration: duration * 3,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ),
    [duration, sweep],
    indeterminate,
  );

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
    railLayout(event);
  };

  const height = theme.progressTrackHeight;
  const radius = height / 2;
  const fillWidth = trackWidth * fraction;
  const translateX = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-fillWidth, trackWidth + fillWidth],
  });

  return (
    <Box
      onLayout={handleTrackLayout}
      backgroundColor="progressBgRail"
      style={{ width: '100%', height, borderRadius: radius, overflow: 'hidden' }}
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      // `accessibilityValue` drives native VoiceOver/TalkBack; react-native-web
      // does not forward the nested object, so the flat `aria-value*` props are
      // set for the web target (same gap class as Slider/Select — [[ghds-rnw-prop-gaps]]).
      accessibilityValue={indeterminate ? undefined : { min: 0, max, now: value }}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : max}
      aria-valuenow={indeterminate ? undefined : value}
    >
      <SketchBackground
        drawable={railDrawable}
        size={railSize}
        strokeColor={theme.colors.progressStrokeRail}
        strokeWidth={theme.borderWidths.default}
      />
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: indeterminate ? `${INDETERMINATE_FRACTION * 100}%` : `${fraction * 100}%`,
          borderRadius: radius,
          overflow: 'hidden',
          backgroundColor: theme.colors.progressBgFill,
          transform: indeterminate ? [{ translateX }] : [],
        }}
      >
        <View onLayout={fillLayout} style={{ width: '100%', height: '100%' }}>
          <SketchBackground
            drawable={fillDrawable}
            size={fillSize}
            strokeColor={theme.colors.progressStrokeFill}
            strokeWidth={theme.borderWidths.default}
          />
        </View>
      </Animated.View>
    </Box>
  );
}

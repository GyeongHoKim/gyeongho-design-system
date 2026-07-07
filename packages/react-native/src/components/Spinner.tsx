import { useTheme } from '@shopify/restyle';
import { useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useReducedMotionLoop } from '../motion.js';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Rendered diameter of a {@link Spinner}. */
export type SpinnerSize = 'sm' | 'md' | 'lg';

/** Props for {@link Spinner}. */
export interface SpinnerProps {
  /** Rendered diameter. Defaults to `'md'`. */
  size?: SpinnerSize;
  /** Accessible label for the busy state. Defaults to `'Loading'`. */
  label?: string;
  /** Test handle for queries. */
  testID?: string;
}

const FULL: ['0deg', '360deg'] = ['0deg', '360deg'];

/**
 * A hand-drawn loading spinner: a sketchy ellipse ring (`@ghds/sketch-core`,
 * rendered with `react-native-svg`) that rotates via the `Animated` API. The
 * wobble of the hand-drawn outline makes the spin legible. Colour, size and the
 * spin duration come from `@ghds/tokens` via the Restyle theme
 * (`comp.spinner.*`). Rotation is suppressed when the OS "reduce motion"
 * setting is on.
 */
export function Spinner({ size = 'md', label = 'Loading', testID }: SpinnerProps) {
  const theme = useTheme<Theme>();
  const rotation = useRef(new Animated.Value(0)).current;

  const {
    onLayout,
    size: measured,
    drawable,
  } = useSketch({
    shape: 'ellipse',
    inset: theme.borderWidths.default,
    roughness: theme.spinnerSketch.roughness,
    bowing: theme.spinnerSketch.bowing,
  });

  const duration = theme.spinnerDuration;

  useReducedMotionLoop(
    () =>
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
    [rotation, duration],
  );

  const dimension = theme.spinnerSizes[size];
  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: FULL });

  return (
    <Box
      onLayout={onLayout}
      style={{ width: dimension, height: dimension }}
      testID={testID}
      accessibilityLabel={label}
      // `accessibilityState` drives native; react-native-web does not forward it,
      // so `role="status"` + `aria-busy` are set for the web target to match the
      // React/Web-Component Spinners' `role="status"` ([[ghds-rnw-prop-gaps]]).
      accessibilityState={{ busy: true }}
      role="status"
      aria-busy={true}
    >
      <Animated.View style={{ width: '100%', height: '100%', transform: [{ rotate }] }}>
        <SketchBackground
          drawable={drawable}
          size={measured}
          strokeColor={theme.colors.spinnerIndicator}
          strokeWidth={theme.borderWidths.default}
        />
      </Animated.View>
    </Box>
  );
}

import { useTheme } from '@shopify/restyle';
import { useRef } from 'react';
import { Animated, type DimensionValue, Easing } from 'react-native';
import { useReducedMotionLoop } from '../motion.js';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Shape of a {@link Skeleton} placeholder. */
export type SkeletonVariant = 'rect' | 'text' | 'circle';

/** Props for {@link Skeleton}. */
export interface SkeletonProps {
  /** Placeholder shape. Defaults to `'rect'`. */
  variant?: SkeletonVariant;
  /** Width (number ⇒ px). Defaults to `'100%'` (or the diameter for `circle`). */
  width?: DimensionValue;
  /** Height (number ⇒ px). Defaults per variant. */
  height?: DimensionValue;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * A hand-drawn loading placeholder: a solid, token-driven surface with a sketchy
 * outline (`@ghds/sketch-core`, rendered with `react-native-svg`) that gently
 * pulses opacity while content loads. Colours, radius, the pulse duration, and
 * the dimmed opacity all come from `@ghds/tokens` via the Restyle theme
 * (`comp.skeleton.*` / `sys.opacity.disabled`). The pulse is suppressed when the
 * OS "reduce motion" setting is on. Hidden from assistive tech — announce the
 * busy state on the region it replaces.
 */
export function Skeleton({ variant = 'rect', width, height, testID }: SkeletonProps) {
  const theme = useTheme<Theme>();
  const isCircle = variant === 'circle';
  const pulse = useRef(new Animated.Value(1)).current;

  const { onLayout, size, drawable } = useSketch({
    shape: isCircle ? 'ellipse' : 'rectangle',
    inset: theme.borderWidths.default,
    roughness: theme.skeletonSketch.roughness,
    bowing: theme.skeletonSketch.bowing,
  });

  const duration = theme.skeletonDuration;
  const pulseMin = theme.skeletonPulseMin;

  useReducedMotionLoop(
    () =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: pulseMin,
            duration: duration * 1.5,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: duration * 1.5,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ),
    [pulse, pulseMin, duration],
  );

  const diameter: DimensionValue = height ?? width ?? theme.spacing['2xl'];
  const resolvedWidth: DimensionValue = isCircle ? diameter : (width ?? '100%');
  const resolvedHeight: DimensionValue = isCircle
    ? diameter
    : (height ?? (variant === 'text' ? theme.spacing.md : theme.spacing.lg));
  const radius = isCircle || variant === 'text' ? theme.borderRadii.pill : theme.skeletonRadius;

  return (
    <Animated.View style={{ opacity: pulse, alignSelf: isCircle ? 'flex-start' : 'stretch' }}>
      <Box
        onLayout={onLayout}
        backgroundColor="skeletonBg"
        style={{
          width: resolvedWidth,
          height: resolvedHeight,
          borderRadius: radius,
          overflow: 'hidden',
        }}
        testID={testID}
        aria-hidden={true}
        accessibilityElementsHidden={true}
        importantForAccessibility="no-hide-descendants"
      >
        <SketchBackground
          drawable={drawable}
          size={size}
          strokeColor={theme.colors.skeletonStroke}
          strokeWidth={theme.borderWidths.default}
        />
      </Box>
    </Animated.View>
  );
}

import type { SketchDrawable } from '@ghds/sketch-core';
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { Size } from './options.js';

/** Props for {@link SketchBackground}. Colors are token hex values, not keys. */
export interface SketchBackgroundProps {
  /** Outline IR from `useSketch`. When `null`, nothing is rendered. */
  drawable: SketchDrawable | null;
  /** Measured size of the host element. */
  size: Size;
  /** Stroke color for the outline (`d` strings in `strokePaths`). */
  strokeColor: string;
  /** Stroke width in px (border width token). */
  strokeWidth: number;
  /** Color for fill lines (`fillPaths`). Omit to leave the shape unfilled. */
  fillColor?: string;
  /** Color for the offset elevation shadow (`shadowPaths`). Omit ⇒ no shadow. */
  shadowColor?: string;
}

/**
 * Renders a sketch-core {@link SketchDrawable} as an absolutely-positioned
 * `react-native-svg` layer behind a component's content. This is the only
 * rendering difference from the web adapter: the same `d` strings are injected
 * into `<Path>` (RN) instead of `<path>` (DOM). All colors come from the
 * caller, which sources them from `@ghds/tokens`.
 */
export function SketchBackground({
  drawable,
  size,
  strokeColor,
  strokeWidth,
  fillColor,
  shadowColor,
}: SketchBackgroundProps) {
  if (!drawable || size.width <= 0 || size.height <= 0) {
    return null;
  }

  return (
    <Svg
      pointerEvents="none"
      width={size.width}
      height={size.height}
      style={StyleSheet.absoluteFill}
    >
      {shadowColor
        ? drawable.shadowPaths?.map((d) => (
            <Path
              key={`shadow:${d}`}
              d={d}
              stroke={shadowColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />
          ))
        : null}
      {fillColor
        ? drawable.fillPaths.map((d) => (
            <Path
              key={`fill:${d}`}
              d={d}
              stroke={fillColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />
          ))
        : null}
      {drawable.strokePaths.map((d) => (
        <Path
          key={`stroke:${d}`}
          d={d}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}

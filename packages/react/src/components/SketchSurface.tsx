import type { SketchDrawable } from '@ghds/sketch-core';
import type { CSSProperties, JSX } from 'react';

/**
 * How to paint `fillPaths`. Closed-ring fills (`solid`/`dots`) are *filled*;
 * line-based fills (`hachure`/`cross-hatch`/`zigzag`) are *stroked*.
 */
export type FillRendering = 'fill' | 'stroke';

export interface SketchSurfaceProps {
  /** IR from `useSketch`; renders nothing while `null`. */
  drawable: SketchDrawable | null;
  /** Measured box used for the SVG viewBox. */
  width: number;
  height: number;
  /** Outline color (a `sys`/`comp` color token). */
  strokeColor: string;
  /** Outline width in px (a border-width token). */
  strokeWidth: number;
  /** Fill color (a `sys`/`comp` color token). Omit for outline-only shapes. */
  fillColor?: string;
  /** Whether `fillPaths` are filled regions or stroked lines. */
  fillRendering?: FillRendering;
  /** Stroke width for line-based fills. */
  fillStrokeWidth?: number;
  /** Shadow-layer color (a muted token). Drawn only when `shadowPaths` exist. */
  shadowColor?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * The style every host of a {@link SketchSurface} must apply to its root
 * element. The surface paints at `z-index: -1` (see {@link BASE_STYLE}), so the
 * host has to establish its own stacking context — otherwise that negative
 * layer is hoisted to an ancestor's stacking context and painted behind any
 * opaque-background container (card, panel, section), hiding the sketch and,
 * for filled components, the light label (GHD-44). `position: relative` also
 * makes the absolutely-positioned surface size to the host's border box.
 *
 * Exported so the requirement lives next to the `z-index: -1` it compensates
 * for, rather than being re-derived by each consumer.
 */
export const sketchHostStyle: CSSProperties = {
  position: 'relative',
  isolation: 'isolate',
};

const BASE_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  overflow: 'visible',
  pointerEvents: 'none',
  // Decorative layer paints behind the component's in-flow content (which keeps
  // its natural stacking) without needing a wrapper around that content.
  zIndex: -1,
};

/**
 * Renders a {@link SketchDrawable} as an inline, decorative `<svg>` positioned
 * behind a component's content. It owns no design values — every color and
 * width is passed in from a token by the parent component. The element is
 * `aria-hidden` because it is purely presentational.
 */
export function SketchSurface({
  drawable,
  width,
  height,
  strokeColor,
  strokeWidth,
  fillColor,
  fillRendering = 'fill',
  fillStrokeWidth = 1,
  shadowColor,
  className,
  style,
}: SketchSurfaceProps): JSX.Element | null {
  if (drawable === null || width <= 0 || height <= 0) {
    return null;
  }

  const fillAsRegion = fillRendering === 'fill';

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ ...BASE_STYLE, ...style }}
    >
      <title>decorative sketch outline</title>
      {shadowColor !== undefined &&
        drawable.shadowPaths?.map((d, i) => (
          <path
            // biome-ignore lint/suspicious/noArrayIndexKey: paths are a fixed, ordered IR list
            key={`shadow-${i}`}
            d={d}
            fill="none"
            stroke={shadowColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      {fillColor !== undefined &&
        drawable.fillPaths.map((d, i) => (
          <path
            // biome-ignore lint/suspicious/noArrayIndexKey: paths are a fixed, ordered IR list
            key={`fill-${i}`}
            d={d}
            fill={fillAsRegion ? fillColor : 'none'}
            fillRule="evenodd"
            stroke={fillAsRegion ? 'none' : fillColor}
            strokeWidth={fillAsRegion ? undefined : fillStrokeWidth}
            strokeLinecap="round"
          />
        ))}
      {drawable.strokePaths.map((d, i) => (
        <path
          // biome-ignore lint/suspicious/noArrayIndexKey: paths are a fixed, ordered IR list
          key={`stroke-${i}`}
          d={d}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

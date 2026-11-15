import type { ReactNode } from 'react';

/**
 * Test-only stand-in for `react-native-svg`.
 *
 * `react-native-svg`'s web build relies on a Metro/Vite-style bundler to pick
 * its `.web` modules; it cannot be loaded in a plain jsdom + Node test runner.
 * Production code (Storybook web + native) uses the real package — this stub is
 * wired in only for unit tests (see `vitest.config.ts`), and it maps the SVG
 * primitives to their DOM equivalents so `SketchBackground`'s path-emission
 * logic can be asserted against real `<svg>`/`<path>` elements.
 */

interface SvgProps {
  width?: number;
  height?: number;
  children?: ReactNode;
  pointerEvents?: string;
  style?: unknown;
  testID?: string;
  viewBox?: string;
  'aria-hidden'?: boolean;
  accessibilityElementsHidden?: boolean;
  importantForAccessibility?: string;
}

/**
 * Accessibility props are forwarded, not hard-coded, so tests can assert what
 * the component actually passes. The native-only props surface as `data-*`.
 */
export default function Svg({
  width,
  height,
  children,
  testID,
  viewBox,
  'aria-hidden': ariaHidden,
  accessibilityElementsHidden,
  importantForAccessibility,
}: SvgProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      data-testid={testID ?? 'sketch-svg'}
      aria-hidden={ariaHidden}
      data-accessibility-elements-hidden={accessibilityElementsHidden}
      data-important-for-accessibility={importantForAccessibility}
    >
      <title>sketch outline</title>
      {children}
    </svg>
  );
}

interface PathProps {
  d: string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  strokeLinecap?: string;
  strokeLinejoin?: string;
}

export function Path({ d, stroke, strokeWidth, fill }: PathProps) {
  return <path d={d} stroke={stroke} strokeWidth={strokeWidth} fill={fill} />;
}

interface EllipseProps {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  fill?: string;
  fillOpacity?: number;
}

export function Ellipse({ cx, cy, rx, ry, fill, fillOpacity }: EllipseProps) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} fillOpacity={fillOpacity} />;
}

interface LineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke?: string;
  strokeWidth?: number;
  strokeLinecap?: string;
  strokeDasharray?: string;
}

export function Line({ x1, y1, x2, y2, stroke, strokeWidth, strokeDasharray }: LineProps) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
    />
  );
}

interface CircleProps {
  cx: number;
  cy: number;
  r: number;
  fill?: string;
  fillOpacity?: number;
}

export function Circle({ cx, cy, r, fill, fillOpacity }: CircleProps) {
  return <circle cx={cx} cy={cy} r={r} fill={fill} fillOpacity={fillOpacity} />;
}

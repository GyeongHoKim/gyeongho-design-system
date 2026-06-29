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
}

export default function Svg({ width, height, children }: SvgProps) {
  return (
    <svg width={width} height={height} data-testid="sketch-svg" aria-hidden="true">
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

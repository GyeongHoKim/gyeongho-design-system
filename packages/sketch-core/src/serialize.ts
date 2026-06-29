import type { Op } from './types.js';

/** The fixed coordinate precision (decimal places) used across the engine. */
export const PRECISION = 2;

/**
 * Round a coordinate to the engine's standard precision. The one rounding
 * primitive: `serialize` uses it for output, and trig-based flattening (`path`
 * curves/arcs) uses it to quantize sample points *before* they reach the `d`
 * string, so sub-ULP cross-engine differences in `Math.cos/sin/sqrt` cannot
 * change output or trigger SSR hydration mismatches.
 */
export function quantize(n: number, precision = PRECISION): number {
  return Number(n.toFixed(precision));
}

/**
 * Turn an `Op[]` into an SVG path `d` string. Each coordinate is rounded to
 * `precision` decimals to keep strings compact and snapshot-stable.
 *
 * `precision` is intentionally fixed at 2 across the package — changing it
 * churns every golden snapshot, so it is a deliberate constant, not a knob.
 */
export function serialize(ops: Op[], precision = PRECISION): string {
  const f = (n: number): number => quantize(n, precision);
  const parts: string[] = [];
  for (const o of ops) {
    switch (o.op) {
      case 'move':
        parts.push(`M${f(o.data[0])} ${f(o.data[1])}`);
        break;
      case 'lineTo':
        parts.push(`L${f(o.data[0])} ${f(o.data[1])}`);
        break;
      case 'bcurveTo':
        parts.push(
          `C${f(o.data[0])} ${f(o.data[1])}, ${f(o.data[2])} ${f(o.data[3])}, ${f(o.data[4])} ${f(o.data[5])}`,
        );
        break;
    }
  }
  return parts.join(' ');
}

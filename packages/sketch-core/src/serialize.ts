import type { Op } from './types.js';

/**
 * Turn an `Op[]` into an SVG path `d` string. Each coordinate is rounded to
 * `precision` decimals to keep strings compact and snapshot-stable.
 *
 * `precision` is intentionally fixed at 2 across the package — changing it
 * churns every golden snapshot, so it is a deliberate constant, not a knob.
 */
export function serialize(ops: Op[], precision = 2): string {
  const f = (n: number): number => Number(n.toFixed(precision));
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

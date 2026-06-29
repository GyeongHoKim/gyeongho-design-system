/**
 * Parse the numeric part of a token dimension string (`"2px"` → `2`). Tokens are
 * the source of the value; this only adapts the unit-suffixed web string into
 * the bare number that SVG geometry/attributes need.
 */
export function toPx(value: string): number {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

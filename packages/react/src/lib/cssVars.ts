import { tokens } from '@ghds/tokens';

/**
 * Same shape as the `@ghds/tokens` object, but every leaf is the *CSS custom
 * property reference* for that token instead of its literal value.
 *
 * Components consume colors through these references so that toggling
 * `[data-theme="dark"]` (or `prefers-color-scheme`) on an ancestor re-themes
 * them live — the dark values are supplied by `@ghds/tokens/css`. The token's
 * light value is embedded as the `var()` fallback (sourced from the tokens
 * object, never hand-written), so a component still renders correctly if a
 * consumer forgets to load the stylesheet.
 */
export type CssVars<T> = {
  readonly [K in keyof T]: T[K] extends string | number ? string : CssVars<T[K]>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function build<T extends Record<string, unknown>>(node: T, path: readonly string[]): CssVars<T> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node)) {
    const next = [...path, key];
    out[key] = isRecord(value) ? build(value, next) : `var(--${next.join('-')}, ${String(value)})`;
  }
  return out as CssVars<T>;
}

/** Token tree re-expressed as `var(--token-path, fallback)` strings. */
export const cssVars = build(
  tokens as unknown as Record<string, unknown>,
  [],
) as unknown as CssVars<typeof tokens>;

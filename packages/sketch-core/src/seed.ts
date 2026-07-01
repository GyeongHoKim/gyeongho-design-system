/**
 * Deterministic-seed override.
 *
 * Each platform adapter (`@ghds/react`, `@ghds/web-components`,
 * `@ghds/react-native`) generates a fresh random seed per component instance so
 * hand-drawn output varies naturally. That randomness makes visual-regression
 * snapshots (Storybook under Chromatic) flap: every run re-rolls the geometry
 * and reports a false diff.
 *
 * A snapshot/test host can call {@link setForcedSeed} (typically guarded by a
 * Chromatic/test check) to pin ONE seed for every sketch, making the geometry
 * byte-deterministic across runs. Adapters read it via {@link forcedSeed} and
 * fall back to their own `Math.random()` when it is unset — `Math.random()` is
 * banned in this package, so the random fallback stays in the adapters.
 *
 * State lives on `globalThis` (not a module variable) so a single override
 * applies across every package that imports its own copy of `@ghds/sketch-core`.
 */
export const DETERMINISTIC_SEED_GLOBAL = '__GHDS_SKETCH_SEED__';

/** The forced seed if a host has pinned one, else `null` (use a random seed). */
export function forcedSeed(): number | null {
  const value = (globalThis as Record<string, unknown>)[DETERMINISTIC_SEED_GLOBAL];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Pin every sketch to `seed` (deterministic), or pass `null` to clear it. */
export function setForcedSeed(seed: number | null): void {
  const store = globalThis as Record<string, unknown>;
  if (seed === null) {
    delete store[DETERMINISTIC_SEED_GLOBAL];
  } else {
    store[DETERMINISTIC_SEED_GLOBAL] = seed;
  }
}

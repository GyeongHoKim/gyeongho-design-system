import { iconPaths } from './paths.js';

export { iconPaths } from './paths.js';

/** The coordinate grid every icon path is authored on (`viewBox="0 0 24 24"`). */
export const ICON_VIEWBOX = 24;

/** A valid icon name (a key of {@link iconPaths}). */
export type IconName = keyof typeof iconPaths;

/** All icon names, sorted — handy for catalogs and tests. */
export const iconNames = Object.keys(iconPaths).sort() as IconName[];

/** Type guard: is `name` a known icon? */
export function isIconName(name: string): name is IconName {
  return Object.hasOwn(iconPaths, name);
}

/** Look up an icon's path `d` string, or `undefined` if the name is unknown. */
export function getIconPath(name: IconName): string {
  return iconPaths[name];
}

/**
 * Deterministic PRNG seed for an icon, derived from its name (FNV-1a).
 *
 * Icons should look *stable* — the same icon renders with identical hand-drawn
 * jitter everywhere (across re-renders, SSR, snapshots, and all three
 * platforms) — so the seed is a pure function of the name rather than random.
 * This keeps iconography consistent without any `Math.random()`.
 */
export function iconSeed(name: IconName): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) {
    hash ^= name.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // Force an unsigned, non-zero 32-bit integer (0 is a poor PRNG seed).
  return hash >>> 0 || 1;
}

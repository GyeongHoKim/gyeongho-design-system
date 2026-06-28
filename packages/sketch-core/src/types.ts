/** A 2-D point, `[x, y]`. */
export type Point = [x: number, y: number];

/**
 * Geometry-only options for a sketchy shape. Style values (color, stroke
 * width) are NOT here — those are applied by the renderer from `@ghds/tokens`.
 * See AGENTS.md "Non-negotiable rules".
 */
export interface SketchOptions {
  /** Point-jitter magnitude. Higher = rougher. Sourced from a token. */
  roughness: number;
  /** How much straight edges bow. Sourced from a token. */
  bowing: number;
  /** Deterministic seed. REQUIRED — drives the PRNG so output is stable. */
  seed: number;
  /** Fill strategy for closed shapes. Omit for no fill. */
  fillStyle?: 'hachure' | 'solid' | 'cross-hatch';
  /** Gap between hachure lines (px). Sourced from a token. */
  hachureGap?: number;
  /** Hachure angle in degrees. Sourced from a token. */
  hachureAngle?: number;
}

/**
 * The cross-platform IR. Every renderer (Lit, React, React Native) consumes
 * these `d` strings and injects them into its own `<path>` / `<Path>`.
 */
export interface SketchDrawable {
  /** Outline strokes. Double-stroke is baked in (2 paths per edge). */
  strokePaths: string[];
  /** Fill lines (hachure/cross-hatch/solid). Empty when there is no fill. */
  fillPaths: string[];
}

/** Internal drawing operation, serialized to a path `d` string. */
export type Op =
  | { op: 'move'; data: [number, number] }
  | { op: 'lineTo'; data: [number, number] }
  | { op: 'bcurveTo'; data: [number, number, number, number, number, number] };

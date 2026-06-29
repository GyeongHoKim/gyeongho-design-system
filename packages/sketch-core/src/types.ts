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
  fillStyle?: 'hachure' | 'solid' | 'cross-hatch' | 'zigzag' | 'dots';
  /** Gap between fill lines / dots (px). Sourced from a token. */
  hachureGap?: number;
  /** Hachure angle in degrees. Sourced from a token. */
  hachureAngle?: number;
  /**
   * Drop-shadow offset in px expressing elevation. When set and `> 0`, shapes
   * emit an extra offset outline in {@link SketchDrawable.shadowPaths}. Omit or
   * `0` ⇒ no shadow. Geometry only (no color/opacity); the renderer sources it
   * from a token (e.g. `ref.dimension`) and styles the shadow layer itself.
   */
  elevation?: number;
}

/**
 * The cross-platform IR. Every renderer (Lit, React, React Native) consumes
 * these `d` strings and injects them into its own `<path>` / `<Path>`.
 */
export interface SketchDrawable {
  /** Outline strokes. Double-stroke is baked in (2 paths per edge). */
  strokePaths: string[];
  /** Fill lines (hachure/cross-hatch/solid/zigzag/dots). Empty when no fill. */
  fillPaths: string[];
  /**
   * Offset "drop shadow" outline strokes expressing elevation. Present (and
   * non-empty) only when `SketchOptions.elevation > 0`. The renderer draws
   * these behind {@link strokePaths} in a muted/token color to fake depth —
   * purely IR, no platform shadow API. Absent for flat shapes.
   */
  shadowPaths?: string[];
}

/** Internal drawing operation, serialized to a path `d` string. */
export type Op =
  | { op: 'move'; data: [number, number] }
  | { op: 'lineTo'; data: [number, number] }
  | { op: 'bcurveTo'; data: [number, number, number, number, number, number] };

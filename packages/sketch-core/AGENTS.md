# @ghds/sketch-core — AGENTS.md

> Package-specific guide. See the [root `AGENTS.md`](../../AGENTS.md) for the
> project overview and the project-wide **Code Quality Gate**.
>
> Algorithm internals (the math behind the hand-drawn look) live in
> [`DESIGN.md`](./DESIGN.md). Read it before touching anything under
> `src/geometry/` or `src/fillers/`.

## Purpose

`@ghds/sketch-core` is the platform-agnostic **geometry engine** that gives GHDS
its hand-drawn ("sketchy", wired-style) aesthetic. It is the GHDS equivalent of
`wired-lib`, but with one decisive difference:

> **wired-lib returns `SVGElement` (DOM nodes). We return data.**

This package has **zero runtime dependencies** and **no DOM / React / Lit
imports**. It takes a shape + options and returns serializable **SVG path `d`
strings**. Every renderer (`@ghds/web-components`, `@ghds/react`,
`@ghds/react-native`) consumes that same data and injects it into its own
`<path>` / `<Path>`. Path `d` strings are the only language web SVG and
`react-native-svg` both speak — that is the cross-platform leverage point.

```
shape + options ──▶ sketch-core ──▶ { strokePaths, fillPaths }  (d strings)
                                          │
                 ┌────────────────────────┼────────────────────────┐
                 ▼                         ▼                         ▼
          Lit <path>               React <path>          RN <Path> (rn-svg)
```

---

## The IR Contract (do not break casually)

All three renderers depend on these types. Changing them is a breaking change
and needs a changeset + coordination across packages.

```ts
export type Point = [x: number, y: number];

export interface SketchOptions {
  /** Point-jitter magnitude. Higher = rougher. Comes from a token. */
  roughness: number;
  /** How much straight edges bow outward. Comes from a token. */
  bowing: number;
  /** Deterministic seed. REQUIRED — see "Determinism" below. */
  seed: number;
  /** Fill strategy for closed shapes. Omit for no fill. */
  fillStyle?: 'hachure' | 'solid' | 'cross-hatch' | 'zigzag' | 'dots';
  /** Gap between fill lines / dots (px). Comes from a token. */
  hachureGap?: number;
  /** Hachure angle in degrees. Comes from a token. */
  hachureAngle?: number;
  /** Drop-shadow offset (px) for elevation. Omit/0 ⇒ no shadow. From a token. */
  elevation?: number;
}

export interface SketchDrawable {
  /** Outline strokes. Double-stroke is already baked in (2 paths per edge). */
  strokePaths: string[];
  /** Fill lines (hachure/cross-hatch/solid/zigzag/dots). Empty when no fill. */
  fillPaths: string[];
  /** Offset "drop shadow" strokes. Present only when `elevation > 0`. */
  shadowPaths?: string[];
}
```

### Public API

```ts
rectangle(x: number, y: number, w: number, h: number, o: SketchOptions): SketchDrawable
ellipse(x: number, y: number, w: number, h: number, o: SketchOptions): SketchDrawable
line(x1: number, y1: number, x2: number, y2: number, o: SketchOptions): SketchDrawable
polygon(points: Point[], o: SketchOptions): SketchDrawable
path(d: string, o: SketchOptions): SketchDrawable
```

`line` produces only `strokePaths` (no fill). The closed shapes produce
`fillPaths` only when a fill is requested by the renderer. `path` parses an SVG
`d` string (for icons and curved components), flattening curves/arcs to segments
and sketching each one; its closed subpaths fill together with the even-odd rule
so holes stay hollow, and **invalid `d` input degrades** to an empty drawable
(plus a `console.warn`) rather than throwing — use `linearizePath` for strict
parsing. Every shape except `line` emits `shadowPaths` when `o.elevation > 0`.

---

## Non-negotiable rules

### 1. No style values in this package

The core knows **geometry only**. It never sees or emits `color`, `stroke`,
`fill` color, or `strokeWidth`. Those are applied by the renderer, which reads
them from `@ghds/tokens` (web: `stroke="currentColor"` + token-driven `color`;
RN: `stroke={token}`). Keeping geometry and style separate is what lets one
engine serve light/dark themes and three platforms.

### 2. Sketch parameters are design values → tokens

`roughness`, `bowing`, `hachureGap`, `hachureAngle` are **design values**. Per
the root Code Quality Gate they must NOT be hardcoded. They live in
`@ghds/tokens` (e.g. `sys.sketch.roughness`, `comp.button.sketch.bowing`) and
are passed in via `SketchOptions` by the renderer. This package only defines the
*shape* of those options, never their *values*. If a sketch token does not yet
exist, add it to `@ghds/tokens` in a separate changeset first.

The fillers define clearly-marked algorithmic fallback constants
(`DEFAULT_HACHURE_GAP`/`DEFAULT_HACHURE_ANGLE`) so the engine and its tests run
standalone, but renderers **must** pass token-derived values in production — the
fallbacks are an engineering safety net, not the design.

### 3. Determinism — no `Math.random()`

Every random decision flows through the seeded PRNG in `src/prng.ts`, fed by
`SketchOptions.seed`. `Math.random()` is banned in this package. Reasons:

- **No wobble on re-render.** Same size + same seed ⇒ identical output, so a
  hover/focus re-render doesn't make the shape shimmer.
- **SSR / hydration safe.** Server and client produce byte-identical `d`
  strings — guaranteed for trig-free shapes (`line`/`rectangle`/axis-aligned
  `polygon`). Shapes that use `Math.cos`/`Math.sin` (`ellipse`, angled
  hachure/cross-hatch) are byte-identical only within the same JS engine, since
  ECMAScript does not require correctly-rounded trig.
- **Snapshot-testable.** Fixed seed ⇒ stable golden output.

The renderer generates one seed per component instance (stable across that
instance's lifetime) and only re-invokes the core when the measured size
changes.

### 4. TypeScript strict, no `any`

As per the root gate. The public API is fully typed; internal Op structures are
typed too.

---

## Source layout

```
src/
├── index.ts            # public API + type re-exports
├── types.ts            # SketchDrawable, SketchOptions, Op, Point
├── prng.ts             # seeded PRNG (Mulberry32)
├── geometry/
│   ├── offset.ts       # roughness-driven jitter helpers
│   ├── double-line.ts  # the core sketchy stroke (one edge → two paths) + polyline
│   ├── line.ts
│   ├── rectangle.ts
│   ├── ellipse.ts
│   ├── polygon.ts
│   ├── path.ts         # SVG `d` parser + curve/arc flattening → sketchy paths
│   └── elevation.ts    # offset drop-shadow IR (independent PRNG stream)
├── fillers/
│   ├── fill.ts         # fillStyle → filler dispatch
│   ├── hachure.ts      # scan-line polygon fill
│   ├── solid.ts
│   ├── cross-hatch.ts
│   ├── zigzag.ts       # triangle-wave scan-line fill
│   └── dots.ts         # stippled grid of small circles
└── serialize.ts        # Op[] → SVG path `d` string
```

---

## Commands

```bash
# Build
pnpm build --filter @ghds/sketch-core

# Test
pnpm turbo run test --filter @ghds/sketch-core

# Lint
pnpm lint --filter @ghds/sketch-core
```

---

## Testing

- **Determinism snapshots.** Fixed seed → assert the exact `d` strings. This is
  the primary guard; it locks the algorithm's output.
- **PRNG unit tests.** Same seed ⇒ same sequence; sequence is well-distributed.
- **Hachure unit tests.** Scan-line intersection produces the right segment
  count for known polygons (square, triangle, concave shape).
- No DOM is needed — these are pure functions, tested with Vitest in a node
  environment.

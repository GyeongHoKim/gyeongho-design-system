# @ghds/sketch-core — DESIGN

> The math behind the hand-drawn look. This is a spec to implement against, not
> shipped code. Pseudocode uses the IR types from [`AGENTS.md`](./AGENTS.md).

The whole aesthetic reduces to one idea:

> **Draw every honest line as two slightly-wrong curves, using controlled
> randomness seeded so it never changes between renders.**

Everything below is in service of that sentence.

---

## 0. Internal operation model

Geometry functions don't build strings directly. They emit an `Op[]`, and
`serialize.ts` turns that into a path `d` string. This keeps the math readable
and the string formatting in one place.

```ts
type Op =
  | { op: 'move';     data: [number, number] }                              // M
  | { op: 'lineTo';   data: [number, number] }                              // L
  | { op: 'bcurveTo'; data: [number, number, number, number, number, number] }; // C
```

`serialize(ops, precision = 2)`:

| Op         | Output                       |
| ---------- | ---------------------------- |
| `move`     | `M x y`                      |
| `lineTo`   | `L x y`                      |
| `bcurveTo` | `C x1 y1, x2 y2, x y`        |

Each emitted number is rounded to `precision` decimals to keep `d` strings
compact and snapshot-stable.

---

## 1. Seeded PRNG (`prng.ts`)

A tiny, fast, deterministic generator. **Mulberry32** — one 32-bit state word,
good distribution, trivial to port and reason about.

```ts
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296; // [0, 1)
  };
}
```

A `SketchDrawable` is produced by creating **one `rng` from `o.seed`** and
threading it through every geometry/filler call for that shape. Same seed ⇒ same
`rng` sequence ⇒ identical output.

---

## 2. Jitter helpers (`geometry/offset.ts`)

```ts
// symmetric jitter in [-x, +x], scaled by roughness
function offset(x: number, rng: () => number, roughness: number): number {
  return roughness * (rng() * 2 * x - x);
}
```

**Length-aware roughness gain.** Long lines should not look more chaotic than
short ones, so the effective roughness is damped as the edge gets longer:

```ts
function roughnessGain(length: number): number {
  if (length < 200) return 1;
  if (length > 500) return 0.4;
  return -0.0016668 * length + 1.233334; // linear ramp between
}
```

---

## 3. The core sketchy stroke (`geometry/double-line.ts`)

This is the heart. Given two endpoints, produce **two** perturbed curves. Each
curve is a single cubic Bézier whose two control points sit near the 1/3 and 2/3
marks of the segment, nudged off the true line by `offset()`. The two curves use
different random nudges, so they diverge slightly — the "drawn twice by hand"
effect. `bowing` adds a coherent sideways arc (perpendicular to the segment) on
top of the noise.

```ts
function singleStroke(x1, y1, x2, y2, o, rng, overlay): Op[] {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const g = roughnessGain(len);

  // base jitter; clamp so tiny segments don't explode
  let off = o.roughness * 2;
  if (off * off * 100 > len * len) off = len / 10;
  const half = off / 2;

  // coherent bow, perpendicular to the segment
  const diverge = 0.2 + rng() * 0.2;          // where the curve bends (~1/3..)
  let bowX = o.bowing * off * (y2 - y1) / 200;
  let bowY = o.bowing * off * (x1 - x2) / 200;
  bowX = offset(bowX || 1, rng, g);
  bowY = offset(bowY || 1, rng, g);

  // 'overlay' = the second pass: smaller jitter so the two strokes nearly meet
  const k = overlay ? half : off;
  const j = () => offset(k, rng, g);

  return [
    { op: 'move', data: [x1 + j(), y1 + j()] },
    { op: 'bcurveTo', data: [
        bowX + x1 + (x2 - x1) * diverge + j(),
        bowY + y1 + (y2 - y1) * diverge + j(),
        bowX + x1 + (x2 - x1) * (1 + diverge) + j(),
        bowY + y1 + (y2 - y1) * (1 + diverge) + j(),
        x2 + j(), y2 + j(),
    ] },
  ];
}

// public: one edge → two stroke paths' worth of ops
export function doubleLine(x1, y1, x2, y2, o, rng): Op[][] {
  return [
    singleStroke(x1, y1, x2, y2, o, rng, false),
    singleStroke(x1, y1, x2, y2, o, rng, true),
  ];
}
```

Each inner `Op[]` is serialized to its own `d` string, so one edge yields two
entries in `strokePaths`. (Renderers draw them with the same stroke color/width;
the overlap is the whole point.)

---

## 4. Closed shapes

### Rectangle (`geometry/rectangle.ts`)

A rectangle is four edges, each run through `doubleLine`:

```
(x,y) → (x+w,y) → (x+w,y+h) → (x,y+h) → (x,y)
```

`strokePaths` = 8 paths (4 edges × 2 strokes). If a fill is requested, the same
four corners form the polygon handed to the filler (§5). In the implementation
`rectangle` delegates to `polygon` with these four corners.

### Polygon (`geometry/polygon.ts`)

Same as rectangle but for an arbitrary closed point list: `doubleLine` each
consecutive pair, closing back to the first point.

### Ellipse (`geometry/ellipse.ts`)

Sample the ellipse at `N` steps (`N = max(floor(perimeter / 8), 9)`, perimeter
via Ramanujan I), **jitter each sample point** with `offset()`, then connect the
samples with a closed smooth curve. Two passes (with the second tighter, like
`overlay`) give the double-stroke. Smooth connection = Catmull-Rom through the
jittered points converted to cubic Béziers:

```ts
// Catmull-Rom (tension 0) → Bézier control points for p1→p2
c1 = p1 + (p2 - p0) / 6
c2 = p2 - (p3 - p1) / 6
bcurveTo(c1, c2, p2)
```

Wrap indices so the curve closes. The fill polygon for an ellipse is the
*un-jittered* sample ring (so hachure stays inside the visible outline).

---

## 5. Hachure fill (`fillers/hachure.ts`)

Closed shapes are filled with parallel "pencil" strokes, not solid paint. This
is a classic **even-odd scan-line polygon fill**, rotated to the desired angle.

```
1. Rotate every polygon vertex by -hachureAngle about the centroid,
   so the hachure lines become horizontal.
2. yMin, yMax = vertical extent of the rotated polygon.
3. for y = yMin + gap/2; y < yMax; y += hachureGap:
     xs = x-coords where edge segments cross this horizontal line   // intersections
     sort xs ascending
     pair them: (xs[0],xs[1]), (xs[2],xs[3]), ...                   // inside spans
     each pair (xa, xb) → a horizontal segment at height y
4. Rotate every segment back by +hachureAngle.
5. Draw each segment with doubleLine(...) so the fill is sketchy too.
```

Edge-crossing test for a horizontal scan line `y` against edge `(p, q)`:

```ts
if ((p.y <= y && q.y > y) || (q.y <= y && p.y > y)) {   // strictly one above
  const t = (y - p.y) / (q.y - p.y);
  const x = p.x + t * (q.x - p.x);
  xs.push(x);
}
```

The half-open comparison (`<=` on one side, `>` on the other) is what makes
vertices and horizontal edges behave — it avoids double-counting at shared
endpoints. All hachure segments land in `fillPaths`.

### Cross-hatch (`fillers/cross-hatch.ts`)

Run hachure twice: once at `hachureAngle`, once at `hachureAngle + 90`. Concat
the segment sets.

### Solid (`fillers/solid.ts`)

A single `fillPaths` entry: the polygon outline as one closed (lightly jittered)
path. The renderer fills it with a token color and no stroke. Used when a shape
needs a flat fill rather than the pencil look.

---

## 6. Putting one shape together

```ts
export function polygon(points, o): SketchDrawable {
  const rng = mulberry32(o.seed);

  const strokePaths: string[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length];
    for (const ops of doubleLine(a[0], a[1], b[0], b[1], o, rng)) {
      strokePaths.push(serialize(ops));
    }
  }

  // Stroke first, then fill — both share the one rng so the shape is stable.
  const fillPaths = fill(points, o, rng);
  return { strokePaths, fillPaths };
}
```

Note the **single `rng`** created once from `o.seed` and shared by the outline
and the fill — that is what makes the whole shape reproducible as a unit. `fill`
returns `[]` and consumes no randomness when no `fillStyle` is set, so unfilled
shapes stay byte-stable.

---

## 7. Decisions (resolved during review)

1. **`curveStepCount` for ellipse** — scaled with perimeter (Ramanujan I),
   floored at 9, so small circles stay round and large ones stay smooth.
2. **`precision`** — fixed at `2`. Changing it churns every golden snapshot, so
   it is a deliberate constant, not a knob.
3. **Token names** — `sys.sketch.{roughness,bowing,hachureGap,hachureAngle}` at
   the `sys` tier, with optional `comp.*` overrides per component. The engine
   only defines the *shape* of these options; values come from `@ghds/tokens`.
4. **Solid-fill jitter** — the solid outline is lightly jittered (hand-cut paper)
   for visual consistency with the rest of the system.

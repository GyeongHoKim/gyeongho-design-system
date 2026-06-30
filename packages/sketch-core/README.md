# @ghds/sketch-core

Platform-agnostic hand-drawn geometry engine for the GH Design System. Instead
of producing SVG DOM nodes, it returns **data** — SVG path `d` strings — so the
same engine powers `@ghds/react`, `@ghds/web-components`, and
`@ghds/react-native` without modification. Zero runtime dependencies.

## How it works

```
SketchOptions  →  sketch-core  →  SketchDrawable
(roughness,          (PRNG           { strokePaths: string[]
 bowing, seed, …)    geometry)         fillPaths:   string[] }
```

The engine is deliberately color-agnostic. Callers supply a seed and dimension
parameters; renderers inject colors and stroke widths from `@ghds/tokens`.

## Install

```bash
pnpm add @ghds/sketch-core
```

## API

```ts
import { rectangle, ellipse, line, polygon, path, arc } from '@ghds/sketch-core';

const opts = { roughness: 1.2, bowing: 1, seed: 42 };

const rect = rectangle({ x: 0, y: 0, width: 120, height: 40 }, opts);
// → { strokePaths: ['M …'], fillPaths: ['M …'] }

const circle = ellipse({ cx: 60, cy: 60, rx: 50, ry: 50 }, opts);
const seg    = line({ x1: 0, y1: 0, x2: 100, y2: 0 }, opts);
const poly   = polygon([{ x: 0, y: 0 }, { x: 50, y: 80 }, { x: 100, y: 0 }], opts);
const curved = path('M 10 80 C 40 10, 65 10, 95 80', opts);
```

### `SketchOptions`

| Field | Type | Description |
|---|---|---|
| `roughness` | `number` | Line wobble (0 = straight, 3 = very rough) |
| `bowing` | `number` | Curve bow amount (0–6) |
| `seed` | `number` | PRNG seed — fix once per component instance to avoid reshuffling on re-render |
| `fillStyle` | `'hachure' \| 'cross-hatch' \| 'solid' \| 'zigzag' \| 'dots'` | Fill pattern |
| `hachureGap` | `number` | Gap between hachure lines (px) |
| `hachureAngle` | `number` | Hachure line angle (degrees) |

### `SketchDrawable`

```ts
interface SketchDrawable {
  strokePaths: string[]; // outline path `d` strings
  fillPaths:   string[]; // fill path `d` strings
}
```

## Scripts

```bash
pnpm build   # tsc → dist/
pnpm test    # vitest
pnpm lint    # biome
```

# @ghds/react

Hand-drawn ("sketchy") React component library for the GH Design System. Visuals
are generated from [`@ghds/sketch-core`](../sketch-core) geometry and every
design value (color, spacing, radius, typography, sketch parameter) is sourced
from [`@ghds/tokens`](../tokens). Headless behaviour/accessibility comes from
Radix primitives; the visual skin is the sketch engine.

## Install

```bash
pnpm add @ghds/react @ghds/tokens
```

`react` and `react-dom` (>=18) are peer dependencies.

## Usage

```tsx
import { Button } from '@ghds/react/button';
import { Card } from '@ghds/react/card';
import { Input } from '@ghds/react/input';
// Load the token CSS variables once at your app root (enables theming):
import '@ghds/tokens/css';

export function Example() {
  return (
    <Card>
      <Input label="Email" placeholder="you@example.com" />
      <Button variant="primary" onClick={() => alert('hi')}>
        Save
      </Button>
    </Card>
  );
}
```

## Dark mode

Components read their colors through CSS custom properties (e.g.
`var(--comp-button-bg-primary-default)`) defined by `@ghds/tokens/css`. That
stylesheet emits a light `:root` set, a `[data-theme="dark"]` override, and a
`prefers-color-scheme: dark` fallback. To enable dark mode:

1. Import the stylesheet once: `import '@ghds/tokens/css';`
2. Either rely on the OS preference automatically, or set the attribute on any
   ancestor to force a scheme:

```html
<html data-theme="dark">   <!-- force dark -->
<div data-theme="light">    <!-- force light subtree -->
```

No JS re-render is needed — switching the attribute re-themes the live SVG
because the path colors are `var(--…)` references. (If the stylesheet is not
loaded, each token's light value is used as the `var()` fallback.)

## The `useSketch` hook

`useSketch` powers every component and is exported for building your own:

- Measures the host element with a `ResizeObserver`.
- Fixes a random PRNG `seed` **once per instance** (`useMemo`), so hover/focus
  re-renders never reshuffle the geometry — it regenerates only when the size or
  a sketch parameter changes.
- Calls the colorless `@ghds/sketch-core` engine and returns the
  `SketchDrawable` IR plus a `ref` and the measured `size`.
- Pair it with `<SketchSurface>` to paint the IR; pass token-derived colors and
  stroke widths (the hook/engine never touch color).

```tsx
const { ref, drawable, size } = useSketch<HTMLDivElement>({
  fillStyle: 'solid',
  roughness: tokens.sys.sketch.roughness,
  bowing: tokens.sys.sketch.bowing,
});
```

## Scripts

```bash
pnpm build   # tsc → dist
pnpm test    # vitest (jsdom) unit + interaction tests
pnpm lint    # biome
```

Storybook (stories are co-located in `src/components/*.stories.tsx`) lives in
[`apps/storybook-react`](../../apps/storybook-react): `pnpm --filter
storybook-react dev`.

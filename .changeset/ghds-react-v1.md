---
'@ghds/react': minor
'@ghds/tokens': minor
---

feat(react): @ghds/react v1 — sketchy Button, Card, and Input

Introduce the `@ghds/react` component library. Visuals are rendered from
`@ghds/sketch-core` geometry via a new `useSketch` hook (ResizeObserver
measurement + a per-instance fixed PRNG seed so re-renders never reshuffle the
hand-drawn look) and a `SketchSurface` renderer. Headless behaviour and
accessibility come from Radix (`Slot`/`Slottable` for Button `asChild`, `Label`
for Input).

All design values are sourced from `@ghds/tokens`: colors are consumed as CSS
custom properties so `[data-theme="dark"]` / `prefers-color-scheme` re-theme
components live, while sketch parameters and dimensions come from the token
object.

Tokens: extend `comp.button` (neutral variant, stroke + focus colors) and add
the `comp.card` and `comp.input` token sets (referencing `sys` only).

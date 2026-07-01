# @ghds/icons — AGENTS.md

> Package-specific guide. See the [root `AGENTS.md`](../../AGENTS.md) for the
> project overview and the project-wide **Code Quality Gate**.

Platform-agnostic **icon path data** for GHDS — the single source of truth for
iconography. Mirrors the `@ghds/sketch-core` philosophy: **we ship data, not
components.** Each icon is an SVG path `d` string; every renderer
(`@ghds/react`, `@ghds/web-components`, `@ghds/react-native`) consumes the same
string, runs it through `@ghds/sketch-core`'s `path()`, and paints it with
token-driven color. Zero runtime dependencies, no DOM/framework imports.

## Rules

- **Geometry only.** Path strings carry no color, stroke width, or fill — those
  come from `@ghds/tokens` in the renderer (`sys.color.icon`, size tokens). Never
  put a design value in this package.
- **24×24 grid.** Every path is authored on the `ICON_VIEWBOX` (24) grid so all
  icons share one coordinate space. Prefer simple, stroke-based outlines (open
  paths); curves/arcs are fine — sketch-core flattens them.
- **Stable look, no `Math.random()`.** `iconSeed(name)` derives a deterministic
  PRNG seed from the name, so an icon sketches identically everywhere (re-render,
  SSR, snapshots, all platforms).
- **Additive by default.** Adding an icon is a `minor`; renaming/removing one is
  a breaking change — coordinate with the renderers and add a changeset.

## Adding an icon

1. Add `'<name>': '<d string>'` to `src/paths.ts` (24×24 grid, kebab-case name).
2. `pnpm --filter @ghds/icons test` — the suite checks every path is well-formed.
3. Add a changeset (`minor`).

## Commands

```bash
pnpm build --filter @ghds/icons
pnpm --filter @ghds/icons test
pnpm lint --filter @ghds/icons
```

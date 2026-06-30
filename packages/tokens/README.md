# @ghds/tokens

Single source of truth for all design values in the GH Design System. Tokens are
defined in [W3C DTCG](https://design-tokens.github.io/community-group/format/)
JSON and compiled by [Style Dictionary](https://amzn.github.io/style-dictionary/)
into CSS custom properties, TypeScript objects, and React Native theme objects.

## Token tiers

```
ref   →  sys   →  comp
(raw)    (role)   (component)
```

- **ref** — raw values with no semantic meaning (`ref.color.blue.500`).
- **sys** — role-based aliases consumed by components (`sys.color.bg.primary`).
- **comp** — per-component overrides when a sys token is too coarse.

Components must only reference `sys` or `comp` — never `ref` directly.

## Install

```bash
pnpm add @ghds/tokens
```

## Usage

### CSS custom properties (web)

```ts
import '@ghds/tokens/css'; // defines --sys-* / --comp-* on :root
```

```css
.button {
  background-color: var(--comp-button-bg-primary-default);
  color: var(--comp-button-text-primary-default);
}
```

### TypeScript (web / Node)

```ts
import { tokens } from '@ghds/tokens';

const bg = tokens.sys.color.bg.primary;
const radius = tokens.sys.radius.md;
```

### React Native

```ts
import { lightTheme, darkTheme } from '@ghds/tokens/rn';

// Pass to @shopify/restyle ThemeProvider
<ThemeProvider theme={lightTheme}>…</ThemeProvider>
```

## Dark mode (CSS)

`@ghds/tokens/css` emits a light `:root` set and a `[data-theme="dark"]`
override (plus `@media (prefers-color-scheme: dark)` fallback):

```ts
document.documentElement.setAttribute('data-theme', 'dark');  // force dark
document.documentElement.removeAttribute('data-theme');        // follow OS
```

## Scripts

```bash
pnpm build   # run Style Dictionary → dist/
pnpm test    # vitest token-validation tests
pnpm lint    # biome
```

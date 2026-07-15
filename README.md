# GHDS — GH Design System

A cross-platform design system monorepo for GyeongHo

## Packages

| Package | Description |
| --- | --- |
| [`@ghds/tokens`](./packages/tokens) | The single source of truth for every design value (colors, spacing, typography, radii, shadows, etc.). 3-tier token architecture (`comp → sys → ref`). |
| [`@ghds/react`](./packages/react) | React component library |
| [`@ghds/web-components`](./packages/web-components) | Framework-agnostic web components built on Lit |
| [`@ghds/react-native`](./packages/react-native) | React Native component library |
| [`@ghds/tsconfig`](./packages/tsconfig) | Shared TypeScript configuration presets |

The `apps/` directory hosts documentation and demo apps (Storybook, etc.).

## Prerequisites

- Node.js `>=24`
- pnpm `>=11` (`packageManager`: `pnpm@11.9.0`)

Using corepack will automatically activate the correct pnpm version:

```bash
corepack enable
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Build all packages (Turborepo resolves the dependency order automatically)
pnpm build

# Development mode (watch)
pnpm dev
```

## Common Commands

| Command | Description |
| --- | --- |
| `pnpm build` | Build all packages |
| `pnpm dev` | Development in watch mode |
| `pnpm test` | Run all tests |
| `pnpm test:storybook` | Storybook interaction tests |
| `pnpm lint` | Biome lint check |
| `pnpm format` | Apply Biome formatting |
| `pnpm check` | Biome lint + format auto-fix |
| `pnpm clean` | Clean build artifacts |

To target a single package, use Turborepo filters:

```bash
pnpm build --filter @ghds/react
pnpm test --filter @ghds/tokens
```

## Fonts

GHDS font-family stacks are optimized for **English and Korean** and live in `@ghds/tokens`
(`ref.fontFamily`). Stacks are ordered for per-glyph fallback — Latin faces render Latin glyphs,
Korean faces render Korean glyphs, with no locale switching. Loading the actual web-font files is
the consumer's responsibility, done via [Fontsource](https://fontsource.org/) (self-hosted, no CDN).

```bash
pnpm add @fontsource-variable/nunito-sans @fontsource/pretendard @fontsource/gochi-hand @fontsource/gaegu
```

```ts
import '@ghds/tokens/css';
import '@fontsource/gochi-hand/400.css';
import '@fontsource/gaegu/400.css';
import '@fontsource-variable/nunito-sans/wght.css';
import '@fontsource/pretendard/400.css';
import '@fontsource/pretendard/500.css';
import '@fontsource/pretendard/700.css';
```

| Face | Role | Package |
| --- | --- | --- |
| Gochi Hand | Display (Latin) | `@fontsource/gochi-hand` |
| Gaegu | Display (Korean) | `@fontsource/gaegu` |
| Nunito Sans Variable | Body/UI (Latin) | `@fontsource-variable/nunito-sans` |
| Pretendard | Body/UI (Korean) | `@fontsource/pretendard` |

See the [Fonts guide](https://gyeonghokim.github.io/gyeongho-design-system/fonts/) on the website
for the full rationale and weight/payload guidance.

## License

[MIT](./LICENSE)

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

## License

[MIT](./LICENSE)

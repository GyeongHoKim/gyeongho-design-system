# AGENTS.md

> This is the **root** guide. It covers the project at a glance and the
> **Code Quality Gate** that applies to every package. Package-specific
> details live in each package's own `AGENTS.md` (see the table below).

## Project Overview

GHDS (GH Design System) is a cross-platform design system monorepo. It provides shared design tokens, React components, framework-agnostic web components, and React Native components.

**Monorepo structure:**

```
ghds/
├── packages/
│   ├── tokens/          # @ghds/tokens — single source of truth for all design values
│   ├── react/           # @ghds/react — React component library
│   ├── web-components/  # @ghds/web-components — framework-agnostic web components
│   └── react-native/    # @ghds/react-native — React Native component library
├── apps/                # Documentation and demo apps (Storybook)
├── turbo.json           # Turborepo pipeline config
├── pnpm-workspace.yaml  # pnpm workspace definition
└── .changeset/          # Changesets versioning configuration
```

**Tech stack:** pnpm (workspaces), Turborepo (build orchestration), Changesets (versioning).

---

## Package Guides

Each package has its own `AGENTS.md` with the conventions, commands, and patterns specific to it. Read the relevant one before working inside a package.

| Package | Guide | What it covers |
| --- | --- | --- |
| `@ghds/tokens` | [`packages/tokens/AGENTS.md`](packages/tokens/AGENTS.md) | 3-tier token architecture, naming, adding tokens, validation |
| `@ghds/react` | [`packages/react/AGENTS.md`](packages/react/AGENTS.md) | React component authoring, testing, Storybook |
| `@ghds/web-components` | [`packages/web-components/AGENTS.md`](packages/web-components/AGENTS.md) | Lit components, custom element conventions |
| `@ghds/react-native` | [`packages/react-native/AGENTS.md`](packages/react-native/AGENTS.md) | RN component authoring, Metro/pnpm setup |

---

## Setup Commands

```bash
# Install all dependencies
pnpm install

# Build all packages (turborepo orchestrates dependency order)
pnpm build

# Run all tests
pnpm test

# Run linting across all packages
pnpm lint

# Create a changeset (versioning)
pnpm changeset
```

Per-package build/dev/test commands live in each package's `AGENTS.md`.

---

## Code Quality Gate

These rules are **non-negotiable** and apply to every package. A change that
violates any of them is not ready to merge.

### 1. Tokens are the single source of truth

`@ghds/tokens` owns every design value in the system. **NEVER hardcode design values** (colors, spacing, typography, radii, shadows, durations, etc.) in any component. Always import from `@ghds/tokens`.

```typescript
// CORRECT
import { tokens } from '@ghds/tokens';
const bg = tokens.sys.color.bg.primary;

// WRONG — never do this
const bg = '#1a1a2e';
const padding = '16px';
```

### 2. Respect the token tier boundaries

Tokens flow `comp → sys → ref` and consumers must respect those boundaries:

- **Components** MUST only reference `sys` or `comp` tokens — never `ref` directly.
- `comp` tokens reference only `sys`; `sys` tokens reference only `ref`.
- No circular references; every alias must resolve.

The full tier model is documented in [`packages/tokens/AGENTS.md`](packages/tokens/AGENTS.md). If a token you need does not exist, add it at the correct tier (in a separate changeset) **before** building UI that consumes it.

### 3. TypeScript strict mode, no `any`

TypeScript strict mode is enforced across all packages. Never use `any` as a shortcut. All public props and APIs must have explicit types.

### 4. Tests and lint must pass

`pnpm test` and `pnpm lint` must pass before a change is ready. Components must have the test coverage required by their package guide (unit + visual regression where applicable).

### 5. Accessibility

Color/background token pairings must meet WCAG 2.1 AA contrast minimums (4.5:1 normal text, 3:1 large text). This is validated in the tokens package.


## Additional Guidelines

- Keep `README.md` focused on human contributors (getting started, contributing). Keep agent-specific instructions in `AGENTS.md` files.
- When in doubt about a design value, check `@ghds/tokens` first. If the token does not exist, add it at the appropriate tier before building any UI.

# @ghds/react — AGENTS.md

> Package-specific guide. See the [root `AGENTS.md`](../../AGENTS.md) for the
> project overview and the project-wide **Code Quality Gate**.

React component library for GHDS. All components consume design values from `@ghds/tokens` — never hardcode design values (see the root Code Quality Gate).

- Components live in `src/components/`.
- Each component has a co-located test file (`ComponentName.test.tsx`).
- Storybook stories live in `apps/storybook-react/stories/` (not colocated with `src/`) — same convention as `@ghds/react-native` and `@ghds/web-components`. Import the component from `@ghds/react`, not a relative path.
- Use TypeScript strict mode. All props must have explicit types.

---

## Commands

```bash
# Dev server (hot reload)
cd packages/react && pnpm dev

# Build
pnpm build --filter @ghds/react

# Test
pnpm turbo run test --filter @ghds/react

# Lint
pnpm lint --filter @ghds/react

# Storybook (lives under apps/)
cd apps/storybook-react && pnpm dev
```

---

## Creating Components

Import tokens and reference `sys` or `comp` tier values. Never hardcode.

```typescript
import { tokens } from '@ghds/tokens';
import { styled } from 'styled-components'; // or CSS Modules, Tailwind, etc.

const Button = styled.button`
  background-color: ${tokens.sys.color.bg.primary};
  color: ${tokens.sys.color.text.onPrimary};
  padding: ${tokens.sys.spacing.component.md} ${tokens.sys.spacing.component.lg};
  border-radius: ${tokens.sys.radius.md};
  font-family: ${tokens.sys.typography.family.primary};
  font-size: ${tokens.sys.typography.size.md};

  &:hover {
    background-color: ${tokens.sys.color.bg.primary.hover};
  }
`;
```

Before starting work on a component, confirm the required tokens exist in `@ghds/tokens`. If they are missing, add them in a separate changeset before the component changeset.

---

## Testing

### Unit and Integration Tests

```bash
pnpm turbo run test --filter @ghds/react
```

### Visual Regression Tests (Storybook)

Visual regression tests live in Storybook and capture component screenshots for comparison.

```bash
pnpm test:storybook
```

- Each component must have visual regression stories covering all states (default, hover, focus, active, disabled, loading, error).
- Test across light and dark color schemes.
- Test at multiple viewport sizes for responsive components.

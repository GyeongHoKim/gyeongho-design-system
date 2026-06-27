# @ghds/react-native — AGENTS.md

> Package-specific guide. See the [root `AGENTS.md`](../../AGENTS.md) for the
> project overview and the project-wide **Code Quality Gate**.

React Native component library for GHDS. All components consume design values from `@ghds/tokens` — never hardcode design values (see the root Code Quality Gate).

- Components live in `src/components/`.
- Use the `node-linker=hoisted` pnpm setting (configured in `.npmrc`) for React Native Metro bundler compatibility.
- Use TypeScript strict mode. All props must have explicit types.

---

## Commands

```bash
# Build
pnpm build --filter @ghds/react-native

# Test
pnpm turbo run test --filter @ghds/react-native

# Lint
pnpm lint --filter @ghds/react-native

# Storybook (lives under apps/)
cd apps/storybook-native && pnpm dev
```

---

## Creating Components

The tokens package outputs platform-agnostic JSON; use the same import paths as the other platforms and reference `sys` or `comp` tier values only.

```typescript
import { tokens } from '@ghds/tokens';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  button: {
    backgroundColor: tokens.sys.color.bg.primary,
    paddingHorizontal: tokens.sys.spacing.component.md,
  },
});
```

Before starting work on a component, confirm the required tokens exist in `@ghds/tokens`. If they are missing, add them in a separate changeset before the component changeset.

---

## Testing

- Each component must have unit tests covering all interactive states.
- Test on **both iOS and Android** simulators before marking a PR as ready.
- Test across light and dark color schemes.

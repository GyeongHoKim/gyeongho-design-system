# @ghds/web-components — AGENTS.md

> Package-specific guide. See the [root `AGENTS.md`](../../AGENTS.md) for the
> project overview and the project-wide **Code Quality Gate**.

Framework-agnostic web components for GHDS, authored with [Lit](https://lit.dev/). All components consume design values from `@ghds/tokens` — never hardcode design values (see the root Code Quality Gate).

- Components live in `src/components/`.
- Use Lit for component authoring.
- Each component exports a custom element registered with a `gh-` prefix (e.g., `<gh-button>`).
- Use TypeScript strict mode. All public properties must have explicit types.

---

## Commands

```bash
# Build
pnpm build --filter @ghds/web-components

# Test
pnpm turbo run test --filter @ghds/web-components

# Lint
pnpm lint --filter @ghds/web-components
```

---

## Creating Components

Web components consume the same tokens as the rest of the system. Use CSS custom properties or the tokens package directly, referencing `sys` or `comp` tier values only.

```typescript
import { LitElement, html, css } from 'lit';
import { tokens } from '@ghds/tokens';

class GhButton extends LitElement {
  static styles = css`
    :host {
      --bg: ${tokens.sys.color.bg.primary};
      background-color: var(--bg);
    }
  `;
}
```

Before starting work on a component, confirm the required tokens exist in `@ghds/tokens`. If they are missing, add them in a separate changeset before the component changeset.

---

## Testing

- Each component must have tests covering all interactive states (default, hover, focus, active, disabled).
- Verify the custom element registers and renders in a DOM environment.
- Test across light and dark color schemes.

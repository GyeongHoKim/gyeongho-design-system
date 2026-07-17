# @ghds/web-components — AGENTS.md

> Package-specific guide. See the [root `AGENTS.md`](../../AGENTS.md) for the
> project overview and the project-wide **Code Quality Gate**.

Framework-agnostic web components for GHDS, authored with [Lit](https://lit.dev/). All components consume design values from `@ghds/tokens` — never hardcode design values (see the root Code Quality Gate).

- Components live in `src/components/`.
- Use Lit for component authoring.
- Each component exports a custom element registered with a `gh-` prefix (e.g., `<gh-button>`).
- **No barrel export.** There is no `src/index.ts` and no `"."` entry in `package.json`'s `exports` — every component is its own subpath, matching its kebab-case filename/tag name (`button.ts` / `<gh-button>` → `@ghds/web-components/button`). Consumers import exactly the elements they render, e.g. `import '@ghds/web-components/button';` — never a blanket `import '@ghds/web-components';`. Adding a new component means adding a new `tsdown.config.ts` entry + a new `exports` map entry, not touching a shared barrel file.
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

### Boolean toggle state — `ElementInternals.states`

Form-associated components with genuine boolean toggle state (`gh-checkbox`, `gh-radio`,
`gh-switch`) expose it two ways: a reflected boolean attribute (`checked`, `indeterminate`) for
simple attribute-selector styling, **and** `internals.states` (`CustomStateSet`) for the
spec-correct `:state(checked)`/`:state(indeterminate)` CSS pseudo-class hook consumers can style
by without depending on the reflected attribute. Guard every `internals.states` call with
optional chaining (`this.internals.states?.add(...)`) — the API isn't implemented in every
environment yet (e.g. jsdom, used by this package's own tests).

---

## Testing

- Each component must have tests covering all interactive states (default, hover, focus, active, disabled).
- Verify the custom element registers and renders in a DOM environment.
- Test across light and dark color schemes.

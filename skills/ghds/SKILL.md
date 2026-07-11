---
name: ghds
description: Generate correct, accessible UI code that consumes the GHDS design system (@ghds/react, @ghds/web-components, @ghds/react-native, @ghds/tokens). Use whenever writing or reviewing code that imports from any @ghds/* package.
license: MIT
---

# GHDS

GHDS (GH Design System) is a token-driven, cross-platform design system shipped as four npm packages: `@ghds/react`, `@ghds/web-components` (framework-agnostic Lit custom elements), `@ghds/react-native`, and `@ghds/tokens` (the shared design values all three consume). The same visual language is implemented three times — once per platform — so always check which platform you're generating code for before reaching for a prop name.

Core rule, before anything else: **consume `sys.*`/`comp.*` design tokens, never hardcode colors/spacing/typography and never reference `ref.*` tokens directly.** See [rules/tokens.md](rules/tokens.md).

## Installation

```bash
# React
pnpm add @ghds/react @ghds/tokens

# Framework-agnostic (Lit web components)
pnpm add @ghds/web-components @ghds/tokens

# React Native (inferred — not published on the getting-started page, but the
# package is real and used throughout the pattern docs)
pnpm add @ghds/react-native @ghds/tokens
```

Every React/Web Components value reads from CSS custom properties — import the token stylesheet once, at your app's entry point:

```ts
import '@ghds/tokens/css';
```

React Native has no stylesheet to import; tokens resolve as a plain JS object instead:

```tsx
import { tokens } from '@ghds/tokens';
// tokens.sys.color.bg.primary, tokens.sys.spacing.component.md, ...
```

## Critical Rules

Each rule below is enforced — follow the link for the full Incorrect/Correct code pairs.

- **[Token usage](rules/tokens.md)** — always consume `sys.*`/`comp.*` tokens, never `ref.*` directly or a hardcoded value.
- **[Accessibility](rules/accessibility.md)** — ARIA patterns, keyboard interaction, and focus management per component.
- **[Composition](rules/composition.md)** — `FormField` wraps exactly one control; choosing between Toast/Alert/Modal and Skeleton/Spinner; debounce search inputs.
- **[Platform differences](rules/platform-differences.md)** — prop and event naming diverges across React / Web Components / React Native. Never port a prop name from one platform to another without checking this file.

## Key Patterns

```tsx
// Token CSS import — once, at app entry
import '@ghds/tokens/css';
```

```tsx
// FormField composition — wraps exactly one control, wires label/error/aria
<FormField label="Email" helperText="We'll never share this." error={emailError}>
  <Input type="email" />
</FormField>
```

```
// Feedback selection at a glance (full decision tree in rules/composition.md)
User-initiated action, stays on screen        → Alert (inline, persistent)
User-initiated action, then navigates away    → Toast (auto-dismiss)
System event needing a decision               → Modal (interrupts, traps focus)
System event, informational only              → Toast (auto-dismiss)
```

```tsx
// React Native change events — NOT onChange (see rules/platform-differences.md)
<Checkbox onCheckedChange={(checked) => setValue(checked)} />
<Input onChangeText={(text) => setValue(text)} />
```

## Component Selection

| Need | Component | Notes |
|---|---|---|
| Clickable action trigger | `Button` | `variant`: `primary`/`danger`/`neutral` on React & Web Components; React Native omits `neutral` |
| Single-line text entry | `Input` | Pair with `FormField` for label/helper/error |
| Multi-line text entry | `Textarea` | Pair with `FormField` |
| Dropdown selection | `Select` | Pair with `FormField` |
| Binary toggle (form-style) | `Checkbox` | React Native: `onCheckedChange`, not `onChange` |
| Binary toggle (on/off setting) | `Switch` | React Native: `onCheckedChange`, not `onChange` |
| Single choice from a set | `Radio` | Group multiple with the corresponding group component |
| Numeric range input | `Slider` | No arrow-key stepping on React Native |
| Label + helper + error wrapper | `FormField` | Wraps exactly one control — see [composition.md](rules/composition.md) |
| Blocking dialog requiring a decision | `Modal` | `title` (React/React Native) vs `heading` (Web Components) |
| Transient, non-blocking notification | `Toast` | Auto-dismiss ~5s |
| Persistent inline status message | `Alert` | `role="status"` default, `role="alert"` for `danger` |
| Contextual popup hint | `Tooltip` | `role="tooltip"`, `aria-describedby` |
| Dropdown/contextual action list | `Menu` | Arrow-key navigation, Escape dismiss |
| First-paint loading placeholder | `Skeleton` | Use when nothing is on screen yet |
| Subsequent/inline loading indicator | `Spinner` | Use when existing content stays visible |
| Multi-step or grouped navigation | `Tabs` | No roving-tabindex arrow nav on React Native |
| Sequential step progress | `Progress` | Combine with `Tabs` for multi-step forms |
| Tabular data display | `Table` | `sort`/`onSort` props for sortable columns |
| Paged navigation control | `Pagination` | — |
| Status/category label | `Badge` | Combine with a dismiss action for filter chips |
| User identity image | `Avatar` | — |
| Page/section location trail | `Breadcrumb` | — |
| Card-style content container | `Card` | React: no default role, you supply one |
| Collapsible sections | `Accordion` | — |

## Reference

- [rules/tokens.md](rules/tokens.md) — token consumption rules
- [rules/accessibility.md](rules/accessibility.md) — ARIA, keyboard, focus management
- [rules/composition.md](rules/composition.md) — component composition patterns
- [rules/platform-differences.md](rules/platform-differences.md) — React / Web Components / React Native API differences
- Full per-component prop tables and live demos: https://gyeonghokim.github.io/gyeongho-design-system/components/

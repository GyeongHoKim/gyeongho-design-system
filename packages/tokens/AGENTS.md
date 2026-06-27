# @ghds/tokens — AGENTS.md

> Package-specific guide. See the [root `AGENTS.md`](../../AGENTS.md) for the
> project overview and the project-wide **Code Quality Gate**.

`@ghds/tokens` is the **single source of truth** for every design value in GHDS. Every color, spacing value, typography scale, radius, shadow, and animation duration lives here and flows outward to all component libraries.

- Source files in `src/`, organized by tier: `ref/`, `sys/`, `comp/`.
- Build output goes to `dist/` in a platform-agnostic JSON format.
- Token files use the W3C DTCG format (`$value`, `$type`, `$description`).

---

## Commands

```bash
# Build tokens
pnpm build --filter @ghds/tokens
# or from this directory:
cd packages/tokens && pnpm build

# Run the token validation suite
pnpm test --filter @ghds/tokens

# Lint
pnpm lint --filter @ghds/tokens
```

---

## Token 3-Tier Architecture

Tokens follow the W3C Design Tokens Community Group (DTCG) format with exactly 3 tiers.

```
Tier 3 (comp) → Tier 2 (sys) → Tier 1 (ref)
     ↑              ↑              ↑
 Components    Semantic        Pure
   consume       roles         values
```

### Tier 1: `ref` (Reference Tokens)

Pure, primitive design values with **no semantic meaning** — the raw atoms of the design language. They describe what a value **is**, not how it should be used.

```
ref.palette.blue.500    → #0000FF
ref.palette.gray.100    → #F5F5F5
ref.spacing.4           → 16px (4 * 4px base)
ref.fontSize.lg         → 18px
ref.radius.md           → 8px
```

### Tier 2: `sys` (System/Semantic Tokens)

Semantic roles that reference Tier 1 values. They describe what a value **means** in context.

```
sys.color.bg.primary       → {ref.palette.blue.500}
sys.color.text.primary     → {ref.palette.gray.900}
sys.color.text.onPrimary   → {ref.palette.white}
sys.spacing.component.md   → {ref.spacing.4}
sys.typography.body        → {ref.fontSize.md} / {ref.lineHeight.normal}
```

### Tier 3: `comp` (Component Tokens)

Component-specific tokens that reference Tier 2 values. Owned by individual components.

```
comp.button.bg.primary         → {sys.color.bg.primary}
comp.button.bg.primary.hover   → {sys.color.bg.primary.hover}
comp.button.padding.horizontal → {sys.spacing.component.md}
comp.card.radius               → {sys.radius.md}
```

**Critical rule:** `comp` references only `sys`; `sys` references only `ref`. Components consuming tokens MUST only reference `sys` or `comp` — never `ref` directly.

---

## Naming Convention

Tokens follow the schema: `{tier}.{category}.{role}.{variant}.{state}`

- **tier:** `ref`, `sys`, or `comp`
- **category:** `color`, `spacing`, `typography`, `radius`, `shadow`, `animation`, etc.
- **role:** semantic purpose (e.g., `bg`, `text`, `border`, `icon`)
- **variant:** `primary`, `secondary`, `danger`, `success`, etc.
- **state:** `hover`, `active`, `focus`, `disabled`, `pressed`

Examples:
```
sys.color.bg.primary.hover
sys.color.text.secondary.disabled
comp.button.bg.danger.active
comp.input.border.focus
```

---

## Adding New Tokens

### Adding a Reference Token (Tier 1)

1. Open `src/ref/` and locate the appropriate category file (e.g., `palette.json`, `spacing.json`).
2. Add the new value following the existing naming convention.
3. Run `pnpm build --filter @ghds/tokens` to verify the build succeeds.

### Adding a System Token (Tier 2)

1. Open `src/sys/` and locate the appropriate category file.
2. Define the new semantic token using an alias/reference to the Tier 1 token.
   ```json
   { "sys.color.bg.brand": { "$value": "{ref.palette.blue.500}" } }
   ```
3. Run `pnpm build --filter @ghds/tokens` and validate the output.

### Adding a Component Token (Tier 3)

1. Open or create `src/comp/{component-name}.json`.
2. Define component tokens referencing Tier 2 sys tokens.
   ```json
   { "comp.button.bg.primary": { "$value": "{sys.color.bg.brand}" } }
   ```
3. Ensure the component file is included in the tokens build entry point.
4. Run `pnpm build --filter @ghds/tokens`.

---

## Validation Requirements

Run the validation suite before committing: `pnpm test --filter @ghds/tokens`.

- All token aliases must resolve (no dangling references).
- Tier 3 must only reference Tier 2. Tier 2 must only reference Tier 1.
- No circular references.
- Color contrast ratios must meet WCAG 2.1 AA minimum (4.5:1 for normal text, 3:1 for large text) for all text/background token pairings.
- No orphaned tokens: every token should be referenced by at least one downstream consumer (warning, not error).

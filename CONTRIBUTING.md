# Contributing to GHDS

Thanks for your interest in GHDS (GH Design System). This guide covers how to
propose changes, the standards every change must meet, and how releases work.
It assembles rules that also live in [`AGENTS.md`](./AGENTS.md) (the Code
Quality Gate), the PR/issue templates, and the release workflow — start here.

Related documents:

- [`GOVERNANCE.md`](./GOVERNANCE.md) — who decides what, component lifecycle policy
- [`VERSIONING.md`](./VERSIONING.md) — SemVer policy and the release pipeline
- [`MIGRATIONS.md`](./MIGRATIONS.md) — how breaking changes are communicated

---

## Getting set up

**Prerequisites:** Node.js `>=24`, pnpm `>=11` (run `corepack enable` to get the
pinned version automatically).

```bash
pnpm install     # install all workspace dependencies
pnpm build       # build every package (Turborepo resolves order)
pnpm test        # run all tests
pnpm lint        # Biome lint check
pnpm check       # Biome lint + format auto-fix
```

Per-package specifics live in each package's `AGENTS.md`
(`packages/*/AGENTS.md`). Read the relevant one before working inside a package.

## Proposing a change

1. **Open an issue first** for anything non-trivial — a new component, token, or
   API. Use the [Feature Request template](./.github/ISSUE_TEMPLATE/feature_request.md);
   it asks which package is affected and, for tokens, which tier
   (`ref` / `sys` / `comp`). General questions go to
   [Discussions](https://github.com/GyeongHoKim/gyeongho-design-system/discussions).
2. **Wait for triage.** The maintainer accepts, declines, or asks for scope
   changes — see [`GOVERNANCE.md`](./GOVERNANCE.md) for how decisions are made
   and what "accepted" means for each change type.
3. **Branch and build.** Branch off `main` (e.g. `feature/ghd-42`). Small,
   reviewable PRs are strongly preferred over large ones.
4. **Open a PR** using the [pull request template](./.github/PULL_REQUEST_TEMPLATE.md)
   and link the issue with `closes #<n>`.

## Branch & commit conventions

- **Conventional Commits** are enforced by commitlint (`.husky/commit-msg`).
  Format: `<type>(<scope>): <subject>`. Allowed types: `feat`, `fix`, `docs`,
  `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
  Suggested scopes: package names (`tokens`, `react`, `web-components`,
  `react-native`), plus `repo`, `deps`, `release`, `ci`. Korean subjects are
  allowed.
- Example: `feat(react): add DatePicker`, `docs(repo): add contributing guide`.

## The Code Quality Gate

Every change must satisfy the five non-negotiable rules in
[`AGENTS.md`](./AGENTS.md). In short:

1. **Tokens are the single source of truth** — never hardcode a design value;
   import from `@ghds/tokens`.
2. **Respect the tier boundaries** — components reference only `sys`/`comp`,
   never `ref`. `comp → sys → ref`, one direction, no cycles.
3. **TypeScript strict, no `any`** — all public props/APIs explicitly typed.
4. **Tests and lint pass** — `pnpm test` and `pnpm lint` are green.
5. **Accessibility** — color/background pairings meet WCAG 2.1 AA (validated in
   the tokens package).

If a token you need doesn't exist, add it at the correct tier **in a separate
changeset first**, then build the UI that consumes it.

## Adding a changeset

Any change that affects a **published package** (`@ghds/tokens`, `@ghds/react`,
`@ghds/web-components`, `@ghds/react-native`) needs a changeset — this is how
versions and changelogs are generated.

```bash
pnpm changeset      # pick affected packages + bump level, write a summary
```

- Choose the bump level per [`VERSIONING.md`](./VERSIONING.md).
- Write the summary for a **consumer** reading the changelog: what changed and,
  if breaking, how to migrate (see [`MIGRATIONS.md`](./MIGRATIONS.md)).
- Docs-only or site-only changes (e.g. `apps/website`, which is private) do
  **not** need a changeset.

## Component lifecycle

New components enter as **experimental**, graduate to **stable**, and may later
be **deprecated** before removal. The full policy — what each stage promises and
where the status is recorded (`@deprecated` in code, `status:` in docs) — is in
[`GOVERNANCE.md`](./GOVERNANCE.md#component-lifecycle).

## Definition of done for a component

A new component is not done until, across all three platforms where applicable
(`@ghds/react`, `@ghds/web-components`, `@ghds/react-native`):

- [ ] `comp` tokens added (no hardcoded values, tiers respected)
- [ ] Implementation passes strict TypeScript with no `any`
- [ ] Unit tests + Storybook stories (and visual regression where applicable)
- [ ] Accessibility verified (keyboard, ARIA, WCAG AA contrast)
- [ ] A docs page following the 8-section standard — see
      [`button.mdx`](./apps/website/src/pages/components/button.mdx), the
      reference implementation
- [ ] A changeset describing the change

## Pull request checklist

The [PR template](./.github/PULL_REQUEST_TEMPLATE.md) encodes the full
checklist. CI (`lint · build · test`, CodeQL, visual regression) must be green
before merge.

## Documentation conventions

- Component pages follow the eight-section standard (Overview, Anatomy,
  Variants & States, Usage, Accessibility, Content, Props API, Live Demo) —
  copy the structure from `button.mdx`.
- Microcopy in the UI and in examples follows the
  [UX Writing Guide](./apps/website/src/pages/ux-writing.mdx).
- Keep `README.md` focused on human contributors; keep agent-facing rules in
  `AGENTS.md` files.

# Governance

How GHDS is maintained, who decides what, and the policy for a component's
lifecycle. This document is intentionally small — GHDS is currently a
single-maintainer project, and this describes that reality honestly rather than
inventing committee structure that doesn't exist.

## Roles

| Role | Who | Responsibility |
| --- | --- | --- |
| **Maintainer** | [@GyeongHoKim](https://github.com/GyeongHoKim) | Final decision on scope, API, tokens, releases, and lifecycle transitions. |
| **Contributor** | Anyone opening an issue or PR | Proposes changes; owns the quality of their PR against the [Code Quality Gate](./AGENTS.md). |

As the project grows, additional maintainers may be added here with review
authority. Until then, assume every substantive decision routes through the
maintainer.

## How decisions are made

1. **Proposals** are raised as GitHub issues (Feature Request template) or in
   [Discussions](https://github.com/GyeongHoKim/gyeongho-design-system/discussions)
   for open-ended questions. Planning is tracked in Linear (issues cross-referenced
   as `GHD-##` in commits and changelogs).
2. **Triage.** The maintainer accepts, declines, or reshapes the proposal.
   "Accepted" means different things by type:
   - *Token*: agreed name, tier, and value (must pass validation incl. WCAG AA).
   - *Component*: agreed API surface and that it belongs in the system (not a
     one-off). Enters as **experimental** (see below).
   - *Breaking change*: agreed migration path and communication plan
     (see [`MIGRATIONS.md`](./MIGRATIONS.md)).
3. **Implementation** follows [`CONTRIBUTING.md`](./CONTRIBUTING.md). Merge
   requires a green CI and maintainer approval.

## Component lifecycle

Every component moves through explicit stages. The stage is a **promise about
API stability**, not a measure of quality.

| Stage | Promise | Versioning |
| --- | --- | --- |
| **experimental** | API may change in any minor release. Opt-in; use in production at your own risk. | Breaking changes allowed in **minor**. |
| **stable** | API is protected by the SemVer policy in [`VERSIONING.md`](./VERSIONING.md). | Breaking changes require a **major** (post-1.0). |
| **deprecated** | Still shipped and functional, but scheduled for removal. A replacement (if any) is named. | Removed in the next **major** (or a documented minor while pre-1.0). |
| **removed** | No longer shipped. | Removal is the breaking change. |

New components enter as **experimental** and graduate to **stable** once the API
has settled and the maintainer is confident it won't churn.

### Where lifecycle status is recorded (source of truth)

There is deliberately **no separate component manifest/registry file** — a solo
project can't keep one from drifting out of sync with the code. Instead, status
lives in two complementary places:

- **Code owns deprecation.** Mark a deprecated export with a JSDoc
  `@deprecated` tag naming the replacement and the removal target. This is the
  machine-readable truth: it surfaces in TypeScript/IDE tooling (strikethrough +
  warnings) and is greppable across the repo.

  ```ts
  /** @deprecated Use `Button` with `variant="neutral"` instead. Removed in the next major. */
  export const GhostButton = /* … */;
  ```

- **Docs own display.** Each component's docs page carries a `status:` field in
  its frontmatter (`experimental` | `stable` | `deprecated`) for human-facing
  presentation. A component with no `status:` is treated as `stable`.

The experimental/stable distinction (which `@deprecated` can't express) is
therefore carried by docs frontmatter + this policy; deprecation is carried by
`@deprecated` in code. **Do not reintroduce a central status manifest** — this
split is the decision, recorded so it isn't relitigated.

## Release authority

Releases are automated via Changesets + a gated GitHub Actions workflow with npm
OIDC trusted publishing. Only the maintainer merges the "Version Packages" PR
that triggers a publish. The mechanics and the SemVer policy are documented in
[`VERSIONING.md`](./VERSIONING.md).

## Code of conduct

Be respectful and assume good intent. Harassment or abuse is not tolerated in
issues, PRs, or Discussions. The full policy — expected behavior, scope, and how
to report and enforce violations — is in
[`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) (Contributor Covenant 2.1). Report
violations to [me@gyeongho.dev](mailto:me@gyeongho.dev).

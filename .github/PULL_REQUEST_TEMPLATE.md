## Summary

Briefly describe what this PR changes.

## Related Issue

closes #

## Type of Change

- [ ] Bug fix
- [ ] New feature / component
- [ ] Design token change
- [ ] Refactor
- [ ] Documentation
- [ ] Build / config

## Affected Packages

- [ ] `@ghds/tokens`
- [ ] `@ghds/react`
- [ ] `@ghds/web-components`
- [ ] `@ghds/react-native`

## Checklist

- [ ] No hardcoded design values; all imported from `@ghds/tokens`.
- [ ] Token tier boundaries respected (`comp -> sys -> ref`; components never reference `ref` directly).
- [ ] Passes TypeScript strict mode with no use of `any`.
- [ ] `pnpm test` passes.
- [ ] `pnpm lint` passes.
- [ ] Added a changeset where needed (`pnpm changeset`).
- [ ] Verified accessibility (WCAG 2.1 AA contrast).

## Screenshots (for UI changes)

| Before | After |
| --- | --- |
|  |  |

## Additional Notes

Anything reviewers should be aware of.

---
"@ghds/tokens": minor
---

Add semantic typography tokens so consumers never reach past the tier boundary:

- `sys.typography.code` — a monospace text role (`fontFamily` → `{ref.fontFamily.mono}`,
  plus `fontSize`/`lineHeight`/`fontWeight`), giving a **sys**-tier monospace stack.
- `sys.typography.tracking` (`normal`, `wide`) — letter-spacing roles backed by the
  new `ref.letterSpacing` (`normal` = `0`, `wide` = `0.08em`).

The documentation site (`apps/website`) is the first consumer, replacing direct
`ref` references and hardcoded `letter-spacing`.

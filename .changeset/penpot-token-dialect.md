---
'@ghds/tokens': patch
---

Make the Penpot token export actually importable by Penpot.

`penpot:tokens` previously emitted the source DTCG `$type` verbatim, but Penpot
speaks the Tokens Studio vocabulary and accepts only its own 17 types — so
`fontFamily`, `fontWeight`, `duration` and `cubicBezier` had no valid mapping,
and the 239 `dimension` tokens all landed as generic `dimension`, which Penpot
refuses to apply to padding, radius or font-size properties.

The new `scripts/penpot-token-types.mjs` owns the dialect: it resolves each
`dimension` to the Penpot type its path implies (`spacing`, `sizing`,
`borderRadius`, `borderWidth`, `fontSizes`, `letterSpacing`), expands shadows
into the array-of-strings composite Penpot stores, converts durations to plain
numbers, and drops `cubicBezier` tokens together with everything that aliases
them — Penpot rejects a token whose alias does not resolve, so a partial drop
would fail the whole import. Aliases are still never resolved, so the
comp → sys → ref graph survives into Penpot.

`penpot:tokens` now also emits `dist/penpot/plugin-payload.json` for replaying
the tokens through the Penpot plugin API, is wired into `turbo.json`, and prints
the exclusion list on every run. The mapping and its three fidelity losses are
documented under "Penpot export" in `packages/tokens/AGENTS.md`.

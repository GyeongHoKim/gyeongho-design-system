---
"@ghds/tokens": minor
"@ghds/react": minor
"@ghds/web-components": minor
"@ghds/react-native": minor
---

Add shadcn-parity batch 1 — layout & utility primitives: `AspectRatio`, `ScrollArea`, `Item` (with `ItemMedia`/`ItemContent`/`ItemTitle`/`ItemDescription`/`ItemActions`), `InputGroup` (with `InputGroupInput`/`InputGroupAddon`), and a `Direction` (RTL) provider.

- `@ghds/tokens`: new `comp.scrollArea`, `comp.item`, and `comp.inputGroup` component tokens.
- `@ghds/react`: all five components (`aspect-ratio`, `scroll-area`, `item`, `input-group`, `direction` subpaths).
- `@ghds/web-components`: `gh-aspect-ratio`, `gh-scroll-area`, `gh-item`, `gh-input-group`, `gh-direction`.
- `@ghds/react-native`: `AspectRatio`, `Item`, and `InputGroup` (`ScrollArea` and `Direction` are web-only and intentionally omitted on RN, which uses native scrolling and `I18nManager`).

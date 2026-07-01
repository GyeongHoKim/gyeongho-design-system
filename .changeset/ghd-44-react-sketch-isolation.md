---
"@ghds/react": patch
---

Fix sketch surface hidden behind opaque-background ancestors (GHD-44). Button, Card, and Input now establish their own stacking context (`isolation: isolate`) so the decorative `z-index: -1` sketch layer — and, for filled variants, the light label — no longer disappear when the component is placed inside a card, panel, or section with an opaque background.

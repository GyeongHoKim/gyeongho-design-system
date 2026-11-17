---
'@ghds/tokens': minor
---

Add `sys.color.paper.tape` (light `ref.palette.warning.400`, dark `ref.palette.warning.500`) and point `comp.card.fastener.tape.bg` at it instead of `sys.color.bg.canvas`. The canvas-coloured tape almost disappeared on a white or dark page, leaving only its dashed edges; the amber masking-tape tone, composited at the tape opacity, now keeps at least 1.5:1 against every neutral background surface (`bg.canvas`, `bg.surface`, `bg.muted`, `bg.subtle`) and every paper background in both themes (validated). React, Web Components and React Native pick it up through the comp token.

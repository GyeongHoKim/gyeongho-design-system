---
"@ghds/tokens": minor
---

Add Korean font support to font-family stacks. Stacks now list Latin faces first, then Korean
counterparts, then system and generic fallbacks, so per-glyph fallback renders Latin text in the
Latin face and Korean text in the Korean face without locale switching.

- `ref.fontFamily.sketch`: `'Gochi Hand', 'Gaegu', 'Comic Sans MS', cursive` (Gaegu = hand-drawn Korean)
- `ref.fontFamily.sans`: `'Nunito Sans Variable', 'Pretendard', …, 'Noto Sans KR', sans-serif`
- `ref.fontFamily.mono`: appends `'Noto Sans KR'` fallback

The self-hosted web fonts (Gochi Hand, Gaegu, Nunito Sans Variable, Pretendard) are loaded by
consuming apps via Fontsource, not by the tokens package. See the Fonts guide on the website.

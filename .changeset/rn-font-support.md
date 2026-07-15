---
"@ghds/tokens": patch
"@ghds/react-native": patch
---

Add React Native font-family support. The RN build now automatically converts
CSS comma-separated font stacks to single family names that RN can consume:

- `ref.fontFamily.sketch` → `Gaegu` (Latin + Korean glyphs)
- `ref.fontFamily.sans` → `Pretendard` (Latin + Korean glyphs)
- `ref.fontFamily.mono` → `Menlo`

The chosen faces include both Latin and Korean glyphs so text renders correctly
in both languages without per-glyph fallback (which RN cannot do).

Document the expo-font loading workflow (config plugin + runtime useFonts) in
the react-native AGENTS.md and the website Fonts guide (EN + KO).

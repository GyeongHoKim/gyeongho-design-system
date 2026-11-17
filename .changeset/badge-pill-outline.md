---
'@ghds/web-components': patch
'@ghds/react': patch
'@ghds/react-native': patch
---

Badge outlines now follow `comp.badge.radius`, so the hand-drawn border traces the same pill shape as the background instead of a square-cornered rectangle (GHD-72). React and React Native sketch hooks accept an optional `radius`.

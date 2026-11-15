---
'@ghds/react-native': minor
---

**Breaking:** text variants now name a weight-specific font family for the current platform (`NotoSansKR-Medium` for `label`, `Gaegu-Bold` for `heading` and `title`, `Menlo-Regular` on iOS and `monospace` on Android for the new `code` variant) and no longer set `fontWeight` on iOS and Android. The fonts now load with the `expo-font` config plugin, bare React Native linking or the `useFonts` map form on any Expo SDK, and a new `code` text variant (from `sys.typography.code`) renders monospaced on Android. Breadcrumb's current page and the selected Tab switch to the `label` face instead of overriding `fontWeight`. On web (`react-native-web`) the variants keep `fontWeight`.

**Migration**

- Rename the font files to their PostScript names and register them under those names: `NotoSansKR-Regular`, `NotoSansKR-Medium`, `NotoSansKR-Bold`, `Gaegu-Regular`, `Gaegu-Bold`.
  - Before: `useFonts([{ fontFamily: 'NotoSansKR', fontDefinitions: [...] }])`
  - After: the `expo-font` config plugin with `./assets/fonts/NotoSansKR-Medium.ttf` and the other files, or `useFonts({ 'NotoSansKR-Medium': require('./assets/fonts/NotoSansKR-Medium.ttf'), … })`
- To emphasise text, switch the family instead of the weight.
  - Before: `<Text variant="body" fontWeight={theme.textVariants.label.fontWeight}>`
  - After: `<Text variant="body" fontFamily={theme.textVariants.label.fontFamily} fontWeight={theme.textVariants.label.fontWeight}>` (`fontWeight` is `undefined` on native)

---
'@ghds/tokens': minor
---

**Breaking (React Native output only):** every `fontFamily` token in `@ghds/tokens/rn` is now a face table `{ ios, android }` that maps each `ref.fontWeight` (`"400"`, `"500"`, `"700"`) to a weight-specific family name, instead of one family name per stack. The names are the fonts' PostScript names, so they match the `expo-font` config plugin and bare React Native linking on both platforms. `mono` now resolves to `monospace` on Android, which has no Menlo. CSS, TS and JSON output are unchanged.

| Stack | iOS | Android |
| --- | --- | --- |
| `sans` | `NotoSansKR-Regular` / `-Medium` / `-Bold` | same |
| `sketch` | `Gaegu-Regular` (400, 500) / `Gaegu-Bold` | same |
| `mono` | `Menlo-Regular` (400, 500) / `Menlo-Bold` | `monospace` |

**Migration**

- Before: `fontFamily: lightTokens.sys.typography.body.fontFamily` (`'NotoSansKR'`) plus `fontWeight: '400'`
- After: `fontFamily: lightTokens.sys.typography.body.fontFamily[Platform.OS === 'ios' ? 'ios' : 'android']['400']` (`'NotoSansKR-Regular'`), with no `fontWeight`. `@ghds/react-native`'s theme does this for you.

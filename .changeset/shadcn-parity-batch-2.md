---
"@ghds/tokens": minor
"@ghds/react": minor
"@ghds/web-components": minor
"@ghds/react-native": minor
---

Add shadcn-parity batch 2 — specialized inputs: `InputOTP` (segmented one-time-code field) and `NativeSelect` (a hand-drawn wrapper around a real native `<select>`).

- `@ghds/tokens`: new `comp.inputOtp` and `comp.nativeSelect` component tokens.
- `@ghds/react`: `input-otp` and `native-select` subpaths.
- `@ghds/web-components`: `gh-input-otp` and `gh-native-select`.
- `@ghds/react-native`: `InputOTP` (`NativeSelect` is omitted on RN, which uses the platform picker paradigm rather than a styled native `<select>`).

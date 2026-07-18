# Security Policy

We take the security of GHDS and its published packages seriously. GHDS ships
four packages to npm — `@ghds/tokens`, `@ghds/react`, `@ghds/web-components`,
and `@ghds/react-native` — so a vulnerability here can reach every project that
installs them. Thank you for helping keep the ecosystem safe.

## Supported Versions

Only the latest published minor of each `@ghds/*` package receives security
fixes. Please upgrade to the newest release before reporting, in case the issue
is already resolved.

| Version | Supported |
| --- | --- |
| Latest release | ✅ |
| Older releases | ❌ |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues,
discussions, or pull requests.** Public disclosure before a fix is available
puts every consumer at risk.

Report privately through either channel:

- **GitHub Private Vulnerability Reporting** — use the **"Report a
  vulnerability"** button on the repository's
  [Security tab](https://github.com/GyeongHoKim/gyeongho-design-system/security).
  This keeps the report and discussion private until a fix ships.
- **Email** — [me@gyeongho.dev](mailto:me@gyeongho.dev). Please use a subject
  line beginning with `[SECURITY]`.

Please include as much of the following as you can:

- The affected package(s) and version(s)
- The type of issue and its impact
- Step-by-step reproduction (a minimal repro or proof of concept is ideal)
- Any suggested mitigation, if known

## What to Expect

- **Acknowledgement** within 72 hours of your report.
- An initial assessment and, if accepted, a rough remediation timeline.
- Progress updates as a fix is developed, and coordination on a disclosure date.
- Credit for the reporter in the release notes once the fix is published, unless
  you prefer to remain anonymous.

We ask that you give us a reasonable window to release a fix before any public
disclosure.

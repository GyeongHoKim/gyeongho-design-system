---
"@ghds/tokens": patch
"@ghds/react": patch
"@ghds/web-components": patch
"@ghds/react-native": patch
---

Add a `homepage` field pointing at the documentation site
(`https://gyeonghokim.github.io/gyeongho-design-system/`) to each published
package's `package.json`. This improves discoverability on npm and for external
documentation indexers (e.g. Context7), which use package/repository metadata to
resolve and link the project.

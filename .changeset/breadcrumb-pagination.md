---
"@ghds/tokens": minor
"@ghds/react": minor
"@ghds/web-components": minor
"@ghds/react-native": minor
---

Add the navigation components Breadcrumb and Pagination across all three platforms (GHD-34, slice 1 of 2 — the M11 탐색 group; Tabs/Accordion follow).

- **`@ghds/tokens`** — new `comp.breadcrumb` and `comp.pagination` token files, aliasing `sys` only.
- **`@ghds/react`** — `Breadcrumb` (data-driven `items`, `nav` landmark, `aria-current` on the current page, chevron separators) and `Pagination` (Prev/Next + numbered sketch page buttons, ellipsis collapsing via the exported `paginationRange` helper, `aria-current` on the current page).
- **`@ghds/web-components`** — `<gh-breadcrumb>` (dispatches a `select` event) and `<gh-pagination>` composed from an internal `<gh-pagination-item>` (dispatches `page-change`).
- **`@ghds/react-native`** — `Breadcrumb` (navigate via `onSelect`, no `href`) and `Pagination` (per-item sketch buttons; current page via `accessibilityState.selected`).

Each ships unit tests (including `paginationRange` cases), Storybook stories, and an eight-section documentation page. Breadcrumb is a text navigation component and carries no sketch surface; Pagination's page buttons are hand-drawn.

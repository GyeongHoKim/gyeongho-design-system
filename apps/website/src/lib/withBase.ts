/**
 * Prefix an absolute app path with the configured base path so internal links
 * work under the GitHub Pages project subpath.
 *
 * Astro exposes the `base` config as `import.meta.env.BASE_URL`, always with a
 * trailing slash (e.g. `/gyeongho-design-system/`). Authored `href`/links are
 * NOT rewritten automatically, so build them through this helper.
 *
 * @param path Absolute app path beginning with `/` (e.g. `/components/`).
 */
export const withBase = (path: string): string =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`;

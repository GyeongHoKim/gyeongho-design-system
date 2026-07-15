import type { Locale } from '../i18n/ui';
import { DEFAULT_LOCALE } from '../i18n/ui';

/**
 * The active locale for the current page render. Set once by `BaseLayout.astro`
 * before the slot renders, so MDX/Astro content calling `withBase` automatically
 * gets locale-prefixed links without passing the locale at every call site.
 *
 * This is safe for Astro static builds (`astro build`), where each page renders
 * synchronously in sequence.
 */
let _locale: Locale = DEFAULT_LOCALE;

/** Set the active locale for the current render. Called by BaseLayout. */
export const setLocale = (locale: Locale): void => {
  _locale = locale;
};

/** Get the active locale. */
export const getLocale = (): Locale => _locale;

/**
 * Prefix an absolute app path with the configured base path **and the active
 * locale** so internal links work under the GitHub Pages project subpath with
 * locale routing.
 *
 * Astro exposes the `base` config as `import.meta.env.BASE_URL`, always with a
 * trailing slash (e.g. `/gyeongho-design-system/`). Authored `href`/links are
 * NOT rewritten automatically, so build them through this helper.
 *
 * @param path Absolute app path beginning with `/` (e.g. `/components/`).
 */
export const withBase = (path: string): string =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${_locale}${path}`;

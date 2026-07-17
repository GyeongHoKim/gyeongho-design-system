/**
 * UI string dictionary for locale-aware chrome (nav, header, footer, toggles).
 *
 * Content strings live in the MDX/Astro pages themselves (one per locale under
 * `src/pages/en/` and `src/pages/ko/`). This dictionary only covers structural
 * UI labels that appear in shared layouts and are the same on every page.
 */
export type Locale = 'en' | 'ko';

export const LOCALES: readonly Locale[] = ['en', 'ko'];
export const DEFAULT_LOCALE: Locale = 'en';

export const UI = {
  en: {
    brand: 'GHDS',
    brandSubtitle: 'GH Design System',
    home: 'Home',
    theme: 'Theme',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
    languageLabel: 'Language',
    footer: 'GHDS — GH Design System · Every design value comes from',
    getStarted: 'Get Started →',
    viewComponents: 'View Components',
    explore: 'Explore',
  },
  ko: {
    brand: 'GHDS',
    brandSubtitle: 'GH 디자인 시스템',
    home: '홈',
    theme: '테마',
    lightMode: '라이트 모드',
    darkMode: '다크 모드',
    switchToLight: '라이트 모드로 전환',
    switchToDark: '다크 모드로 전환',
    languageLabel: '언어',
    footer: 'GHDS — GH 디자인 시스템 · 모든 디자인 값은',
    getStarted: '시작하기 →',
    viewComponents: '컴포넌트 보기',
    explore: '둘러보기',
  },
} as const;

/** Translate a UI key for the given locale. Falls back to English. */
export function t(locale: Locale, key: keyof typeof UI.en): string {
  return UI[locale]?.[key] ?? UI.en[key];
}

import type { Locale } from '../i18n/ui';

/** KRDS-style information architecture for the GHDS documentation site. */
export interface NavItem {
  /** Route path (locale-agnostic; `withBase` adds the locale prefix). */
  readonly href: string;
  /** Localized section labels. */
  readonly label: Record<Locale, string>;
  /** Localized one-line descriptions used on the home page section grid. */
  readonly summary: Record<Locale, string>;
}

export const NAV: readonly NavItem[] = [
  {
    href: '/getting-started/',
    label: { en: 'Getting Started', ko: '시작하기' },
    summary: {
      en: 'Install GHDS and render your first component on screen.',
      ko: 'GHDS를 설치하고 첫 컴포넌트를 화면에 렌더링하세요.',
    },
  },
  {
    href: '/fonts/',
    label: { en: 'Fonts', ko: '폰트' },
    summary: {
      en: 'Font-family stacks for English and Korean, the chosen typefaces, and how to load self-hosted web fonts via Fontsource.',
      ko: '영어와 한국어에 최적화된 폰트 스택, 선택된 서체, Fontsource로 자가 호스팅 웹폰트를 로드하는 방법.',
    },
  },
  {
    href: '/design-style/',
    label: { en: 'Design Style', ko: '디자인 스타일' },
    summary: {
      en: 'Color, typography, spacing, radius, and shadow — design tokens generated automatically from @ghds/tokens.',
      ko: '색상, 타이포그래피, 간격, 반경, 그림자 — @ghds/tokens에서 자동 생성되는 디자인 토큰.',
    },
  },
  {
    href: '/foundations/',
    label: { en: 'Foundations', ko: '파운데이션' },
    summary: {
      en: 'Layout & grid, icons, motion, elevation, and z-index layering — the structural and interaction primitives behind every component.',
      ko: '레이아웃과 그리드, 아이콘, 모션, 엘리베이션, z-index 레이어링 — 모든 컴포넌트의 기반이 되는 구조적/인터랙션 프리미티브.',
    },
  },
  {
    href: '/components/',
    label: { en: 'Components', ko: '컴포넌트' },
    summary: {
      en: 'Live-render React and Lit components side by side on one screen.',
      ko: 'React와 Lit 컴포넌트를 한 화면에서 나란히 실시간 렌더링합니다.',
    },
  },
  {
    href: '/patterns/',
    label: { en: 'Patterns', ko: '패턴' },
    summary: {
      en: 'Reusable composition patterns for forms, feedback, and more.',
      ko: '폼, 피드백 등을 위한 재사용 가능한 컴포지션 패턴.',
    },
  },
  {
    href: '/principles/',
    label: { en: 'Design Principles', ko: '디자인 원칙' },
    summary: {
      en: 'Five principles and the voice & tone that guide every token, component, and word in GHDS.',
      ko: 'GHDS의 모든 토큰, 컴포넌트, 단어를 이끄는 5가지 원칙과 보이스 & 톤.',
    },
  },
  {
    href: '/ux-writing/',
    label: { en: 'UX Writing', ko: 'UX 라이팅' },
    summary: {
      en: 'Microcopy rules for buttons, errors, empty states, and a shared product glossary.',
      ko: '버튼, 에러, 빈 상태를 위한 마이크로카피 규칙과 공유 제품 용어집.',
    },
  },
  {
    href: '/about/',
    label: { en: 'About & Accessibility', ko: '소개 및 접근성' },
    summary: {
      en: "The design system's philosophy and its WCAG 2.1 AA accessibility commitment.",
      ko: '디자인 시스템의 철학과 WCAG 2.1 AA 접근성 약속.',
    },
  },
  {
    href: '/resources/',
    label: { en: 'Resources', ko: '리소스' },
    summary: {
      en: 'A collection of links for packages, the repository, changelog, and more.',
      ko: '패키지, 저장소, 변경 이력 등을 위한 링크 모음.',
    },
  },
  {
    href: '/skills/',
    label: { en: 'AI Agent Skills', ko: 'AI 에이전트 스킬' },
    summary: {
      en: 'Install a skill so your AI coding assistant generates correct GHDS code.',
      ko: 'AI 코딩 어시스턴트가 올바른 GHDS 코드를 생성하도록 스킬을 설치하세요.',
    },
  },
];

/**
 * A top-level entry in the site header: either a direct link (`href`, no
 * dropdown) or a category that opens a dropdown of its `children`.
 */
export interface NavCategory {
  /** Localized top-level label. */
  readonly label: Record<Locale, string>;
  /** Route path for a direct (childless) link. */
  readonly href?: string;
  /** Sub-links shown in the dropdown panel (reuse the flat {@link NAV} items). */
  readonly children?: readonly NavItem[];
}

/** Look up a flat NAV entry by href so categories reuse a single source. */
function byHref(href: string): NavItem {
  const item = NAV.find((entry) => entry.href === href);
  if (!item) {
    throw new Error(`NAV has no entry for "${href}"`);
  }
  return item;
}

/**
 * The header's information architecture: the eleven flat {@link NAV} sections
 * grouped into a compact set of top-level entries so the nav fits one row and
 * exposes categorized dropdowns. `Home` and `Resources` are direct links; the
 * rest open dropdown panels. Child summaries become the dropdown descriptions.
 */
export const NAV_CATEGORIES: readonly NavCategory[] = [
  { label: { en: 'Home', ko: '홈' }, href: '/' },
  {
    label: { en: 'Start', ko: '시작' },
    children: [byHref('/getting-started/'), byHref('/skills/')],
  },
  {
    label: { en: 'Foundations', ko: '파운데이션' },
    children: [byHref('/fonts/'), byHref('/design-style/'), byHref('/foundations/')],
  },
  {
    label: { en: 'Library', ko: '라이브러리' },
    children: [byHref('/components/'), byHref('/patterns/')],
  },
  {
    label: { en: 'Guidelines', ko: '가이드라인' },
    children: [byHref('/principles/'), byHref('/ux-writing/'), byHref('/about/')],
  },
  { label: byHref('/resources/').label, href: '/resources/' },
];

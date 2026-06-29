/** KRDS-style information architecture for the GHDS documentation site. */
export interface NavItem {
  /** Korean section label (primary). */
  readonly label: string;
  /** English section label (secondary). */
  readonly labelEn: string;
  /** Route path. */
  readonly href: string;
  /** One-line description used on the home page section grid. */
  readonly summary: string;
}

export const NAV: readonly NavItem[] = [
  {
    label: '시작하기',
    labelEn: 'Getting Started',
    href: '/getting-started/',
    summary: 'GHDS를 설치하고 첫 컴포넌트를 화면에 그려봅니다.',
  },
  {
    label: '디자인 스타일',
    labelEn: 'Design Style',
    href: '/design-style/',
    summary: '색상·타이포·간격·반경·그림자 — @ghds/tokens에서 자동 생성한 디자인 토큰.',
  },
  {
    label: '컴포넌트 가이드',
    labelEn: 'Components',
    href: '/components/',
    summary: 'React와 Lit 컴포넌트를 한 화면에서 나란히 라이브 렌더링합니다.',
  },
  {
    label: '패턴',
    labelEn: 'Patterns',
    href: '/patterns/',
    summary: '폼, 피드백 등 화면을 구성하는 재사용 가능한 조합 패턴.',
  },
  {
    label: '소개·접근성',
    labelEn: 'About & Accessibility',
    href: '/about/',
    summary: '디자인 시스템의 철학과 WCAG 2.1 AA 접근성 약속.',
  },
  {
    label: '리소스',
    labelEn: 'Resources',
    href: '/resources/',
    summary: '패키지, 저장소, 변경 이력 등 개발에 필요한 링크 모음.',
  },
];

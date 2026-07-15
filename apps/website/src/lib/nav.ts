/** KRDS-style information architecture for the GHDS documentation site. */
export interface NavItem {
  /** Section label used in the nav and home page card grid. */
  readonly label: string;
  /** Route path. */
  readonly href: string;
  /** One-line description used on the home page section grid. */
  readonly summary: string;
}

export const NAV: readonly NavItem[] = [
  {
    label: 'Getting Started',
    href: '/getting-started/',
    summary: 'Install GHDS and render your first component on screen.',
  },
  {
    label: 'Fonts',
    href: '/fonts/',
    summary:
      'Font-family stacks for English and Korean, the chosen typefaces, and how to load self-hosted web fonts via Fontsource.',
  },
  {
    label: 'Design Style',
    href: '/design-style/',
    summary:
      'Color, typography, spacing, radius, and shadow — design tokens generated automatically from @ghds/tokens.',
  },
  {
    label: 'Foundations',
    href: '/foundations/',
    summary:
      'Layout & grid, icons, motion, elevation, and z-index layering — the structural and interaction primitives behind every component.',
  },
  {
    label: 'Components',
    href: '/components/',
    summary: 'Live-render React and Lit components side by side on one screen.',
  },
  {
    label: 'Patterns',
    href: '/patterns/',
    summary: 'Reusable composition patterns for forms, feedback, and more.',
  },
  {
    label: 'Design Principles',
    href: '/principles/',
    summary:
      'Five principles and the voice & tone that guide every token, component, and word in GHDS.',
  },
  {
    label: 'UX Writing',
    href: '/ux-writing/',
    summary: 'Microcopy rules for buttons, errors, empty states, and a shared product glossary.',
  },
  {
    label: 'About & Accessibility',
    href: '/about/',
    summary: "The design system's philosophy and its WCAG 2.1 AA accessibility commitment.",
  },
  {
    label: 'Resources',
    href: '/resources/',
    summary: 'A collection of links for packages, the repository, changelog, and more.',
  },
  {
    label: 'AI Agent Skills',
    href: '/skills/',
    summary: 'Install a skill so your AI coding assistant generates correct GHDS code.',
  },
];

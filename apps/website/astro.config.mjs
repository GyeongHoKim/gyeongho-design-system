// @ts-check
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

// The GHDS documentation site.
//
// - React components (`@ghds/react`) are rendered as Astro islands via
//   `@astrojs/react` (hydrated client-side, since they paint a sketch surface
//   in the browser).
// - Lit web components (`@ghds/web-components`) are loaded as a client-side
//   island: a `<script>` imports the package, whose custom-element side-effects
//   register `<gh-button>` / `<gh-card>` / `<gh-input>`. No SSR integration is
//   required for them.
export default defineConfig({
  // Deployed to GitHub Pages as a project site, so the app lives under the
  // repository-name subpath. `base` makes Astro prefix processed assets and
  // injected tags; authored links are made base-aware via `src/lib/withBase`.
  site: 'https://gyeonghokim.github.io',
  base: '/gyeongho-design-system',
  integrations: [react(), mdx()],
});

import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * React Native components are exercised through `react-native-web` in jsdom —
 * the same rendering path the web-based Storybook uses.
 *
 * - `react-native` → `react-native-web` (anchored regex so `react-native-svg`
 *   is untouched). This covers our own source, which Vite transforms.
 * - `react-native-svg` → a DOM stub: its real web build needs a Metro/Vite web
 *   bundler and cannot load in a plain Node test runner. The stub maps the SVG
 *   primitives to `<svg>`/`<path>` so the adapter's output is still asserted.
 * - `@shopify/restyle` is CJS and stays external (Node `require`), so its own
 *   `require('react-native')` is redirected to `react-native-web` at the Node
 *   module-resolution level in `vitest.setup.ts`.
 */
const svgStub = fileURLToPath(new URL('./src/test/react-native-svg.stub.tsx', import.meta.url));
const pickerStub = fileURLToPath(new URL('./src/test/picker.stub.tsx', import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^react-native-svg$/, replacement: svgStub },
      { find: /^@react-native-picker\/picker$/, replacement: pickerStub },
      { find: /^react-native$/, replacement: 'react-native-web' },
    ],
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.json',
    ],
    conditions: ['browser'],
  },
  esbuild: { jsx: 'automatic' },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});

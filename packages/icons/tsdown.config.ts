import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  // tsdown's dts generation (rolldown-plugin-dts) doesn't yet support
  // TypeScript 7 — declarations are emitted separately by `tsc
  // --emitDeclarationOnly` in the build script instead.
  dts: false,
  sourcemap: true,
});

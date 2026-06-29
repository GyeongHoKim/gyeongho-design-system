import { createRequire, Module } from 'node:module';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// `@shopify/restyle` is shipped as CommonJS and is loaded externally by Node,
// which bypasses Vitest's `resolve.alias`. Its internal `require('react-native')`
// would therefore pull React Native's Flow-typed source (which jsdom cannot
// parse). Redirect the bare `react-native` specifier to `react-native-web` at
// the Node module-resolution level so external CJS deps resolve it correctly.
const require = createRequire(import.meta.url);
const reactNativeWeb = require.resolve('react-native-web');

interface ModuleResolver {
  _resolveFilename(request: string, parent: unknown, isMain: boolean, options?: unknown): string;
}
const resolver = Module as unknown as ModuleResolver;
const originalResolve = resolver._resolveFilename.bind(resolver);
resolver._resolveFilename = (request, parent, isMain, options) =>
  originalResolve(request === 'react-native' ? reactNativeWeb : request, parent, isMain, options);

// jsdom does not implement ResizeObserver, which react-native-web references
// for layout. A no-op stub keeps `onLayout`-driven components from crashing.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
}

afterEach(() => {
  cleanup();
});

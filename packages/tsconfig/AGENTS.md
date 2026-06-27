# @ghds/tsconfig — AGENTS.md

> Package-specific guide. See the [root `AGENTS.md`](../../AGENTS.md) for the
> project overview and the project-wide **Code Quality Gate**.

Internal, **non-published** (`private: true`) package holding shared TypeScript configuration presets. Every GHDS package extends one of these instead of duplicating compiler options.

## Presets

| Preset | Extend path | For |
| --- | --- | --- |
| base | `@ghds/tsconfig/base.json` | Common strict options. Not used directly — the others extend it. |
| react-library | `@ghds/tsconfig/react-library.json` | `@ghds/react` (DOM libs, `jsx: react-jsx`) |
| lit-library | `@ghds/tsconfig/lit-library.json` | `@ghds/web-components` (experimental decorators, `useDefineForClassFields: false` per Lit's recommendation) |
| react-native-library | `@ghds/tsconfig/react-native-library.json` | `@ghds/react-native` (no DOM lib, `jsx: react-jsx`) |
| node-library | `@ghds/tsconfig/node-library.json` | `@ghds/tokens` build scripts and other Node tooling (`NodeNext`, `@types/node`) |

## Usage

1. Add the dev dependency in the consuming package:
   ```jsonc
   // packages/react/package.json
   { "devDependencies": { "@ghds/tsconfig": "workspace:*" } }
   ```
2. Extend the matching preset and set `include`/`outDir` locally (the presets ship `compilerOptions` only):
   ```jsonc
   // packages/react/tsconfig.json
   {
     "extends": "@ghds/tsconfig/react-library.json",
     "compilerOptions": { "outDir": "dist", "rootDir": "src" },
     "include": ["src"],
     "exclude": ["dist", "node_modules"]
   }
   ```

## Conventions

- Presets contain **`compilerOptions` only** — no `include`/`exclude`/`outDir`. Those are path-relative and belong in the consuming `tsconfig.json`.
- `base.json` is strict by default (`strict`, `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`, `verbatimModuleSyntax`) and emits declarations + maps for publishable libraries.
- The `react-native-library` preset may need additional React Native-specific settings (e.g. extending `@react-native/typescript-config`) once that package is built out.
- This package is `private` and is skipped by Changesets — it is never published to npm.

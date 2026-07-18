---
"@ghds/tokens": minor
"@ghds/react": minor
"@ghds/web-components": minor
"@ghds/react-native": minor
---

Add shadcn-parity batch 3 — interactive containers: `Carousel` (scroll-snap slides with `CarouselContent`/`CarouselItem`/`CarouselPrevious`/`CarouselNext`) and `Resizable` (`ResizablePanelGroup`/`ResizablePanel`/`ResizableHandle`, a pointer- and keyboard-driven split view). Both are built on native primitives — no third-party carousel or resize engine.

- `@ghds/tokens`: new `comp.carousel` and `comp.resizable` component tokens.
- `@ghds/react`: `carousel` and `resizable` subpaths.
- `@ghds/web-components`: `gh-carousel` and `gh-resizable-*`.
- `@ghds/react-native`: `Carousel` (`Resizable` is omitted on RN — pointer-drag splitting is not a touch-idiomatic pattern).

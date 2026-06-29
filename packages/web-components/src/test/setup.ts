/**
 * Vitest setup for the jsdom environment.
 *
 * jsdom implements neither `ResizeObserver` (which `SketchyBase` observes on
 * connect) nor `ElementInternals` / `attachInternals` (used by the
 * form-associated `<gh-button>` and `<gh-input>`). Both are real browser APIs;
 * the lightweight stubs below let the component lifecycle run under Node so we
 * can unit-test behaviour. Real form participation is exercised in the browser
 * (Storybook interaction tests).
 */

class ResizeObserverStub implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverStub;
}

interface MutableValidity {
  valid: boolean;
  valueMissing: boolean;
}

/** Minimal `ElementInternals` covering the surface our components use. */
class FakeElementInternals {
  role: string | null = null;
  ariaLabel: string | null = null;
  ariaDisabled: string | null = null;

  private readonly validityState: MutableValidity = { valid: true, valueMissing: false };

  constructor(private readonly host: HTMLElement) {}

  get form(): HTMLFormElement | null {
    return this.host.closest('form');
  }

  setFormValue(): void {}

  setValidity(flags: Partial<Record<keyof ValidityState, boolean>>): void {
    this.validityState.valueMissing = flags.valueMissing === true;
    this.validityState.valid = Object.keys(flags).length === 0;
  }

  get validity(): MutableValidity {
    return this.validityState;
  }
}

// jsdom ships a partial `ElementInternals` whose ARIA setters (e.g. `role`)
// throw; override unconditionally so the stub drives every test deterministically.
HTMLElement.prototype.attachInternals = function attachInternals(this: HTMLElement) {
  return new FakeElementInternals(this) as unknown as ElementInternals;
};

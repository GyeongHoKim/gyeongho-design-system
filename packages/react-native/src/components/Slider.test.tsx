import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Slider } from './Slider.js';

// Two genuine gaps confirmed by direct experimentation (not assumed) in this
// package's jsdom + react-native-web test environment, so neither drag nor
// increment/decrement value changes are exercisable here:
//
// 1. This package's jsdom `ResizeObserver` stub (`vitest.setup.ts`) is a
//    no-op — it never invokes its callback — so `onLayout` never fires and
//    the track's measured `size.width` stays 0 for the lifetime of any test.
//    `PanResponder`'s move handler *does* receive synthetic `fireEvent.mouseMove`
//    events (confirmed directly), but `valueFromPageX`'s zero-width guard means
//    the computed value never actually changes as a result.
// 2. `onAccessibilityAction` has no react-native-web wiring to any DOM event
//    at all (confirmed directly — `fireEvent(el, new CustomEvent('accessibilityAction', ...))`
//    never reaches the handler); it is a native-only (iOS/Android) affordance.
//
// Both are verified manually/visually (drag, and VoiceOver/TalkBack
// increment/decrement) per `packages/react-native/AGENTS.md`'s device/
// simulator requirement instead. This suite covers everything that IS
// derivable from props alone: rendering, ARIA value attributes, and disabled
// state.
describe('Slider', () => {
  it('renders its label with the adjustable role', () => {
    renderWithTheme(<Slider label="Volume" />);
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument();
  });

  it('defaults min/max/step to 0/100/1 and starts at min when uncontrolled', () => {
    renderWithTheme(<Slider label="Volume" />);
    const field = screen.getByRole('slider', { name: 'Volume' });
    expect(field).toHaveAttribute('aria-valuemin', '0');
    expect(field).toHaveAttribute('aria-valuemax', '100');
    expect(field).toHaveAttribute('aria-valuenow', '0');
  });

  it('exposes aria-valuemin/max/now from custom min/max/value', () => {
    renderWithTheme(<Slider label="Volume" min={0} max={10} value={4} />);
    const field = screen.getByRole('slider', { name: 'Volume' });
    expect(field).toHaveAttribute('aria-valuemin', '0');
    expect(field).toHaveAttribute('aria-valuemax', '10');
    expect(field).toHaveAttribute('aria-valuenow', '4');
  });

  it('starts at defaultValue when uncontrolled', () => {
    renderWithTheme(<Slider label="Volume" defaultValue={35} />);
    expect(screen.getByRole('slider', { name: 'Volume' })).toHaveAttribute('aria-valuenow', '35');
  });

  it('reflects a disabled state', () => {
    renderWithTheme(<Slider label="Volume" disabled />);
    expect(screen.getByRole('slider', { name: 'Volume' })).toHaveAttribute('aria-disabled', 'true');
  });
});

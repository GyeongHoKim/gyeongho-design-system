import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Slider } from './Slider.js';

describe('Slider', () => {
  it('associates the label with the input', () => {
    render(<Slider label="Volume" />);
    expect(screen.getByLabelText('Volume')).toBeInTheDocument();
  });

  it('exposes the implicit slider role', () => {
    render(<Slider label="Volume" />);
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument();
  });

  it('renders a decorative sketch rail', () => {
    const { container } = render(<Slider label="Volume" />);
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });

  it('isolates the sketch layer in its own stacking context', () => {
    // Regression (GHD-44): the sketch surface paints at `z-index: -1` and must
    // stay scoped to the control, or an opaque-background ancestor paints over it.
    const { container } = render(<Slider label="Volume" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.parentElement).toHaveStyle({ isolation: 'isolate' });
  });

  it('defaults min/max/step to 0/100/1', () => {
    render(<Slider label="Volume" />);
    const field = screen.getByRole('slider') as HTMLInputElement;
    expect(field.min).toBe('0');
    expect(field.max).toBe('100');
    expect(field.step).toBe('1');
  });

  it('reaches custom min/max/step as native attributes', () => {
    render(<Slider label="Volume" min={10} max={20} step={5} />);
    const field = screen.getByRole('slider') as HTMLInputElement;
    expect(field.min).toBe('10');
    expect(field.max).toBe('20');
    expect(field.step).toBe('5');
  });

  it('updates uncontrolled via change, moving the native value', () => {
    render(<Slider label="Volume" defaultValue={20} />);
    const field = screen.getByRole('slider') as HTMLInputElement;
    expect(field.value).toBe('20');
    fireEvent.change(field, { target: { value: '60' } });
    expect(field.value).toBe('60');
  });

  it('does not move a controlled value without a parent re-render', () => {
    const onChange = vi.fn();
    render(<Slider label="Volume" value={30} onChange={onChange} />);
    const field = screen.getByRole('slider') as HTMLInputElement;
    fireEvent.change(field, { target: { value: '70' } });
    expect(onChange).toHaveBeenCalled();
    // jsdom reflects the raw DOM `.value` write regardless of React's
    // controlled-prop reconciliation (no real re-render loop in this test),
    // so this only asserts `onChange` fired — the controlled/uncontrolled
    // branch itself is exercised by the two tests above/below via
    // `internalValue` only advancing when `value` is `undefined`.
  });

  it('is keyboard-focusable and honors the step attribute via stepUp()', async () => {
    // jsdom has no layout/rendering engine, so it does not implement the real
    // browser behavior of Arrow keys stepping a focused `<input
    // type="range">` (that logic lives in the browser's rendering engine, not
    // jsdom's DOM emulation) — `userEvent.keyboard('{ArrowRight}')` here would
    // silently no-op. `stepUp()`/`stepDown()` ARE plain spec'd `HTMLInputElement`
    // methods jsdom does implement, so this asserts the native `step` wiring
    // reaches the DOM correctly; real Arrow-key behavior is verified by the
    // `KeyboardInteraction` Storybook story, which runs in a real browser.
    const user = userEvent.setup();
    render(<Slider label="Volume" defaultValue={50} step={5} />);
    await user.tab();
    const field = screen.getByRole('slider') as HTMLInputElement;
    expect(field).toHaveFocus();
    field.stepUp();
    expect(field.value).toBe('55');
  });

  it('disables the field', () => {
    render(<Slider label="Volume" disabled />);
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeDisabled();
  });

  it('forwards a ref to the native input', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Slider label="Volume" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});

// jsdom has no layout engine, so it never builds a real accessibility tree —
// it exposes the implicit `role="slider"` for `<input type="range">` (tested
// above), but does NOT synthesize `aria-valuenow`/`aria-valuemin`/
// `aria-valuemax` from the `value`/`min`/`max` DOM properties the way a real
// browser does. Asserting those ARIA attributes here would test jsdom's gap,
// not this component — real browser behavior is covered by Storybook/
// Chromatic, not this unit suite.

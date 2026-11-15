import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Card, type CardVariant } from './Card.js';

// jsdom has no PointerEvent; a minimal one carries `pointerType` through.
class TestPointerEvent extends MouseEvent {
  pointerType: string;
  constructor(type: string, init: MouseEventInit & { pointerType?: string } = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? '';
  }
}

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount((n) => n + 1)}>
      count {count}
    </button>
  );
}

describe('Card', () => {
  it('renders its children', () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Body copy</p>
      </Card>,
    );
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
    expect(screen.getByText('Body copy')).toBeInTheDocument();
  });

  it('renders a decorative sketch surface with fill geometry', () => {
    const { container } = render(<Card>content</Card>);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });

  it('isolates the sketch layer in its own stacking context', () => {
    // Regression (GHD-44): the sketch surface paints at `z-index: -1` and must
    // stay scoped to the card, or an opaque-background ancestor paints over it.
    const { container } = render(<Card>content</Card>);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.parentElement).toHaveStyle({ isolation: 'isolate' });
  });

  it('forwards arbitrary props such as role to the root element', () => {
    render(
      <Card role="region" aria-label="Stats">
        x
      </Card>,
    );
    expect(screen.getByRole('region', { name: 'Stats' })).toBeInTheDocument();
  });

  describe('paper variants', () => {
    it('renders no sketch surface for sticky and lined', () => {
      const sticky = render(<Card variant="sticky">x</Card>);
      expect(sticky.container.querySelector('svg')).toBeNull();
      const lined = render(<Card variant="lined">x</Card>);
      expect(lined.container.querySelector('svg')).toBeNull();
    });

    it('draws the lined margin line as a decorative element on the inline-start edge', () => {
      const { container } = render(<Card variant="lined">x</Card>);
      const line = container.querySelector('[data-card-margin-line]') as HTMLElement;
      expect(line).not.toBeNull();
      expect(line).toHaveAttribute('aria-hidden', 'true');
      expect(line.style.insetInlineStart).toContain('var(--comp-card-lined-margin-offset');
      expect(line.style.left).toBe('');
      // Behind in-flow children, inside the card's own stacking context.
      expect(line.style.zIndex).toBe('-1');
      expect(line.parentElement?.style.isolation).toBe('isolate');
    });

    it('draws no margin line on sticky or plain', () => {
      const sticky = render(<Card variant="sticky">x</Card>);
      expect(sticky.container.querySelector('[data-card-margin-line]')).toBeNull();
      const plain = render(<Card>x</Card>);
      expect(plain.container.querySelector('[data-card-margin-line]')).toBeNull();
    });

    it('keeps the sketch surface for the default plain variant', () => {
      const { container } = render(<Card>x</Card>);
      expect(container.querySelector('svg')).not.toBeNull();
    });

    it('renders an unknown variant as plain', () => {
      const { container } = render(
        <Card variant={'foo' as CardVariant} data-testid="c">
          x
        </Card>,
      );
      expect(container.querySelector('svg')).not.toBeNull();
      expect(screen.getByTestId('c').style.backgroundImage).toBe('');
    });

    it('merges consumer style last', () => {
      render(
        <Card variant="sticky" data-testid="c" style={{ marginTop: 8 }}>
          x
        </Card>,
      );
      expect(screen.getByTestId('c')).toHaveStyle({ marginTop: '8px' });
    });

    it('does not clip so fasteners can overhang', () => {
      render(
        <Card variant="lined" data-testid="c">
          x
        </Card>,
      );
      expect(screen.getByTestId('c').style.overflow).not.toBe('hidden');
    });
  });

  describe('fasteners', () => {
    it('renders an aria-hidden tape centred on the top edge', () => {
      const { container } = render(
        <Card variant="sticky" fastener="tape" tilt="left">
          x
        </Card>,
      );
      const tape = container.querySelector('span[aria-hidden="true"]') as HTMLElement;
      expect(tape).not.toBeNull();
      expect(tape.style.left).toBe('50%');
      expect(tape.style.top).toContain('var(--comp-card-fastener-tape-height');
      expect(tape.style.transform).toContain('calc(-1 * calc(');
      expect(tape.style.transform).toContain('var(--comp-card-fastener-tape-tilt');
      expect(tape.getAttribute('tabindex')).toBeNull();
    });

    it('renders an aria-hidden pin svg with the tone head colour', () => {
      const { container } = render(
        <Card variant="sticky" tone="danger" fastener="pin">
          x
        </Card>,
      );
      const svg = container.querySelector('svg') as SVGElement;
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg).toHaveAttribute('focusable', 'false');
      expect(svg).toHaveAttribute('viewBox', '0 0 28 30');
      const head = svg.querySelector('circle[r="10"]') as SVGElement;
      expect(head.style.fill).toContain('var(--comp-card-fastener-pin-color-danger');
      expect(svg.querySelector('[tabindex]')).toBeNull();
    });

    it('draws the pin highlight with its own opacity token', () => {
      const { container } = render(<Card fastener="pin">x</Card>);
      const highlight = container.querySelector('circle[r="3.5"]') as SVGElement;
      expect(highlight.style.fill).toContain('var(--comp-card-fastener-pin-highlight,');
      expect(highlight.style.fillOpacity).toContain(
        'var(--comp-card-fastener-pin-highlightOpacity',
      );
    });

    it('renders fasteners on the plain variant too', () => {
      const { container } = render(<Card fastener="tape">x</Card>);
      expect(container.querySelector('span[aria-hidden="true"]')).not.toBeNull();
    });

    it('pivots a plain card from the top edge only when a fastener is present', () => {
      render(
        <Card fastener="pin" data-testid="pinned">
          x
        </Card>,
      );
      render(<Card data-testid="bare">x</Card>);
      expect(screen.getByTestId('pinned').style.transformOrigin).toBe('50% 0');
      expect(screen.getByTestId('bare').style.transformOrigin).toBe('');
    });

    it('renders no mark by default', () => {
      const { container } = render(<Card variant="sticky">x</Card>);
      expect(container.querySelector('span[aria-hidden="true"]')).toBeNull();
    });
  });

  describe('interactive', () => {
    beforeEach(() => {
      vi.stubGlobal('PointerEvent', TestPointerEvent);
    });
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('lifts on mouse hover and drops on leave', () => {
      render(
        <Card variant="sticky" interactive data-testid="c">
          x
        </Card>,
      );
      const root = screen.getByTestId('c');
      fireEvent.pointerEnter(root, { pointerType: 'mouse' });
      expect(root.style.transform).toContain('translateY(calc(var(--comp-card-hover-lift');
      expect(root.style.boxShadow).toContain('var(--comp-card-hover-shadow');
      fireEvent.pointerLeave(root, { pointerType: 'mouse' });
      expect(root.style.transform).not.toContain('translateY');
    });

    it('does not lift on touch', () => {
      render(
        <Card variant="sticky" interactive data-testid="c">
          x
        </Card>,
      );
      const root = screen.getByTestId('c');
      fireEvent.pointerEnter(root, { pointerType: 'touch' });
      expect(root.style.transform).not.toContain('translateY');
    });

    it('lifts while focus is inside and keeps it when focus moves between children', () => {
      render(
        <Card variant="lined" interactive data-testid="c">
          <button type="button">a</button>
          <button type="button">b</button>
        </Card>,
      );
      const root = screen.getByTestId('c');
      const [a, b] = screen.getAllByRole('button');
      fireEvent.focus(a as HTMLElement);
      expect(root.style.transform).toContain('translateY');
      fireEvent.blur(a as HTMLElement, { relatedTarget: b });
      expect(root.style.transform).toContain('translateY');
      fireEvent.blur(b as HTMLElement, { relatedTarget: null });
      expect(root.style.transform).not.toContain('translateY');
    });

    it('calls consumer handlers', () => {
      const onPointerEnter = vi.fn();
      const onFocus = vi.fn();
      render(
        <Card variant="sticky" interactive onPointerEnter={onPointerEnter} onFocus={onFocus}>
          <button type="button">a</button>
        </Card>,
      );
      fireEvent.pointerEnter(screen.getByRole('button').parentElement as HTMLElement, {
        pointerType: 'mouse',
      });
      fireEvent.focus(screen.getByRole('button'));
      expect(onPointerEnter).toHaveBeenCalled();
      expect(onFocus).toHaveBeenCalled();
    });

    it('sets a transition, or none under reduced motion', () => {
      const { unmount } = render(
        <Card variant="sticky" interactive data-testid="c">
          x
        </Card>,
      );
      expect(screen.getByTestId('c').style.transition).toContain('var(--comp-card-hover-duration');
      unmount();
      vi.stubGlobal('matchMedia', (query: string) => ({
        matches: query.includes('reduce'),
        addEventListener: () => {},
        removeEventListener: () => {},
      }));
      render(
        <Card variant="sticky" interactive data-testid="c">
          x
        </Card>,
      );
      expect(screen.getByTestId('c').style.transition).toBe('none');
    });

    it('drops hover and focus state while interactive is off', () => {
      const ui = (interactive: boolean) => (
        <Card interactive={interactive} data-testid="c">
          <input aria-label="note" />
        </Card>
      );
      const { rerender } = render(ui(true));
      const root = screen.getByTestId('c');
      fireEvent.pointerEnter(root, { pointerType: 'mouse' });
      fireEvent.focus(screen.getByRole('textbox'));
      expect(root.style.transform).toContain('translateY');
      rerender(ui(false));
      fireEvent.pointerLeave(root, { pointerType: 'mouse' });
      fireEvent.blur(screen.getByRole('textbox'));
      rerender(ui(true));
      expect(root.style.transform).not.toContain('translateY');
    });

    it('lifts a plain card on mouse hover without changing its box shadow', () => {
      render(
        <Card interactive data-testid="c">
          x
        </Card>,
      );
      const root = screen.getByTestId('c');
      fireEvent.pointerEnter(root, { pointerType: 'mouse' });
      expect(root.style.transform).toContain('translateY(calc(var(--comp-card-hover-lift');
      expect(root.style.boxShadow).toBe('');
    });

    it.each([
      ['plain', false],
      ['sticky', false],
      ['plain', true],
      ['sticky', true],
    ] as const)('passes consumer handlers through (%s, interactive=%s)', (variant, interactive) => {
      const onPointerEnter = vi.fn();
      const onPointerLeave = vi.fn();
      const onFocus = vi.fn();
      const onBlur = vi.fn();
      render(
        <Card
          variant={variant}
          interactive={interactive}
          data-testid="c"
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          <button type="button">a</button>
        </Card>,
      );
      const root = screen.getByTestId('c');
      fireEvent.pointerEnter(root, { pointerType: 'mouse' });
      fireEvent.pointerLeave(root, { pointerType: 'mouse' });
      fireEvent.focus(screen.getByRole('button'));
      fireEvent.blur(screen.getByRole('button'));
      expect(onPointerEnter).toHaveBeenCalledTimes(1);
      expect(onPointerLeave).toHaveBeenCalledTimes(1);
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('does nothing without interactive', () => {
      render(
        <Card variant="sticky" data-testid="c">
          <button type="button">a</button>
        </Card>,
      );
      const root = screen.getByTestId('c');
      fireEvent.pointerEnter(root, { pointerType: 'mouse' });
      fireEvent.focus(screen.getByRole('button'));
      expect(root.style.transform).toBe('');
      expect(root.style.transition).toBe('');
    });

    it('gives an unknown variant the plain lift with no box shadow', () => {
      render(
        <Card variant={'foo' as CardVariant} interactive data-testid="c">
          x
        </Card>,
      );
      const root = screen.getByTestId('c');
      fireEvent.pointerEnter(root, { pointerType: 'mouse' });
      expect(root.style.transform).toContain('translateY');
      expect(root.style.boxShadow).toBe('');
    });
  });

  describe('asChild', () => {
    beforeEach(() => {
      vi.stubGlobal('PointerEvent', TestPointerEvent);
    });
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('renders as the slotted link with the sketch surface inside it', () => {
      const { container } = render(
        <Card asChild>
          <a href="/docs/card">
            <h3>Card docs</h3>
          </a>
        </Card>,
      );
      const link = screen.getByRole('link', { name: 'Card docs' });
      expect(link).toHaveAttribute('href', '/docs/card');
      // No wrapper: the link is the card root.
      expect(container.firstElementChild).toBe(link);
      const svg = link.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(link.querySelectorAll('svg path').length).toBeGreaterThan(0);
      expect(link).toHaveStyle({ isolation: 'isolate', textDecoration: 'none' });
      expect(link.querySelector('h3')).not.toBeNull();
    });

    it('forwards the ref to the slotted element', () => {
      let node: HTMLElement | null = null;
      render(
        <Card
          asChild
          ref={(el) => {
            node = el;
          }}
        >
          <a href="/x">x</a>
        </Card>,
      );
      expect(node).toBe(screen.getByRole('link'));
    });

    it('is keyboard-focusable and shows the focus ring only on focus-visible', () => {
      render(
        <Card asChild>
          <a href="/x">x</a>
        </Card>,
      );
      const link = screen.getByRole('link');
      act(() => link.focus());
      expect(document.activeElement).toBe(link);
      const matches = vi.spyOn(link, 'matches').mockImplementation(() => true);
      fireEvent.focus(link);
      expect(link.style.outline).toContain('var(--comp-card-focus-ring');
      expect(link.style.transform).toContain('translateY');
      fireEvent.blur(link);
      expect(link.style.outline).toBe('');
      matches.mockImplementation(() => false);
      fireEvent.focus(link);
      expect(link.style.outline).toBe('');
    });

    it('darkens the plain stroke and lifts on mouse hover', () => {
      render(
        <Card asChild>
          <a href="/x">x</a>
        </Card>,
      );
      const link = screen.getByRole('link');
      const stroke = () => link.querySelector('svg path:last-of-type')?.getAttribute('stroke');
      expect(stroke()).toContain('var(--comp-card-stroke-default');
      fireEvent.pointerEnter(link, { pointerType: 'mouse' });
      expect(stroke()).toContain('var(--comp-card-stroke-hover');
      expect(link.style.transform).toContain('translateY');
      fireEvent.pointerLeave(link, { pointerType: 'mouse' });
      expect(stroke()).toContain('var(--comp-card-stroke-default');
    });

    it('keeps the child handlers and style, and the card decorations, on paper variants', () => {
      // Prevent default so jsdom does not attempt a navigation.
      const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
      render(
        <Card asChild variant="lined" fastener="pin">
          <a href="/x" onClick={onClick} style={{ margin: '0px' }}>
            x
          </a>
        </Card>,
      );
      const link = screen.getByRole('link');
      fireEvent.click(link);
      expect(onClick).toHaveBeenCalled();
      expect(link.style.margin).toBe('0px');
      expect(link.querySelector('[data-card-margin-line]')).not.toBeNull();
      expect(link.querySelector('svg')).not.toBeNull();
      fireEvent.pointerEnter(link, { pointerType: 'mouse' });
      expect(link.style.boxShadow).toContain('var(--comp-card-hover-shadow');
    });
  });

  describe('switching variant at runtime', () => {
    it('keeps child state, DOM nodes and focus across variants', () => {
      const ui = (variant: CardVariant, fastener: 'none' | 'pin' = 'none') => (
        <Card variant={variant} fastener={fastener} data-testid="c">
          <Counter />
          <input aria-label="note" />
        </Card>
      );
      const { rerender } = render(ui('plain'));
      const root = screen.getByTestId('c');
      fireEvent.click(screen.getByRole('button'));
      const input = screen.getByRole('textbox') as HTMLInputElement;
      input.value = 'draft';
      input.focus();

      for (const [variant, fastener] of [
        ['sticky', 'pin'],
        ['lined', 'none'],
        ['plain', 'pin'],
        ['plain', 'none'],
      ] as const) {
        rerender(ui(variant, fastener));
        expect(screen.getByTestId('c')).toBe(root);
        expect(screen.getByRole('button')).toHaveTextContent('count 1');
        expect(screen.getByRole('textbox')).toBe(input);
        expect(input.value).toBe('draft');
        expect(document.activeElement).toBe(input);
      }
    });
  });
});

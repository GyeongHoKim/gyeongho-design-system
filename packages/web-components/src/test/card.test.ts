import { afterEach, describe, expect, it } from 'vitest';
import { GhCard } from '../components/card.js';
import { cleanup, mount, setSize } from './fixture.js';

describe('gh-card', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-card')).toBe(GhCard);
  });

  it('renders slotted content inside the surface', async () => {
    const el = await mount(new GhCard());
    el.innerHTML = '<p>Body</p>';
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.content slot')).not.toBeNull();
    expect(el.textContent).toContain('Body');
  });

  it('draws only an outline when flat (no shadow paths)', async () => {
    const el = await mount(new GhCard());
    await setSize(el, 240, 160);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length).toBeGreaterThan(0);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-shadow').length).toBe(0);
  });

  it('emits sketch shadow paths when elevated', async () => {
    const el = await mount(new GhCard());
    el.elevated = true;
    await el.updateComplete;
    await setSize(el, 240, 160);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-shadow').length).toBeGreaterThan(0);
  });

  it('reflects the elevated attribute', async () => {
    const el = await mount(new GhCard());
    el.elevated = true;
    await el.updateComplete;
    expect(el.hasAttribute('elevated')).toBe(true);
  });

  it('accepts an accessible label without error', async () => {
    const el = await mount(new GhCard());
    el.label = 'Profile';
    await el.updateComplete;
    expect(el.label).toBe('Profile');
  });

  describe('paper variants', () => {
    const cssText = (): string =>
      [GhCard.styles]
        .flat(Infinity)
        .map((r) => (r as { cssText: string }).cssText)
        .join('\n');

    it('defaults to plain/neutral/none/none and reflects attributes', async () => {
      const el = await mount(new GhCard());
      expect(el.variant).toBe('plain');
      expect(el.tone).toBe('neutral');
      expect(el.fastener).toBe('none');
      expect(el.tilt).toBe('none');
      expect(el.interactive).toBe(false);
      el.variant = 'lined';
      el.tone = 'warning';
      el.fastener = 'pin';
      el.tilt = 'left';
      el.interactive = true;
      await el.updateComplete;
      expect(el.getAttribute('variant')).toBe('lined');
      expect(el.getAttribute('tone')).toBe('warning');
      expect(el.getAttribute('fastener')).toBe('pin');
      expect(el.getAttribute('tilt')).toBe('left');
      expect(el.hasAttribute('interactive')).toBe(true);
    });

    it.each(['sticky', 'lined'] as const)('%s renders no sketch outline', async (variant) => {
      const el = await mount(new GhCard());
      el.variant = variant;
      await el.updateComplete;
      await setSize(el, 240, 160);
      expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length).toBe(0);
    });

    it('renders an unknown variant as plain', async () => {
      const el = await mount(new GhCard());
      el.setAttribute('variant', 'foo');
      await el.updateComplete;
      await setSize(el, 240, 160);
      expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length).toBeGreaterThan(0);
    });

    it('elevated on a paper variant draws no sketch shadow', async () => {
      const el = await mount(new GhCard());
      el.variant = 'sticky';
      el.elevated = true;
      await el.updateComplete;
      await setSize(el, 240, 160);
      expect(el.shadowRoot?.querySelectorAll('path.sketch-shadow').length).toBe(0);
    });

    it('styles sticky tone backgrounds from tokens', () => {
      expect(cssText()).toContain(":host([variant='sticky'][tone='warning']) .content");
      expect(cssText()).toContain('var(--comp-card-sticky-bg-warning)');
      expect(cssText()).toContain('var(--comp-card-lined-bg)');
    });

    it('renders an aria-hidden tape mark', async () => {
      const el = await mount(new GhCard());
      el.fastener = 'tape';
      await el.updateComplete;
      const tape = el.shadowRoot?.querySelector('.fastener-tape');
      expect(tape?.getAttribute('aria-hidden')).toBe('true');
    });

    it('renders an aria-hidden pin svg', async () => {
      const el = await mount(new GhCard());
      el.fastener = 'pin';
      await el.updateComplete;
      const pin = el.shadowRoot?.querySelector('svg.fastener-pin');
      expect(pin?.getAttribute('aria-hidden')).toBe('true');
      expect(pin?.getAttribute('focusable')).toBe('false');
      expect(pin?.getAttribute('viewBox')).toBe('0 0 28 30');
    });

    it('draws the pin highlight with its own opacity token', () => {
      expect(cssText()).toMatch(
        /\.pin-highlight\s*{[^}]*fill-opacity: var\(--comp-card-fastener-pin-highlightOpacity\)/,
      );
    });

    it('paints the fastener after the sketch so the outline never covers it', async () => {
      const el = await mount(new GhCard());
      el.fastener = 'pin';
      await el.updateComplete;
      const sketch = el.shadowRoot?.querySelector('svg.sketch');
      const pin = el.shadowRoot?.querySelector('svg.fastener-pin');
      expect(sketch).not.toBeNull();
      expect(sketch?.compareDocumentPosition(pin as Node)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('renders no fastener by default', async () => {
      const el = await mount(new GhCard());
      expect(el.shadowRoot?.querySelector('.fastener-tape, .fastener-pin')).toBeNull();
    });

    it('draws the lined margin line as an aria-hidden element on the inline-start edge', async () => {
      const el = await mount(new GhCard());
      expect(el.shadowRoot?.querySelector('.margin-line')).toBeNull();
      el.variant = 'lined';
      await el.updateComplete;
      const line = el.shadowRoot?.querySelector('.content > .margin-line');
      expect(line?.getAttribute('aria-hidden')).toBe('true');
      // Positioned siblings paint in DOM order, so `.body` must come after the line.
      expect(line?.nextElementSibling?.classList.contains('body')).toBe(true);
      expect(cssText()).toMatch(
        /\.margin-line\s*{[^}]*inset-inline-start: var\(--comp-card-lined-margin-offset\)/,
      );
      // The rules gradient is the only background image; the margin is no longer painted there.
      expect(cssText()).not.toMatch(/linear-gradient\(\s*90deg/);
      el.variant = 'sticky';
      await el.updateComplete;
      expect(el.shadowRoot?.querySelector('.margin-line')).toBeNull();
    });

    it('lifts when the host itself is focused', async () => {
      const css = cssText();
      expect(css).toContain(':host([interactive]:focus-within) .content');
      expect(css).toMatch(
        /:host\(\[interactive\]\[variant='sticky'\]:focus-within\) \.content,\s*:host\(\[interactive\]\[variant='lined'\]:focus-within\) \.content\s*{[^}]*box-shadow: var\(--comp-card-hover-shadow\)/,
      );
      const el = await mount(new GhCard());
      el.interactive = true;
      el.tabIndex = 0;
      await el.updateComplete;
      el.focus();
      expect(document.activeElement).toBe(el);
      expect(el.matches(':focus-within')).toBe(true);
      // The rule above is what lifts it: the inner `.content` does not match on host focus.
      expect(el.shadowRoot?.querySelector('.content')?.matches(':focus-within')).toBe(false);
    });

    it('declares interactive lift rules', () => {
      const css = cssText();
      expect(css).toContain('@media (hover: hover)');
      expect(css).toContain(':host([interactive]) .content:hover');
      expect(css).toContain(':host([interactive]) .content:focus-within');
      expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*{[^}]*transition: none/);
    });
  });
});
